// Browser-native IndexedDB helper for robust, quota-safe storage of published research papers and their large assets
const DB_NAME = 'KnowledgeSphereDB';
const DB_VERSION = 1;

let dbInstance = null;

// Helper to convert Base64 string to a native Blob object
function base64ToBlob(base64Data) {
  if (!base64Data || !base64Data.startsWith('data:')) return null;
  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    console.error('Failed to convert base64 to Blob', err);
    return null;
  }
}

// Initialize the database connection
export function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('papers')) {
        db.createObjectStore('papers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
    };
  });
}

// Deeply resolve asset:// URLs in a paper object using the assets object store
async function resolvePaperAssets(paper, assetsStore) {
  const paperCopy = JSON.parse(JSON.stringify(paper));

  const fetchAssetUrl = (assetUrl) => {
    if (assetUrl && assetUrl.startsWith('asset://')) {
      const assetId = assetUrl.replace('asset://', '');
      return new Promise((resolveAsset) => {
        const getReq = assetsStore.get(assetId);
        getReq.onsuccess = (ev) => {
          const assetObj = ev.target.result;
          if (assetObj && assetObj.blob) {
            const objectUrl = URL.createObjectURL(assetObj.blob);
            resolveAsset(objectUrl);
          } else {
            resolveAsset('');
          }
        };
        getReq.onerror = () => {
          resolveAsset('');
        };
      });
    }
    return Promise.resolve(assetUrl);
  };

  // 1. Resolve coverImage
  if (paperCopy.coverImage && paperCopy.coverImage.startsWith('asset://')) {
    paperCopy.coverImage = await fetchAssetUrl(paperCopy.coverImage);
  }

  // 2. Resolve blocks
  if (paperCopy.blocks && Array.isArray(paperCopy.blocks)) {
    const resolvedBlocks = [];
    for (const block of paperCopy.blocks) {
      if (block.type === 'image' && block.src && block.src.startsWith('asset://')) {
        const resolvedSrc = await fetchAssetUrl(block.src);
        resolvedBlocks.push({ ...block, src: resolvedSrc });
      } else {
        resolvedBlocks.push(block);
      }
    }
    paperCopy.blocks = resolvedBlocks;
    paperCopy.content = JSON.stringify(resolvedBlocks);
  }

  // 3. Resolve docReferences
  if (paperCopy.docReferences && Array.isArray(paperCopy.docReferences)) {
    const resolvedRefs = [];
    for (const ref of paperCopy.docReferences) {
      if (ref.fileData && ref.fileData.startsWith('asset://')) {
        const resolvedData = await fetchAssetUrl(ref.fileData);
        resolvedRefs.push({ ...ref, fileData: resolvedData });
      } else {
        resolvedRefs.push(ref);
      }
    }
    paperCopy.docReferences = resolvedRefs;
  }

  return paperCopy;
}

