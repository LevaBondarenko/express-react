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

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import GalleryViewerSocials from '../GalleryViewer/GalleryViewerSocials';

import s from './GalleryUploaderFinal.scss';

const GalleryUploaderFinal = ({
  finalImage, finalBlock1, finalBlock2, loadedId, item, gaEvent
}) => {
  const rightBlock = finalBlock1 ?
    finalBlock1.replace('${loadedId}', loadedId) : finalBlock1;
  const description = 'Я участвую в конкурсе “Всей семьей к Деду морозу” Поставьте лайк за мою фотографию перейдя по ссылке. %23этажи_новыйгод %23отправляемся_в_сказку %23встретимся_в_устюге'; //eslint-disable-line max-len

  return (
    <div className={s.root}>
      <div className={s.blockWithImage}>
        <div className={s.image}>
          <img src={finalImage}/>
        </div>
        <div className={s.rightBlock}>
          <div dangerouslySetInnerHTML={{__html: rightBlock}}/>
          <div className={s.share}>
            <GalleryViewerSocials
              item={item}
              gaEvent={gaEvent}
              description={description}/>
          </div>
        </div>
      </div>
      <div
        className={s.footerBlock}
        dangerouslySetInnerHTML={{__html: finalBlock2}}/>
    </div>
  );
};

GalleryUploaderFinal.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  finalImage: PropTypes.string,
  finalBlock1: PropTypes.string,
  finalBlock2: PropTypes.string,
  loadedId: PropTypes.number,
  item: PropTypes.object,
  gaEvent: PropTypes.string
};

export default withStyles(s)(GalleryUploaderFinal);
