/**
 * o.e.kurgaev@it.etagi.com
 */


import run from './run';
import clean from './clean';
import copy from './copy';
import bundle from './bundle';
import styles from './styles';
import copyCss from './copyCss';

/*
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
async function build() {
  await run(clean);
  await run(copy.bind(undefined, {watch: false}));
  await run(styles);
  await run(bundle);
  await run(copyCss);
}

export default build;
