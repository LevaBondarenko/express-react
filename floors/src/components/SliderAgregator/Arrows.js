/**
 * Slide stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Arrows.scss';

const Arrows = ({prevSlide, nextSlide}) => {
  return (<div className={s.arrows}>
      <div className={s.left} onClick={prevSlide} />
      <div className={s.right} onClick={nextSlide} />
    </div>
  );
};

Arrows.propTypes = {
  prevSlide: React.PropTypes.func,
  nextSlide: React.PropTypes.func
};

export default withStyles(s)(Arrows);
