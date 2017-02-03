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
import {phoneCleanup} from '../../utils/Helpers';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './WorkTime.scss';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';

class WorkTime extends Component {
  static propTypes = {
    storeProperty: PropTypes.string,
    className: PropTypes.string,
    time_value: PropTypes.string,  // eslint-disable-line
    time_mode: PropTypes.string,  // eslint-disable-line
    time_week: PropTypes.string,  // eslint-disable-line
    selected_city: PropTypes.object,  // eslint-disable-line
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
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
    this.state = {
      selectedCity: props.selected_city
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    wss.onChange(this.onChange);

    if (typeof callibriInit === 'function') {
      callibriInit(); // eslint-disable-line no-undef
    }
  }

  componentDidUpdate() {
    if (typeof callibriInit === 'function') {
      callibriInit(); // eslint-disable-line no-undef
    }
  }

  componentWillUnmount() {
    this.removeCss();
    wss.offChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      selectedCity: wss.get()[this.props.storeProperty] || {}
    }));
  }

  get phoneHref() {
    return phoneCleanup(this.state.selectedCity.office_phone);
  }

  get phoneClassName() {
    return this.props.className || '';
  }

  get worktime() {
    let worktime = null;

    if(this.props.time_mode === '2') {
      worktime = this.props.time_value;
    } else {
      if(this.props.time_week === '2') {
        worktime = this.state.selectedCity.office_hours;
      } else {
        const now = new Date();
        const wd = now.getDay();

        if(wd === 0 || wd === 6) {
          worktime = this.state.selectedCity.office_hours_weekend;
        } else {
          worktime = this.state.selectedCity.office_hours;
        }
      }
    }

    return worktime;
  }

  render() {
    return (
      <div className={s.root}>
        <a href="/contacts/" className={s.phoneTime}>
          <span>Звоните нам </span>
          <div dangerouslySetInnerHTML={{__html: this.worktime}} />
        </a>
        <a className={`${s.phoneNumber} ${this.phoneClassName}`}
          href={`tel:${this.phoneHref}`}>
          {this.state.selectedCity.office_phone}
        </a>
      </div>
    );
  }
}

export default WorkTime;
