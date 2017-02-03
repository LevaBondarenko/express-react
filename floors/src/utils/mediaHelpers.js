/**
 * media url manipulation methods
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import {includes} from 'lodash';

const mediaHelpers = {
  /**
   * [getApiMediaUrl preparing url of media from api-media.etagi.com]
   * @param  {string} size - type {240160|100100|320240|300267|640480|1024768|12801024|content}
   * @param  {string} type - type {photos|layouts|3d_tours|attach|commerce_layouts|newhouses|no_photo}
   * @param  {string} file - filename (can be given in full path format, in that case will be used only filename)
   * @param  {int} source - id of source (1 = api-media.etagi.com, 2 = cdn-media.etagi.com, 3 = media.etagi.com default = api-media.etagi.com)
   * @return {string} return formatted url for media
   */
  getApiMediaUrl(size, type, file, source = 1) {
    const sizes = [
      '240160',
      '100100',
      '128128',
      '160160',
      '240320',
      '255172',
      '320240',
      '300267',
      '640480',
      '1024768',
      '12801024',
      'content',
      'site',
      'lk'
    ];
    const types = [
      'static',
      'media',
      'media/lk',
      'media/gallery',
      'media/site',
      'photos',
      'layouts',
      '3d_tours',
      '3d_tours_new',
      'profile',
      'attach',
      'commerce_layouts',
      'newhouses',
      'no_photo',
      'builders',
      'banks',
      ''
    ];

    if(!includes(sizes, size) || !includes(types, type)) {
      throw ('Error in size or type of media');
    }

    const filename = mediaHelpers.getFilename(
      file,
      (size === 'site' || size === 'lk') ? `${size}/` : '/'
    );
    let host;
    let dir = type;

    switch (source) {
    case 1 : host = 'api-media.etagi.com'; break;
    case 2 : host = 'cdn-media.etagi.com'; break;
    case 3 : host = 'api-media.novoe.od.ua'; break;
    default : host = 'api-media.etagi.com'; break;
    }
    if(dir.indexOf('media/') === 0 || dir.indexOf('static') === 0) {
      const imgSymbols = file.toString().substr(0, 2);

      dir = `${dir}/${imgSymbols[0]}/${imgSymbols}`;
    }

    return filename !== 'no_photo' ?
      `//${host}/${size}/${dir}${dir ? '/' : ''}${filename}${type === '3d_tours_new' ? '/' : ''}` : //eslint-disable-line max-len
      `//${host}/content/no_photo/${type === 'profile' ? 'profile' : 'photos'}.png`; //eslint-disable-line max-len
  },
  /**
   * [getAgavaUrl preparing url of media from api-media.etagi.com]
   * @param  {string} width - width of media
   * @param  {string} height - height of media
   * @param  {string} type - type {photos|layouts}
   * @param  {int} resize - need resize
   * @param  {int} crop - need crop
   * @param  {int} watermark - need watermark
   * @param  {string} file - filename (can be given in full path format, in that case will be used only filename)
   * @return {string} return formatted url for media
   */
  getAgavaUrl(width, height, type, resize, crop, watermark, file) {
    const types = ['photos', 'layouts'];
    const filename = mediaHelpers.getFilename(file);

    if(!includes(types, type)) {
      throw ('Error in type of media');
    }
    return `//agava.etagi.com/${type}/${width}/${height}/0/${crop}/${resize}/0/${watermark}/10/0/${filename}`; // eslint-disable-line max-len
  },
  /**
   * [getFilename get filename from path]
   * @param  {string} path - path, can be filename
   * @param  {string} divider - divider
   * @return {string} return filename
   */
  getFilename(path, divider = '/') {
    if(path && path.indexOf(divider) !== -1) {
      const filename = path.split(divider);

      return filename[filename.length - 1];
    } else {
      return path;
    }
  }
};

export default mediaHelpers;
