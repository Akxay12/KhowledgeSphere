// Google Identity Services (OAuth 2.0) Helper for KnowledgeSphere

/**
 * Dynamically loads the Google Identity Services SDK script if not already present
 */
export function loadGoogleGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      if (window.google?.accounts) {
        resolve(window.google);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google));
        existingScript.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services SDK loaded but window.google is undefined'));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Initiates the real Google OAuth Popup flow using Google Identity Services.
 * Returns a promise resolving with the Google User profile details.
 */
export async function signInWithGoogle(customClientId) {
  await loadGoogleGsiScript();

  const clientId =
    customClientId ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '1013482746192-knowledgesphere.apps.googleusercontent.com';

  return new Promise((resolve, reject) => {
    try {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid profile email',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'access_denied' || tokenResponse.error === 'popup_closed') {
                reject(new Error('AUTHENTICATION_CANCELLED'));
              } else {
                reject(new Error(`Google authentication failed: ${tokenResponse.error}`));
              }
              return;
            }

            if (!tokenResponse.access_token) {
              reject(new Error('AUTHENTICATION_FAILED'));
              return;
            }

            try {
              // Retrieve official Google profile via userinfo API endpoint
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                throw new Error('NETWORK_ERROR');
              }

              const userInfo = await res.json();

              resolve({
                googleId: userInfo.sub,
                fullName: userInfo.name || 'KnowledgeSphere Scholar',
                email: userInfo.email,
                picture: userInfo.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
                accessToken: tokenResponse.access_token,
                idToken: tokenResponse.id_token || null,
                emailVerified: userInfo.email_verified || true
              });
            } catch (err) {
              reject(new Error('NETWORK_ERROR'));
            }
          },
          error_callback: (err) => {
            if (err?.type === 'popup_closed') {
              reject(new Error('AUTHENTICATION_CANCELLED'));
            } else {
              reject(new Error('AUTHENTICATION_FAILED'));
            }
          },
        });

        // Prompt account selection popup
        client.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.id) {
        // Fallback for ID Token One-Tap / Credential response
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              reject(new Error('AUTHENTICATION_FAILED'));
              return;
            }
            try {
              // Parse JWT token
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);

              resolve({
                googleId: payload.sub,
                fullName: payload.name || 'KnowledgeSphere Scholar',
                email: payload.email,
                picture: payload.picture,
                idToken: response.credential,
                accessToken: null,
                emailVerified: payload.email_verified || true
              });
            } catch (e) {
              reject(new Error('AUTHENTICATION_FAILED'));
            }
          }
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('AUTHENTICATION_CANCELLED'));
          }
        });
      } else {
        reject(new Error('GOOGLE_SDK_UNAVAILABLE'));
      }
    } catch (err) {
      reject(err);
    }
  });
}
