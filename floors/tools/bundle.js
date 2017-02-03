/**
 * o.e.kurgaev@it.etagi.com
 */

import webpack from 'webpack';
import webpackConfig from './webpack.config';
import vendorsConfig from './vendor.webpack.config';

/*
 * Bundles JavaScript, CSS and images into one or more packages
 * ready to be used in a browser.
 */
function bundle(vendors = process.argv.includes('vendors')) {
  return new Promise((resolve, reject) => {
    webpack(vendors ? vendorsConfig : webpackConfig).run((err, stats) => {
      if(err) {
        return reject(err);
      }

      console.log(stats.toString(webpackConfig[0].stats));
      return resolve();
    });
  });
}

export default bundle;
