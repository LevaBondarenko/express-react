import React, {PropTypes} from 'react';

import classNames from 'classnames';
import {declOfNum} from '../../utils/Helpers';
import Image from '../../shared/Image';
import s from './GalleryViewer.scss';
import GalleryViewerSocials from './GalleryViewerSocials';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const GalleryViewerDetailed = (props) => {
  const {
    itemToggle, itemVote, item, gaEvent
  } = props;
  const {
    user_data: {i, city}, votes_up: votesUp, votes_user: votesUser, id, photo,
    hash, description
  } = item;
  const votesDecl = votesUp > 0 ?
    declOfNum(votesUp, ['голос', 'голоса', 'голосов']) : '';
  const fileName = (/.*\/(.*)$/).exec(photo);
  const imageProps = {
    image: !fileName || !fileName[1] ?
      '//cdn-media.etagi.com/static/site/a/ae/ae97dfc55685d1c15747892e17a6443aebbda091.png' : //eslint-disable-line max-len
      fileName[1],
    visual: 'media/gallery',
    width: 640,
    height: 480
  };

  return (
    <div className={s.detailed}>
      <div className={s.scrollPointer} id={`detailed-${hash}`}/>
      <div className={s.close}>
        <span onClick={itemToggle} data-id={hash}/>
      </div>
      <div className={s.content}>
        <div className={s.image}>
          <Image draggable={false}
            className='img-responsive'
            {...imageProps} />
        </div>
        <div className={s.info}>
          <span className={s.itemNum}>код участника: <span>{id}</span></span>
          <span className={s.fio}>{i}</span>
          <span className={s.city}>{city}</span>
          <p className={s.description}>{description}</p>
          <div className={s.votes}>
            <span className={s.votesCount}>
              {votesUp > 0 ? (
                `${votesUp} ${votesDecl}`
              ) : (
                '0 голосов'
              )}
            </span>
            <span
              className={classNames({
                [s.voteToggle]: true,
                [s.voted]: votesUser > 0
              })}
              data-id={hash}
              data-detailed={1}
              onClick={itemVote}>
              Голосовать
            </span>
          </div>
          <div className={s.socials}>
            <GalleryViewerSocials item={item} gaEvent={gaEvent}/>
          </div>
        </div>
      </div>
    </div>
  );
};

GalleryViewerDetailed.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  itemToggle: PropTypes.func,
  itemVote: PropTypes.func,
  item: PropTypes.object,
  selected: PropTypes.bool,
  gaEvent: PropTypes.string
};

export default withStyles(s)(GalleryViewerDetailed);
