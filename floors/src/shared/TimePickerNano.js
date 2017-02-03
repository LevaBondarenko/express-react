/**
 * Shared TimePickerNano Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import withStyles from '../decorators/withStyles';
import {map} from 'lodash';

import styles from './css/TimePickerNano.css';

@withStyles(styles)
class TimePickerNano extends Component {
  static propTypes = {
    time: React.PropTypes.string,
    onChange: React.PropTypes.func,
    className: React.PropTypes.string
  };
  parseTime(timeStr) {
    let time = timeStr.split(':');

    time = map(time, item => { return parseInt(item); });
    const addHours = time[1] / 60 | 0;

    time[1] %= 60;
    time[0] = (time[0] + addHours) % 24;
    return time;
  }

  up(e) {
    const time = this.parseTime(this.props.time);
    let target = e.target;

    while(!target.classList.contains('btn-up') &&
      (target = target.parentElement)) {};
    const w = parseInt(target.dataset.digit);

    time[w] += w ? 5 : 1;
    if(w) {
      const addHour = time[w] / 60 | 0;

      time[w] %= 60;
      time[0] = (time[0] + addHour) % 24;
    }
    time[0] %= 24;
    this.props.onChange(
      `${`0${time[0]}`.substr(-2)}:${`0${time[1]}`.substr(-2)}`
    );
  }

  down(e) {
    const time = this.parseTime(this.props.time);
    let target = e.target;

    while(!target.classList.contains('btn-down') &&
      (target = target.parentElement)) {};
    const w = parseInt(target.dataset.digit);

    time[w] -= w ? 5 : 1;
    if(w && time[w] < 0) {
      time[w] += 60;
      time[w] %= 60;
      time[0]--;
    }
    if(time[0] < 0) {
      time[0] += 24;
      time[0] %= 24;
    }
    this.props.onChange(
      `${`0${time[0]}`.substr(-2)}:${`0${time[1]}`.substr(-2)}`
    );
  }

  render() {
    const time = this.parseTime(this.props.time);
    const hour = time[0], minute = time[1];
    const modeClass = classNames('time-picker-nano', this.props.className);

    return (
      <div className={modeClass}>
        <div className='time-picker-nano-digit'>
          <button
            className='btn-up'
            type='button'
            onClick={this.up.bind(this)}
            data-digit={0}>
            <span className="glyphicon glyphicon-menu-up"
              aria-hidden="true" />
          </button>
          <input
            readOnly
            type='text'
            value={`0${hour}`.substr(-2)}/>
          <button
            className='btn-down'
            type='button'
            onClick={this.down.bind(this)}
            data-digit={0}>
            <span className="glyphicon glyphicon-menu-down"
              aria-hidden="true" />
          </button>
        </div>
        <div className='time-picker-nano-divider'>:</div>
        <div className='time-picker-nano-digit'>
          <button
            className='btn-up'
            type='button'
            onClick={this.up.bind(this)}
            data-digit={1}>
            <span className="glyphicon glyphicon-menu-up"
              aria-hidden="true" />
          </button>
          <input
            readOnly
            type='text'
            value={`0${minute}`.substr(-2)}/>
          <button
            className='btn-down'
            type='button'
            onClick={this.down.bind(this)}
            data-digit={1}>
            <span className="glyphicon glyphicon-menu-down"
              aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }
}

export default TimePickerNano;
