/**
 * Input with range control
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import FormControl from 'react-bootstrap/lib/FormControl';
import ReactSlider from 'react-slider/react-slider';
import {priceFormatter} from '../utils/Helpers';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './InputRange.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

class InputRange extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    rangeClassName: PropTypes.string,
    rangeMin: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    rangeMax: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    rangeStep: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  };

  constructor(props) {
    super(props);
  }

  handleChangeRange = (value) => {
    const {onChange} = this.props;

    onChange(false, value);
  }

  render() {
    const {onChange, value, rangeClassName,
      rangeMin, rangeMax, rangeStep, ...props} = this.props;

    return(
      <div>
        <FormControl type='text'
          {...props}
          value={value === 0 ? '' : priceFormatter(value)}
          onChange={onChange || emptyFunction}
          ref='InputRange'/>
        <ReactSlider
          min={parseInt(rangeMin) || 0}
          max={parseInt(rangeMax) || 1}
          step={parseInt(rangeStep) || 1}
          minDistance={0}
          value={parseInt(value) || 0}
          onChange={this.handleChangeRange}
          className={s[rangeClassName]}
          orientation='horizontal'
          withBars
          ref='rangeSlider' />
      </div>
    );
  }
}

export default withStyles(s)(InputRange);
