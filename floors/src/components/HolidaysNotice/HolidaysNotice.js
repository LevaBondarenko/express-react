/**
 * Worktime widget
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Basil from 'basil.js';
import {size} from 'lodash';
import s from './HolidaysNotice.scss';
import emptyFunction from 'fbjs/lib/emptyFunction';

class HolidaysNotice extends Component {
  static propTypes = {
    mountNode: PropTypes.string,
    holidaysText3: PropTypes.string,
    holidaysText1: PropTypes.string,
    holidaysText2: PropTypes.string,
    duration: PropTypes.string,
    animation: PropTypes.string,
    holidaysPeriod: React.PropTypes.string,
    holidays: React.PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  };

  static defaultProps = {
    duration: '8000',
    animation: '500'
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
    let holidaysShow = false;
    let holidays = false;

    if(parseInt(props.holidays)) {
      const today = new Date();
      const basil = new Basil({namespace: 'etagi_com'});
      let dates = props.holidaysPeriod;

      dates = dates.split('-');

      const dateStart =
        new Date(dates[0].replace(/\./g, '-').replace(' ', 'T'));
      const dateFinish =
        new Date(dates[1].replace(/\./g, '-').replace(' ', 'T'));

      today.setHours(5, 0, 0, 0);
      holidays = today >= dateStart && today < dateFinish;
      holidaysShow = holidays &&
        (today > (new Date(basil.get('holidaysScheduleShowed'))));
      if(holidaysShow) {
        basil.set('holidaysScheduleShowed', today);
      }
    }
    this.state = {
      holidays: holidays,
      holidaysShow: holidaysShow,
      textIndex: 0,
      text: [
        props.holidaysText1,
        props.holidaysText2,
        props.holidaysText3
      ]
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }


  showText = () => {
    const {textIndex, holidays} = this.state;
    let {text} = this.state;

    text = text.filter(item => item !== '');

    if(holidays) {
      setTimeout(() => {

        this.setState({
          textIndex: textIndex >= size(text) - 1 ? 0 : textIndex + 1
        });
      }, this.props.duration);
    }

    const items = text.map((item, key) => {
      return (<span key={key} className={s.text}>
        {text[textIndex]}
      </span>);
    });

    return items[textIndex];
  };

  render() {
    const {holidays} = this.state;

    return (
      <div className={s.root}>
        {holidays ? this.showText() : false}
      </div>
    );
  }
}

export default HolidaysNotice;
