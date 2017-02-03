/**
 * SlideCounter stateless functional component
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
import s from './SlideCounter.scss';

const SlideCounter = ({activeSlideIndex, mediaSize}) => {
  return (<div className={s.slideCounter}>
      {`${activeSlideIndex} / ${mediaSize}`}
    </div>);
};

SlideCounter.propTypes = {
  mediaSize: React.PropTypes.number,
  activeSlideIndex: React.PropTypes.number,
};

export default withStyles(s)(SlideCounter);
