export type CredentialResponse = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback?: (response: CredentialResponse) => void; auto_select: boolean; ux_mode?: 'popup' | 'redirect'; login_uri?: string }) => void;
      renderButton: (element: HTMLElement, options: { type: string; theme: string; size: string; shape: string; width: number }) => void;
      disableAutoSelect: () => void;
    };
  };
};

declare global {
  interface Window { google?: GoogleIdentity }
}

let scriptPromise: Promise<GoogleIdentity> | null = null;
let configuredKey: string | null = null;
let currentCallback: ((response: CredentialResponse) => void) | null = null;

export function initializeGoogleIdentity(
  google: GoogleIdentity,
  clientId: string,
  mode: 'popup' | 'redirect',
  callback: ((response: CredentialResponse) => void) | null,
) {
  currentCallback = callback;
  const loginUri = `${window.location.origin}/api/auth/google-redirect`;
  const key = `${clientId}:${mode}:${mode === 'redirect' ? loginUri : ''}`;
  if (configuredKey === key) return;
  google.accounts.id.initialize(mode === 'redirect' ? {
    client_id: clientId,
    auto_select: false,
    ux_mode: 'redirect',
    login_uri: loginUri,
  } : {
    client_id: clientId,
    auto_select: false,
    callback: (response) => currentCallback?.(response),
  });
  configuredKey = key;
}

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts.id) return Promise.resolve(window.google);
  if (scriptPromise) return scriptPromise;
  const loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => window.google?.accounts.id ? resolve(window.google) : reject(new Error('Google sign-in did not load.'));
    script.onerror = () => reject(new Error('Google sign-in could not load. Check your connection.'));
    document.head.appendChild(script);
  });
  scriptPromise = loading.catch((error) => { scriptPromise = null; throw error; });
  return scriptPromise;
}
