declare module 'react-google-recaptcha' {
  import * as React from 'react';

  interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    onExpired?: () => void;
    onErrored?: () => void;
    size?: 'compact' | 'normal' | 'invisible';
    theme?: 'light' | 'dark';
    tabindex?: number;
    hl?: string;
    badge?: 'bottomright' | 'bottomleft' | 'inline';
    'data-theme'?: string;
    [key: string]: any;
  }

  const ReCAPTCHA: React.ComponentType<ReCAPTCHAProps>;
  export default ReCAPTCHA;
}
