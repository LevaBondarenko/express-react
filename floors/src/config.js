/*
 * config vars
 * o.e.kurgaev@it.etagi.com
 */

export const port = process.env.PORT || 3000;

export const env = process.env.NODE_ENV || 'production';

export const gzip = {level: 7};

// configure proxy middleware context
export const context = ['/backend/', '/msearcher_ajax.php', '/wp-content/'];

// configure proxy middleware options
export const domain = 'http://www.etagi.dev';

export const options = {
  target: domain,
  changeOrigin: true,
  ws: true,
  proxyTable: {
    'localhost:3000': domain,
    'localhost:3001': domain
  }
};

export const hlm = {
  frameguard: false
};

(env === 'development' || process.argv.includes('ignoressl')) &&
  (process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0');
