import { loadCSS, loadJS } from 'markmap-common';
import { Transformer } from 'markmap-lib';
import * as markmap from 'markmap-view';

export const transformer = new Transformer();

// Get assets for markmap
const { scripts, styles } = transformer.getAssets();

// Check if window is defined (for SSR compatibility)
if (typeof window !== 'undefined') {
  loadCSS(styles);
  loadJS(scripts, { getMarkmap: () => markmap });
} 