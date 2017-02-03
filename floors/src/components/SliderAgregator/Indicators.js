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
import s from './Indicators.scss';

const Indicators = ({count, index, color, toSlide}) => {
  const indicators = [];

  for (let i = 0; i < count; i++) {
    const className = i === index ? `${s.indicator} ${s.active}` : s.indicator;

    indicators.push(<div style={{background: color}}
      key={`indicator${i}`}
      className={className}
      data-index={i}
      onClick={toSlide} />);
  }

  return (<div style={{width: count * 10 + count * 5}}
      className={s.indicators}>
      {indicators}
    </div>
  );
};

Indicators.propTypes = {
  count: React.PropTypes.number,
  index: React.PropTypes.number,
  color: React.PropTypes.string,
  toSlide: React.PropTypes.func
};

export default withStyles(s)(Indicators);
