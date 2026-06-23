import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        loading?: 'lazy' | 'eager';
        'shadow-intensity'?: string | number;
        'shadow-softness'?: string | number;
        exposure?: string | number;
        'interaction-prompt'?: string;
        'ar'?: boolean;
        'ar-modes'?: string;
        style?: React.CSSProperties;
        onError?: () => void;
        onLoad?: () => void;
      }, HTMLElement>;
    }
  }
}
