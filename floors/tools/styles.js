/**
 * o.e.kurgaev@it.etagi.com
 */
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import fs from './lib/fs';


async function styles() {
  sass.render({
    file: './src/styles/main.scss',
    outputStyle: 'compressed',
    outFile: './build/public/main.css',
    sourceMap: true
  }, (error, result) => {
    if(!error) {
      postcss([autoprefixer]).process(result.css).then(result => {
        result.warnings().forEach(warn => {
          console.log(warn.toString());
        });
        fs.writeFile('./build/public/main.css', result.css);
        fs.writeFile('./build/public/main.css.map', result.map);
      });
    } else {
      console.log(error.toString());
    }
  });
  sass.render({
    file: './src/styles/mobile.scss',
    outputStyle: 'compressed',
    outFile: './build/public/mobile.css',
    sourceMap: true
  }, (error, result) => {
    if(!error) {
      postcss([autoprefixer]).process(result.css).then(result => {
        result.warnings().forEach(warn => {
          console.log(warn.toString());
        });
        fs.writeFile('./build/public/mobile.css', result.css);
        fs.writeFile('./build/public/mobile.css.map', result.map);
      });
    } else {
      console.log(error.toString());
    }
  });
}

export default styles;
