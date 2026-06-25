/**
 * Loads the Google Identity Services client script exactly once and resolves
 * with the `google.accounts.id` API.
 */

const GSI_SRC = 'https://accounts.google.com/gsi/client';

let loader: Promise<void> | null = null;

export function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );

    const onLoad = () => resolve();
    const onError = () => {
      loader = null;
      reject(new Error('Failed to load Google Identity Services'));
    };

    if (existing) {
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.head.appendChild(script);
  });

  return loader;
}
