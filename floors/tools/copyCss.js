/**
 * denis.zemlyanov@it.etagi.com
 */

/*
 * Copies static files [name].css to [name].[chunk].css
 */
import Promise from 'bluebird';
import fs from 'fs';

async function copyCss() {
  const assetsFile = 'build/assets.json';
  const assets = process.argv.includes('release') ?
    JSON.parse(fs.readFileSync(assetsFile, 'utf8')) : false;

  if(assets) {
    const copies = [];
    const ncp = Promise.promisify(require('ncp'));

    Object.keys(assets).forEach(name => {
      const nameArr = assets[name].js.split('.');
      const chunk = nameArr[nameArr.length - 2];

      copies.push(
        ncp(`build/public/${name}.css`, `build/public/${name}.${chunk}.css`)
      );
    });

    await Promise.all(copies);
  }
};

export default copyCss;
