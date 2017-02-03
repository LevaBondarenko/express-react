/**
 * o.e.kurgaev@it.etagi.com
 */

import path from 'path';
import Promise from 'bluebird';
import fs from './lib/fs';
import pkg from '../package.json';
import gaze from 'gaze';

/*
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy({watch} = {}) {
  const ncp = Promise.promisify(require('ncp'));

  await Promise.all([
    ncp('src/content', 'build/public'),
    ncp('package.json', 'build/package.json'),
    ncp('node_modules/bootstrap-sass/assets/fonts/bootstrap/',
    'build/public/fonts'),
    ncp('node_modules/font-awesome/fonts/', 'build/public/fonts'),
    ncp('node_modules/select2/dist/js/select2.full.min.js',
      'build/public/select2.min.js'),
    ncp('node_modules/select2/dist/css/select2.min.css',
      'build/public/select2.min.css')
  ]);

  await fs.writeFile('./build/package.json', JSON.stringify({
    private: true,
    engines: pkg.engines,
    dependencies: pkg.dependencies,
    scripts: {
      start: 'node server.js',
    },
  }, null, 2));

  if(watch) {
    const watcher = await new Promise((resolve, reject) => {
      gaze(
        'src/content/**/*.*', (err, val) => err ? reject(err) : resolve(val)
      );
    });
    const cp = async (file) => {
      const relPath = file.substr(
        path.join(__dirname, '../src/content/').length
      );

      await ncp(`src/content/${relPath}`, `build/content/${relPath}`);
    };

    watcher.on('changed', cp);
    watcher.on('added',   cp);
  }
};

export default copy;
