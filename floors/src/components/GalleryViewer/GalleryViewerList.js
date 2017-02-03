import React, {PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import s from './GalleryViewer.scss';
import GalleryViewerItem from './GalleryViewerItem';
import GalleryViewerDetailed from './GalleryViewerDetailed';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {size, map, slice} from 'lodash';

const GalleryViewerList = (props) => {
  const {
    itemToggle, itemVote, itemAdd, items, selected, containerWidth, showSocials,
    socialsToggle, gaEvents
  } = props;
  const perRow = Math.floor(containerWidth / 354);
  const hashs = map(items, 'hash');
  const selIdx = hashs.indexOf(selected);
  const lastInRow = selIdx > -1 ?
    ((perRow * Math.floor(selIdx / perRow)) + perRow) : 0;
  const before = lastInRow ? slice(items, 0, lastInRow) : items;
  const after = lastInRow ? slice(items, lastInRow) : [];
  let beforeList = map(before, item => {
    return (
      <GalleryViewerItem
        key={`gvi-${item.hash}`}
        item={item}
        selected={item.hash === selected}
        showSocials={item.id === showSocials}
        socialsToggle={socialsToggle}
        itemToggle={itemToggle}
        itemVote={itemVote}
        gaEvent={gaEvents.gaEventListShare}/>
    );
  });
  let afterList = map(after, item => {
    return (
      <GalleryViewerItem
        key={`gvi-${item.hash}`}
        item={item}
        selected={item.hash === selected}
        showSocials={item.id === showSocials}
        socialsToggle={socialsToggle}
        itemToggle={itemToggle}
        itemVote={itemVote}
        gaEvent={gaEvents.gaEventListShare}/>
    );
  });
  const emptyItem = {empty: true, user_data: {}}; //eslint-disable-line camelcase
  const emptyBlock = (
    <GalleryViewerItem
      key='gvi-emptyItem'
      item={emptyItem}
      selected={false}
      itemAdd={itemAdd}/>
  );

  if(selIdx > -1) {
    afterList.push(emptyBlock);
  } else {
    beforeList.push(emptyBlock);
  }

  beforeList = size(beforeList) > 0 ?
    createFragment({beforeList: beforeList}) :
    createFragment({beforeList: <div/>});
  afterList = size(afterList) > 0 ?
    createFragment({afterList: afterList}) :
    createFragment({afterList: <div/>});

  return (
    <div className={s.list}>
      {beforeList}
      {selIdx > -1 ? (
        <GalleryViewerDetailed
          item={items[selIdx]}
          itemToggle={itemToggle}
          itemVote={itemVote}
          gaEvent={gaEvents.gaEventPhotoShare}/>
      ) : null}
      {afterList}
    </div>
  );
};

GalleryViewerList.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  itemToggle: PropTypes.func,
  itemVote: PropTypes.func,
  itemAdd: PropTypes.func,
  socialsToggle: PropTypes.func,
  items: PropTypes.array,
  selected: PropTypes.string,
  containerWidth: PropTypes.number,
  showSocials: PropTypes.string,
  gaEvents: PropTypes.object
};

export default withStyles(s)(GalleryViewerList);