// Save a research paper with its assets split out and stored as native Blobs
export async function savePaper(paper) {
  const db = await initDB();
  
  const paperCopy = JSON.parse(JSON.stringify(paper));
  const assetsToSave = [];

  const extractAsset = (dataUrl, prefix) => {
    if (dataUrl && dataUrl.startsWith('data:')) {
      const blob = base64ToBlob(dataUrl);
      if (blob) {
        const assetId = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        assetsToSave.push({ id: assetId, blob });
        return `asset://${assetId}`;
      }
    }
    return dataUrl;
  };

  // 1. Extract coverImage if base64
  if (paperCopy.coverImage) {
    paperCopy.coverImage = extractAsset(paperCopy.coverImage, 'cover');
  }

  // 2. Extract images from blocks if base64
  if (paperCopy.blocks && Array.isArray(paperCopy.blocks)) {
    paperCopy.blocks = paperCopy.blocks.map((block) => {
      if (block.type === 'image' && block.src) {
        return {
          ...block,
          src: extractAsset(block.src, `block-${block.id || 'img'}`),
        };
      }
      return block;
    });
    paperCopy.content = JSON.stringify(paperCopy.blocks);
  }

  // 3. Extract reference files if base64
  if (paperCopy.docReferences && Array.isArray(paperCopy.docReferences)) {
    paperCopy.docReferences = paperCopy.docReferences.map((ref, idx) => {
      if (ref.fileData) {
        return {
          ...ref,
          fileData: extractAsset(ref.fileData, `ref-${idx}`),
        };
      }
      return ref;
    });
  }

  // Perform transaction with transaction-level rollback
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['papers', 'assets'], 'readwrite');
    const papersStore = tx.objectStore('papers');
    const assetsStore = tx.objectStore('assets');

    const handleLimitError = () => {
      reject(new Error("Storage limit reached. Please upload smaller media files or use external storage. Your research content has not been modified."));
    };

    tx.onerror = (event) => {
      const error = event.target.error;
      console.error('Transaction error:', error);
      if (error && (error.name === 'QuotaExceededError' || error.message.includes('quota') || error.message.includes('Quota'))) {
        handleLimitError();
      } else {
        reject(error || new Error("Failed to save publication."));
      }
    };

    tx.onabort = () => {
      handleLimitError();
    };

    tx.oncomplete = () => {
      resolve(paperCopy);
    };

    // Save assets
    for (const asset of assetsToSave) {
      try {
        assetsStore.put(asset);
      } catch (err) {
        console.error('Failed to store asset:', err);
        tx.abort();
        return;
      }
    }

    // Save paper
    try {
      papersStore.put(paperCopy);
    } catch (err) {
      console.error('Failed to store paper:', err);
      tx.abort();
    }
  });
}

// Retrieve a single paper and dynamically resolve all its asset links
export async function getPaper(id) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['papers', 'assets'], 'readonly');
    const papersStore = tx.objectStore('papers');
    const assetsStore = tx.objectStore('assets');

    const request = papersStore.get(id);

    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = async (e) => {
      const paper = e.target.result;
      if (!paper) {
        resolve(null);
        return;
      }

      try {
        const resolvedPaper = await resolvePaperAssets(paper, assetsStore);
        resolve(resolvedPaper);
      } catch (err) {
        console.error('Failed to resolve paper assets:', err);
        resolve(paper);
      }
    };
  });
}

// Retrieve all custom papers and dynamically resolve all their asset links
export async function getPapers() {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['papers', 'assets'], 'readonly');
    const papersStore = tx.objectStore('papers');
    const assetsStore = tx.objectStore('assets');

    const request = papersStore.getAll();

    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = async (e) => {
      const papers = e.target.result || [];
      const resolvedList = [];
      for (const paper of papers) {
        try {
          const resolved = await resolvePaperAssets(paper, assetsStore);
          resolvedList.push(resolved);
        } catch (err) {
          console.error('Failed to resolve paper assets in list:', err);
          resolvedList.push(paper);
        }
      }
      resolve(resolvedList);
    };
  });
}

// Delete a custom paper and its associated assets
export async function deletePaper(id) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['papers', 'assets'], 'readwrite');
    const papersStore = tx.objectStore('papers');
    const assetsStore = tx.objectStore('assets');

    tx.onerror = (e) => reject(e.target.error);

    const getReq = papersStore.get(id);
    getReq.onerror = (e) => reject(e.target.error);
    getReq.onsuccess = (e) => {
      const paper = e.target.result;
      if (!paper) {
        resolve();
        return;
      }

      const assetsToDelete = [];
      if (paper.coverImage && paper.coverImage.startsWith('asset://')) {
        assetsToDelete.push(paper.coverImage.replace('asset://', ''));
      }
      if (paper.blocks) {
        for (const b of paper.blocks) {
          if (b.type === 'image' && b.src && b.src.startsWith('asset://')) {
            assetsToDelete.push(b.src.replace('asset://', ''));
          }
        }
      }
      if (paper.docReferences) {
        for (const r of paper.docReferences) {
          if (r.fileData && r.fileData.startsWith('asset://')) {
            assetsToDelete.push(r.fileData.replace('asset://', ''));
          }
        }
      }

      // Perform deletion of the paper
      papersStore.delete(id);

      // Delete all extracted native blob assets
      for (const assetId of assetsToDelete) {
        assetsStore.delete(assetId);
      }
    };

    tx.oncomplete = () => resolve();
  });
}
