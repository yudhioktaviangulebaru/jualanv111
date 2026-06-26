/**
 * Minimal type declarations for Google Identity Services (GIS).
 * Loaded from https://accounts.google.com/gsi/client
 * Docs: https://developers.google.com/identity/gsi/web/reference/js-reference
 */

export interface CredentialResponse {
  /** A JWT ID token. Send this to the backend as `id_token`. */
  credential: string;
  select_by?: string;
}

interface IdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize(config: IdConfiguration): void;
  renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
  prompt(): void;
  disableAutoSelect(): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}
