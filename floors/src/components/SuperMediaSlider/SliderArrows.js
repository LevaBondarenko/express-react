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
import s from './SliderArrows.scss';

const SliderArrows = ({arrowPosition, prevSlide, nextSlide}) => {
  return (<div>
    <div className={arrowPosition === 'bottom' ?
        s.navArrowPrev__bottom : s.navArrowPrev__middle}
      onClick={prevSlide}>
    </div>
    <div className={arrowPosition === 'bottom' ?
        s.navArrowNext__bottom : s.navArrowNext__middle}
      onClick={nextSlide}>
    </div>
  </div>);
};

SliderArrows.propTypes = {
  arrowPosition: React.PropTypes.string,
  prevSlide: React.PropTypes.func,
  nextSlide: React.PropTypes.func,
};

export default withStyles(s)(SliderArrows);