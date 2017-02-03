/**
 * Gallery Uploader File component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import UInput from '../UInput';
import UFileUploader from '../UFileUploader';
import UValidator from '../UValidator';
import {rulesUploaderFile} from './validationRules';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './GalleryUploaderFile.scss';

const GalleryUploaderFile = ({
  context, objectName
}) => {

  return (
    <div className={s.root}>
      <div className={s.title}>Загрузите фото</div>
      <div className={s.form} id={`${objectName}-file`}>
        <UFileUploader
          mountNode={`${objectName}-file`}
          context={context}
          objectName={objectName}
          fieldName='file'
          dir='gallery'
          className={s.fileUploader}
          label='Перетащите сюда фотографию чтобы загрузить ее'
          buttonLabel='Загрузить фото'
          buttonLoaded='Сменить фото'
          staticHelp='Объем загружаемого фото до 15Мб в формате JPG или PNG'
          helpOnDrag='Перетащить и отпустить'
          fileTypes={['.png', '.jpg']}
          fileMaxSize={15000000}
          mode='dropAreaWithButton'
          viewEnabled={false}
          viewInBlock={true}/>
        <UInput
          mountNode={`${objectName}-file`}
          context={context}
          objectName={objectName}
          fieldName='desc'
          className={s.description}
          placeholder='Напишите небольшую историю об этой фотографии'
          refreshOn='change'
          maxLength={1000}
          rows={5}/>
        <UValidator
          context={context}
          objectName={objectName}
          validateOnChange={false}
          blockHeight={-1}
          displayErrors='disabled'
          dumpToConsole={false}
          rules={rulesUploaderFile}/>
      </div>
    </div>
  );
};

GalleryUploaderFile.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  objectName: PropTypes.string
};

export default withStyles(s)(GalleryUploaderFile);
