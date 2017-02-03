/**
 * o.e.kurgaev@it.etagi.com
 */

import webpack from 'webpack';
import vendorsConfig from './vendor.webpack.config';

/*
 * Bundles JavaScript vendors into one package
 * ready to be used in a browser.
 */
function vendors() {
  return new Promise((resolve, reject) => {
    webpack(vendorsConfig).run((err, stats) => {
      if(err) {
        return reject(err);
      }

      console.log(stats.toString(vendorsConfig.stats));
      return resolve();
    });
  });
}

export default vendors;
