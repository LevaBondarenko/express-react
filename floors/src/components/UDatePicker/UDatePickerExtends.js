/**
 * UDatePicker widget class
 *
 * @ver 0.0.0
 * @author l.v.bondarenko@72.etagi.com
 */


import React, {PropTypes, Component} from 'react';
import {Calendar} from 'react-date-picker';
import moment from 'moment';
import MaskedInput from './MaskedInput';
import classNames from 'classnames';
import HelpIcon from '../../shared/HelpIcon';

class UDatePicker extends Component {
  static propTypes = {
    actions: PropTypes.object,
    defaultValue: PropTypes.string,
    fieldName: PropTypes.string,
    format: PropTypes.string,
    help: PropTypes.string,
    label: PropTypes.string,
    maxValue: PropTypes.string,
    minValue: PropTypes.string,
    objectName: PropTypes.string,
    placeholder: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      ...this.dateInitialState(),
      visible: false,
      placeholder: this.props.placeholder || moment().format(this.props.format),
      date: this.props.defaultValue != '' ?
       moment(this.props.defaultValue).format(this.props.format) : ''
    };


    this.onInputChange = this.debounceDate(this.onInputChange, 300);
  }

  dateInitialState = () => {
    const {defaultValue, format} = this.props;
    const now = moment(defaultValue).format(format);

    return now;
  }

  debounceDate = (func, wait, immediate) => {
    let timeout;

    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        };
      };
      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  componentDidMount() {
    document.addEventListener('click', (e) => {
      if ((this.hasClass(e.target, 'react-date-field__input') &&
       this.state.visible) ||
       this.hasClass(e.target, 'react-date-picker__footer-button')) {
        return;
      }
      if ((!this.hasClass(e.target, 'calendar-wrapper') &&
       this.state.visible) ||
        (this.hasClass(e.target, 'react-date-field__calendar-icon') &&
       !this.state.visible)) {
        this.toggleCalendar();
      }
    });
  }

  toggleCalendar = () => {
    const state = Object.assign({}, this.state, {visible: !this.state.visible});

    this.setState(state);
  }

  updateState = (obj) => {
    const {objectName, fieldName, format} = this.props;
    const objValue = obj.date || obj !== '';
    const objTarget = moment(objValue,format);
    let date;

    if (objValue) {
      const objDate = moment(objTarget);
      const minValue = moment(this.props.minValue);
      const maxValue = moment(this.props.maxValue);


      date = objDate.format('x') < minValue.format('x')  ?
       minValue.format(format) : (objDate.format('x') > maxValue.format('x')  ?
        maxValue.format(format) : objDate.format(format));
    }else {
      date = '';
    }



    this.props.actions.updateInObjectsState(
      [objectName,fieldName],
       () => (date !== '' ? moment(date, format).format('YYYY-MM-DD') : ''));
    this.setState(() => ({
      date: date
    }))  ;
  }

  onDatepickerChange = (dateString) => {
    this.updateState({date: dateString});
    setTimeout(() => this.toggleCalendar(), 100);
  }

  onInputChange = e => {
    const value = e.target.value;
    const date = moment(value,this.props.format).format(this.props.format);

    this.updateState({date: date});
  }

  debounceEventHandler = (...args) => {
    const debounced = this.debounceDate(...args);

    return function(e) {
      e.persist();
      return debounced(e);
    };
  }

  clear = () => {
    const value = '';

    this.updateState(value);
  }

  hasClass = (element, classname) => {
    const elemClassName = element.className || ' ';

    if (typeof elemClassName === 'string' &&
     elemClassName.split(' ').indexOf(classname) >= 0) {
      return true;
    }
    return element.parentNode && this.hasClass(element.parentNode, classname);
  }

  render() {
    const {format, help, label, objectName, fieldName} = this.props;
    const mask = format.replace('MM', '99')
    .replace('DD', '99').replace('YYYY', '9999');

    return (
      <div className="date-picker-container">
        {label ?
          (<label
            className='input-label col-xs-12'>
            <span>{label}</span>
          </label>) : null
        }
         <br/>
         <div className={classNames(
             'react-flex react-date-field',
             'react-date-field--theme-default',
             'react-date-field--picker-position-bottom',
             'react-flex-v2--align-items-center',
             'react-flex-v2--row',
             'react-flex-v2--display-inline-flex',
             {'react-date-field--focused': this.state.visible ? true : false}
             )}>
             <MaskedInput
               mask={mask}
               className='form-control'
               value={this.state.date}
               placeholder={this.state.placeholder}
               onKeyUp={this.debounceEventHandler(
                 this.onInputChange, 2000)}
                format={format}
               />
               <div className="react-date-field__clear-icon"
                 onClick={this.clear.bind(this, false)}>
                 <svg height="20" width="20" viewBox="0 0 24 24">
                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5
                     17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                   <path d="M0 0h24v24H0z" fill="none"></path>
                 </svg>
               </div>
             <div className="react-date-field__calendar-icon">
               <div className="react-date-field__calendar-icon-inner"></div>
             </div>
             <div>
               {  (this.state.visible) ?
                 <div className="calendar-wrapper">
                   <Calendar
                     defaultDate={this.state.date}
                     onChange={this.onDatepickerChange.bind(this)}
                     dateFormat={format}/>
                 </div> : null
               }
             </div>
           </div>
           {help &&
             <HelpIcon
               id={`react-date-field-${objectName}-${fieldName}`}
               closeButton={true}
               className='help-text-left'
               placement='top'
               helpText={help}/>
           }
       </div>
    );
  }
}

export default UDatePicker;
