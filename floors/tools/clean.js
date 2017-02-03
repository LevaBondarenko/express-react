/**
 * o.e.kurgaev@it.etagi.com
 */

import del from 'del';
import fs from './lib/fs';

/*
 * Cleans up the output (build) directory.
 */
async function clean() {
  await del(['.tmp', 'build/*', '!build/.git', '!build/vendors'], {dot: true});
  await fs.makeDir('build/public');
  await fs.makeDir('build/public/fonts');
}

export default clean;
