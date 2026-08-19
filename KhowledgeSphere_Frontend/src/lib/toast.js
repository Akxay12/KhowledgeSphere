/**
 * Lightweight browser toast utility for showing non-blocking notifications.
 * Renders a clean, modern floating message.
 */
export function showToast(message) {
  // Ensure we are in a browser environment
  if (typeof document === 'undefined') return;

  // Retrieve or construct toast container
  let container = document.getElementById('knowledgesphere-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'knowledgesphere-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    document.body.appendChild(container);
  }

  // Create toast notification card
  const toast = document.createElement('div');
  toast.style.cssText = `
    background-color: #0f172a;
    color: #ffffff;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    transform: translateY(24px);
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
    border: 1px solid rgba(255, 255, 255, 0.08);
  `;
  
  // Clean warning indicator icon
  const icon = document.createElement('span');
  icon.innerHTML = '⚠️';
  icon.style.display = 'inline-flex';
  
  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(textSpan);
  container.appendChild(toast);

  // Trigger animation in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 15);

  // Trigger animation out and cleanup
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-24px)';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 350);
  }, 3200);
}
