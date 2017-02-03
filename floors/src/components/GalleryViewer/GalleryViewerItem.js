import React, {PropTypes} from 'react';

import classNames from 'classnames';
import Image from '../../shared/Image';
import s from './GalleryViewer.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import GalleryViewerSocials from './GalleryViewerSocials';

const GalleryViewerItem = (props) => {
  const {
    itemToggle, itemVote, itemAdd, item, selected, showSocials, socialsToggle,
    gaEvent
  } = props;
  const {
    user_data: {i, city}, votes_up: votesUp, votes_user: votesUser,
    photo, hash, empty, id
  } = item;
  const fileName = (/.*\/(.*)$/).exec(photo);
  const imageProps = {
    image: empty || !fileName || !fileName[1] ?
      '//cdn-media.etagi.com/static/site/a/ae/ae97dfc55685d1c15747892e17a6443aebbda091.png' : //eslint-disable-line max-len
      fileName[1],
    visual: 'media/gallery',
    width: 320,
    height: 240
  };

  return (
    <div className={classNames({
      [s.item]: true,
      [s.selected]: selected
    })}>
      <div className={s.scrollPointer} id={`item-${hash}`}/>
      <div
        className={classNames({
          [s.itemImage]: true,
          [s.notScale]: empty
        })}
        onClick={empty ? itemAdd : itemToggle}
        data-id={hash}>
        {id ? (
          <span className={s.itemNum}>{`код: ${id}`}</span>
        ) : null}
        {empty ? null : <span className={s.helper}/>}
        <Image draggable={false}
          className='img-responsive'
          {...imageProps} />
        {empty ? (
          <span className={s.addSelf}>
            Добавить свою<br/>фотографию
          </span>
        ) : null}
      </div>
      <div className={s.itemInfo}>
        <span className={s.itemFio}>
          {empty ? null : i}
        </span>&nbsp;
        <span className={s.itemCity}>
          {empty ? null : city}
        </span>
      </div>
      <div className={classNames({
        [s.votesAndShare]: true,
        [s.dummy]: empty
      })}>
        <div
          data-id={id}
          className={s.share}
          onClick={empty ? itemAdd : socialsToggle}>
          Рассказать друзьям
        </div>
        <div className={s.votes}>
          <span
            className={classNames({
              [s.voteToggle]: true,
              [s.voted]: votesUser > 0
            })}
            data-id={hash}
            onClick={empty ? itemAdd : itemVote}>
            Голосовать
          </span>
          {votesUp > 0 ? (
            <span className={s.votesCount}>
              {votesUp}
            </span>
          ) : null}
        </div>
      </div>
      {showSocials ? (
        <div className={s.socailsBlock}>
          <span
            data-id={id}
            className={s.closeSocials}
            onClick={socialsToggle}/>
          <span>Поддержите участника в социальных сетях!</span>
          <GalleryViewerSocials item={item} gaEvent={gaEvent}/>
        </div>
      ) : null}
    </div>
  );
};

GalleryViewerItem.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  itemToggle: PropTypes.func,
  itemVote: PropTypes.func,
  itemAdd: PropTypes.func,
  socialsToggle: PropTypes.func,
  item: PropTypes.object,
  selected: PropTypes.bool,
  showSocials: PropTypes.bool,
  gaEvent: PropTypes.string
};

export default withStyles(s)(GalleryViewerItem);
