/**
 * Slides stateless functional component
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
import Slide from '../SuperMediaSlider/Slide';
import SlideVideo from '../SuperMediaSlider/SlideVideo';
import SlideTour from '../SuperMediaSlider/SlideTour';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slides.scss';

const Slides = ({getSlideImageUrl, getFilename, extraSlides, ...props}) => {
  const {activeView, filteredMedia, width, views, isFullScreen, sliderHeight} =
    props.parentState;
  const filteredMediaSize = size(filteredMedia);
  const firstSlide = filteredMedia[0];
  const lastSlide = filteredMedia[filteredMediaSize - 1];
  const typeMedia = activeView === 'layouts' ? 'layouts' :
    (activeView === 'demos' ? 'demoflats' : 'photos');
  const imageSize = isFullScreen ? '12801024' : '1024768';
  const minWidth = width < 1025 ? 1024 : width;
  const minWidthFS = width < 1025 ? 1000 : width - 100;
  const maxWidth = !isFullScreen && sliderHeight ? sliderHeight * 1.5 :
    Math.round(minWidth / 1.696);
  const slides =
    map(filteredMedia, (slide, key) => {
      return (activeView === 'videos' ?
        <SlideVideo
          key={activeView + key}
          activeView={activeView}
          activeSlideIndex={props.activeSlideIndex}
          imgNumber={key}
          width={isFullScreen ? minWidthFS :
            minWidth}
          height={sliderHeight ? sliderHeight - 50 : minWidth / 2.5 - 50}
          riesId={slide.ries_id}
        /> :
        activeView === 'tours' ?
        <SlideTour
          key={activeView + key}
          activeView={activeView}
          kind={slide.kind}
          activeSlideIndex={props.activeSlideIndex}
          imgNumber={key}
          width={minWidth}
          height={sliderHeight ? sliderHeight - 50 : minWidth / 2.5 - 50}
          imgSrc={props.mediaSource ?
            getSlideImageUrl('content', slide.filename,
              slide.kind === 'html5' ? '3d_tours_new' : '3d_tours') :
            `https://ries3.etagi.com/3d_tours/${getFilename(slide.filename)}`}
        /> :
        <Slide
          key={activeView + key}
          activeView={activeView}
          activeSlideIndex={props.activeSlideIndex}
          prevSlide={props.prevSlide}
          nextSlide={props.nextSlide}
          onSlideLoad={props.onSlideLoad}
          toggleFullScreen={props.toggleFullScreen}
          maxWidth={maxWidth}
          imgNumber={key}
          imgAlt={`${props.imgAlt} - фото номер ${key + 1}`}
          imgSrc={getSlideImageUrl(imageSize, slide.filename, typeMedia)}
        />
      );
    });
  const extraHTML = extraSlides && activeView === 'photos' &&
    map(extraSlides, (slide, key) => {
      return (<div style={{maxWidth: maxWidth}}
        key={`extraSlide${key}`}
        className={props.activeSlideIndex === filteredMediaSize + key ?
          s.slide__active : s.slide}
        data-slide={filteredMediaSize + key}
        dangerouslySetInnerHTML={{__html: slide.html}} />);
    });
  const fullSize = extraHTML && activeView === 'photos' ?
    filteredMediaSize + size(extraSlides) : filteredMediaSize;

  return (<div>
    {size(extraHTML) ?
    <div style={{maxWidth: maxWidth}}
      className={s.slide}
      data-st='-1'
      data-slide='-1'
      dangerouslySetInnerHTML={{
        __html: extraSlides[size(extraSlides) - 1].html}} /> :
    views[activeView].needTransform && <Slide
      key={`${activeView}-1`}
      activeView={activeView}
      activeSlideIndex={props.activeSlideIndex}
      prevSlide={props.prevSlide}
      nextSlide={props.nextSlide}
      onSlideLoad={props.onSlideLoad}
      maxWidth={maxWidth}
      imgNumber={-1}
      imgAlt={`${props.imgAlt} - фото номер ${fullSize}`}
      imgSrc={getSlideImageUrl(imageSize, lastSlide.filename, typeMedia)}
    />}
    {slides}
    {extraHTML}
    {views[activeView].needTransform && <Slide
      key={`${activeView}${filteredMediaSize + 1}`}
      activeView={activeView}
      activeSlideIndex={props.activeSlideIndex}
      prevSlide={props.prevSlide}
      nextSlide={props.nextSlide}
      maxWidth={maxWidth}
      imgNumber={filteredMediaSize + 1}
      imgAlt={`${props.imgAlt} - фото номер 1`}
      imgSrc={getSlideImageUrl(imageSize, firstSlide.filename, typeMedia)}
    />}
  </div>);
};

Slides.propTypes = {
  imgAlt: React.PropTypes.string,
  extraSlides: React.PropTypes.array,
  parentState: React.PropTypes.object,
  mediaSource: React.PropTypes.number,
  activeSlideIndex: React.PropTypes.number,
  prevSlide: React.PropTypes.func,
  nextSlide: React.PropTypes.func,
  getSlideImageUrl: React.PropTypes.func,
  getFilename: React.PropTypes.func,
  toggleFullScreen: React.PropTypes.func,
  onSlideLoad: React.PropTypes.func
};

export default withStyles(s)(Slides);
