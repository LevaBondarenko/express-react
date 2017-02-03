/**
 * Slider component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size, intersection} from 'lodash';
import {getApiMediaUrl, getFilename} from '../../utils/mediaHelpers';
/**
 *  components
 */
import FullScreenButton from '../SuperMediaSlider/FullScreenButton';
import Slides from '../SuperMediaSlider/Slides';
import SlideCounter from '../SuperMediaSlider/SlideCounter';
import SliderArrows from '../SuperMediaSlider/SliderArrows';
import Timeline from '../SuperMediaSlider/Timeline';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slider.scss';

class Slider extends Component {
  static propTypes = {
    mediaSource: React.PropTypes.number,
    activeSlideIndex: React.PropTypes.number,
    imgAlt: React.PropTypes.string,
    constructionHistory: React.PropTypes.oneOfType(
      [React.PropTypes.object, React.PropTypes.array]),
    parentProps: React.PropTypes.object,
    parentState: React.PropTypes.object,
    prevSlide: React.PropTypes.func,
    toSlide: React.PropTypes.func,
    nextSlide: React.PropTypes.func,
    sliderDidMount: React.PropTypes.func,
    handleKey: React.PropTypes.func,
    dragEvent: React.PropTypes.func,
    dragStart: React.PropTypes.func,
    dragEnd: React.PropTypes.func,
    dragOver: React.PropTypes.func,
    toggleFullScreen: React.PropTypes.func
  };

  static defaultProps = {
    arrows_position: 'middle'
  };

  constructor(props) {
    super(props);

    this.imgLoaded = 0;
    this.firstLoadedWidth = 0;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.props.handleKey);
  }

  componentWillReceiveProps() {
    const filteredMedia = this.props.parentState.filteredMedia;

    this.needUpdate = intersection([this.firstImage, this.lastImage], [
      filteredMedia[0].filename,
      filteredMedia[size(filteredMedia) - 1].filename
    ]);
    this.firstImage = filteredMedia[0].filename;
    this.lastImage = filteredMedia[size(filteredMedia) - 1].filename;
  }

  componentDidUpdate() {
    if (this.props.parentState.extraChange) {
      this.props.sliderDidMount();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.props.handleKey);
  }

  onSlideLoad = (e) => {
    this.imgLoaded++;

    if (this.imgLoaded === 1 && !this.needUpdate &&
    !this.props.parentState.extraSlides) {
      this.firstLoadedWidth = e.target.offsetWidth;
    } else {
      const delay = e.target.offsetWidth !== 0 &&
        this.firstLoadedWidth !== 0 ? 100 : 500;

      setTimeout(() => {
        const state = this.props.parentState;

        this.imgLoaded = 0;
        this.firstLoadedWidth = 0;

        state.views[state.activeView].needInit &&
          this.props.sliderDidMount();
      }, delay);
    }
  }

  getSlideImageUrl = (size, filename, type) => {
    const fn = type === 'demoflats' ?
      filename.replace('api-media.etagi.com/content/',
        'cdn-media.etagi.com/1024768/') : filename;

    return (fn.indexOf('https:') === 0 ||
      fn.indexOf('http:') === 0) ? fn :
      (getApiMediaUrl(
        size,
        type,
        fn,
        this.props.mediaSource));
  }

  getThumbImageUrl = (filename, type) => {
    const fn = type === 'demoflats' ?
      filename.replace('api-media.etagi.com/content/',
        'cdn-media.etagi.com/100100/') : filename;

    return (fn.indexOf('https:') === 0 ||
      fn.indexOf('http:') === 0) ? fn :
      (getApiMediaUrl(
          '100100',
          type,
          fn,
          this.props.mediaSource));
  }

  render() {
    const {activeView, filteredMedia, views, transition, width, isFullScreen,
    sliderHeight} = this.props.parentState;
    const arrowPosition = this.props.parentProps.arrows_position;
    const view = views[activeView];
    const transform = view.sliderTransform;
    const {activeGroup, timelineTransform, activeSlideIndex} = view;
    const filteredMediaSize = size(filteredMedia);
    const constructionHistory = this.props.constructionHistory[activeGroup] ||
      '';
    const height = sliderHeight && !isFullScreen ?
      sliderHeight :
      activeView === 'building' && isFullScreen ?
        width / 2.5 - 150 :
        width / 2.5 - 50;
    const counter = (view.needTransform &&
      !(this.props.parentState.extraSlides &&
      activeSlideIndex >= filteredMediaSize)) ? (
        <SlideCounter
          mediaSize={filteredMediaSize}
          activeSlideIndex={activeSlideIndex + 1}
        />
      ) : '';

    return (
      <div className={s.sliderWrapper}>
        <div className={!view.needTransform ?
            s.slidesContainer__video : s.slidesContainer}
          style={{height: height}}>
          {filteredMediaSize > 1 && <div>
            {counter}
            <SliderArrows
              arrowPosition={arrowPosition}
              prevSlide={this.props.prevSlide}
              nextSlide={this.props.nextSlide}
            />
          </div>}
          <div
            className={s.slidesWrapper}
            onDragStart={filteredMediaSize > 1 && this.props.dragStart}
            onDragEnd={filteredMediaSize > 1 && this.props.dragEnd}
            onDragOver={filteredMediaSize > 1 && this.props.dragOver}
            id={`${this.props.parentProps.mountNode}_slidesWrapper`}
            style={{
              transform: `translateX(${transform}px)`,
              msTransform: `translateX(${transform}px)`,
              WebkitTransform: `translateX(${transform}px)`,
              MozTransform: `translateX(${transform}px)`,
              OTransform: `translateX(${transform}px)`,
              transition: `transform ${transition}ms ease`,
              width: `${(filteredMediaSize + 2) *
                width}px`}}>
            <Slides
              parentState={this.props.parentState}
              activeSlideIndex={activeSlideIndex}
              prevSlide={this.props.prevSlide}
              nextSlide={this.props.nextSlide}
              toggleFullScreen={this.props.toggleFullScreen}
              imgAlt={this.props.imgAlt}
              mediaSource={this.props.mediaSource}
              getSlideImageUrl={this.getSlideImageUrl}
              getFilename={getFilename}
              onSlideLoad={this.onSlideLoad}
              extraSlides={this.props.parentState.extraSlides}
            />
          </div>
        </div>
        {(filteredMediaSize > 1 || activeView === 'building') &&
          <Timeline
            parentState={this.props.parentState}
            width={width}
            timelineTransform={timelineTransform}
            activeSlideIndex={activeSlideIndex}
            activeGroup={activeGroup}
            constructionHistory={constructionHistory}
            toSlide={this.props.toSlide}
            nextSlide={this.props.nextSlide}
            prevSlide={this.props.prevSlide}
            mountNode={this.props.parentProps.mountNode}
            getThumbImageUrl={this.getThumbImageUrl}
          />}
        <FullScreenButton
          isFullScreen={this.props.parentState.isFullScreen}
          toggleFullScreen={this.props.toggleFullScreen}
          buttonFloat={filteredMediaSize > 1 ? true : false}
        />
      </div>
    );
  }
}

export default withStyles(s)(Slider);
