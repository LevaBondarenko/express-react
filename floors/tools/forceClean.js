/**
 * o.e.kurgaev@it.etagi.com
 */

import del from 'del';
import fs from './lib/fs';

/*
 * Force clean up the output (build) directory.
 */
async function forceClean() {
  await del(['.tmp', 'build/*', '!build/.git'], {dot: true});
  await fs.makeDir('build/public');
}

export default forceClean;
