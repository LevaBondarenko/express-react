/**
 * Slide stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slide.scss';

const Slide = ({imgNumber, ...props}) => {
  return (<div
    key={props.activeView + imgNumber}
    style={{'maxWidth': props.maxWidth}}
    className={props.activeSlideIndex === imgNumber ? s.slide__active :
      props.activeView === 'layouts' ? s.slideLayout : s.slide}
    onClick={props.activeSlideIndex - 1 === imgNumber ? props.prevSlide :
      (props.activeSlideIndex + 1 === imgNumber ?
         props.nextSlide : props.toggleFullScreen)}>
      <img
        src={props.imgSrc}
        onLoad={imgNumber === -1 || imgNumber === 0 ? props.onSlideLoad : ''}
        alt={props.imgAlt}
        title={props.imgAlt}
        data-st={imgNumber === -1 || imgNumber === 0 ? imgNumber : ''}
        className={s.slide__img}
        data-slide={imgNumber}/>
  </div>);
};

Slide.propTypes = {
  isFullScreen: React.PropTypes.bool,
  activeView: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  imgAlt: React.PropTypes.string,
  maxWidth: React.PropTypes.number,
  imgNumber: React.PropTypes.number,
  activeSlideIndex: React.PropTypes.number,
  prevSlide: React.PropTypes.func,
  nextSlide: React.PropTypes.func,
  toggleFullScreen: React.PropTypes.func,
  onSlideLoad: React.PropTypes.func
};

export default withStyles(s)(Slide);
