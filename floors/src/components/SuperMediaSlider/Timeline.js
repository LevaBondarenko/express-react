/**
 * Timeline stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
import {map, size} from 'lodash';
/**
 *  components
 */
import Thumbs from '../SuperMediaSlider/Thumbs';
import Construction from '../SuperMediaSlider/Construction';
import ConstructionDate from '../SuperMediaSlider/ConstructionDate';
import DemoDescription from '../SuperMediaSlider/DemoDescription';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Timeline.scss';

const Timeline = ({timelineTransform, width, ...props}) => {
  const {filteredMedia, activeView, timelineMedia} = props.parentState;
  const filteredMediaSize = size(filteredMedia);
  let key = -1;

  width = width ? width : 0;

  const timeline = activeView === 'building' ? (
    <div className={s.groupWrapper}>
      {map(timelineMedia, (media, date) => {
        const thumbs = (<Thumbs
          activeView={activeView}
          filteredMedia={media}
          activeSlideIndex={props.activeSlideIndex}
          toSlide={props.toSlide}
          thumbKey={key}
          getThumbImageUrl={props.getThumbImageUrl}
        />);

        key += size(media);

        return (<div
            key={`thumb${activeView}${key}`}
            data-date={date}
            className={date === props.activeGroup ?
              s.groupThumbs__active : s.groupThumbs}>
            {thumbs}
            <ConstructionDate
              date={date}
              className={s.groupName}
            />
          </div>
        );
      })}
    </div>
  ) : (
    <div className={s.groupThumbs}>
      <Thumbs
        activeView={activeView}
        filteredMedia={filteredMedia}
        activeSlideIndex={props.activeSlideIndex}
        toSlide={props.toSlide}
        getThumbImageUrl={props.getThumbImageUrl}
        imgSrc={activeView === 'videos' ? 'https://cdn-media.etagi.com/static/site/9/9b/9bc7f6d188326de8f3f293c9983dea014f95c616.png' : ''}
      />
    </div>
  );

  return (<div style={{width: props.parentState.isFullScreen ?
        width - 235 : width - 135}}
      className={s.timelineContainer}>
      {filteredMediaSize > 1 && <div className={s.thumbArrow__prev}
        onClick={props.prevSlide}>
      </div>}
      <div
        id={`${props.mountNode}_thumbsContainer`}
        className={s.thumbsContainer}>
        <div
          className={s.thumbsWrapper}
          style={{
            transform: `translateX(${timelineTransform}px)`,
            'msTransform': `translateX(${timelineTransform}px)`,
            'WebkitTransform': `translateX(${timelineTransform}px)`,
            'MozTransform': `translateX(${timelineTransform}px)`,
            'OTransform': `translateX(${timelineTransform}px)`,
            width: `${filteredMediaSize * 108 +
              filteredMediaSize * 6}px`}}>
          {timeline}
        </div>
      </div>
      {props.constructionHistory &&
        <Construction
          constructionHistory={props.constructionHistory}
          date={props.activeGroup} />}
      {activeView === 'demos' &&
        <DemoDescription
          data={filteredMedia[props.activeSlideIndex].description} />}
      {filteredMediaSize > 1 && <div className={s.thumbArrow__next}
        onClick={props.nextSlide}>
      </div>}
    </div>);
};

Timeline.propTypes = {
  parentState: React.PropTypes.object,
  constructionHistory: React.PropTypes.string,
  width: React.PropTypes.number,
  activeSlideIndex: React.PropTypes.number,
  thumbKey: React.PropTypes.number,
  timelineTransform: React.PropTypes.number,
  activeGroup: React.PropTypes.string,
  mountNode: React.PropTypes.string,
  activeView: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  toSlide: React.PropTypes.func,
  prevSlide: React.PropTypes.func,
  nextSlide: React.PropTypes.func,
  getThumbImageUrl: React.PropTypes.func,
};

export default withStyles(s)(Timeline);
