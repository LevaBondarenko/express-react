/**
 * UInput widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import s from './UInput.scss';
import InputRange from '../../shared/InputRange';
import HelpIcon from '../../shared/HelpIcon';
import classNames from 'classnames';
import {size} from 'lodash';
import {phoneFormatter, priceFormatter} from '../../utils/Helpers';
//import listenCaret from '../../decorators/listenCaret'; //temporarily disabled, until refactoring
import {getHelpValue} from '../../utils/priceHelpers';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
/**
 * React/Flux entities
 */
import withCondition from '../../decorators/withCondition';
import FilterQuarterStore from '../../stores/FilterQuarterStore';
import SuggestBox from '../../shared/SuggestBox/';

const isMounted = (component) => {
  // exceptions for flow control
  try {
    ReactDOM.findDOMNode(component);
    return true;
  } catch (e) {
    // Error
    return false;
  }
};

class UInput extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    className: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    label: React.PropTypes.string,
    refreshButtonText: React.PropTypes.string,
    funnyPlaceHolder: React.PropTypes.bool,
    isNumeric: React.PropTypes.bool,
    isPhone: React.PropTypes.bool,
    isApplyCourse: React.PropTypes.bool,
    unit: React.PropTypes.string,
    help: React.PropTypes.string,
    refreshOn: React.PropTypes.string,
    isSliderEnabled: React.PropTypes.bool,
    defaultValue: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ]),
    rows: React.PropTypes.number,
    minValue: React.PropTypes.number,
    maxValue: React.PropTypes.number,
    maxLength: React.PropTypes.number,
    step: React.PropTypes.number,
    currency: React.PropTypes.object,
    objectInfo: React.PropTypes.object,
    countryCode: React.PropTypes.object,
    actions: PropTypes.object,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    secondValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    secondValueName: PropTypes.string,
    visible: React.PropTypes.bool,
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
    visibilityProperty: React.PropTypes.string,
    isNativeNumeric: PropTypes.bool
  };

  static defaultProps = {
    isPhone: false,
    isNumeric: false,
    isApplyCourse: false,
    minValue: 0,
    maxValue: 100,
    step: 5
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = this.processProps(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }
  // @TODO remove after rename in wp db
  componentDidMount() {
    const {
      objectName, fieldName, isNumeric, value: storedValue, defaultValue,
      objectInfo
    } = this.props;

    if(defaultValue && (!storedValue || storedValue === defaultValue)) {
      const parsedDefault = defaultValue ?
        defaultValue.toString().split(':') : [];

      if(parsedDefault[0] === '_fromObject') {
        const newValue = isNumeric ?
          parseFloat(objectInfo[parsedDefault[1]]) :
          objectInfo[parsedDefault[1]];

        this.props.actions.updateInObjectsState(
          [objectName, fieldName], () => (newValue));
      } else if (parsedDefault[0] === '_fromNhObject') {
        const newValue = isNumeric ?
          parseFloat(FilterQuarterStore.myFlat[parsedDefault[1]]) :
          FilterQuarterStore.myFlat[parsedDefault[1]];

        this.props.actions.updateInObjectsState(
          [objectName, fieldName], () => (newValue));
        this.setState(() => ({
          valueFromNh: parsedDefault[1]
        }));
        FilterQuarterStore.onChange(this.onQuarterStoreChange);
      }
    }
    this.setState(() => (this.processProps(this.props)));
  }

  componentWillUnmount() {
    this.removeCss();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const valueChanged = this.state.value !== nextState.value;
    const validationChanged = this.props.isReadonly !== nextProps.isReadonly ||
      this.props.isHidden !== nextProps.isHidden ||
      this.props.msg !== nextProps.msg || this.props.err !== nextProps.err;
    const stateChanged = this.state.showSuggest !== nextState.showSuggest ||
      this.state.suggestValue !== nextState.suggestValue ||
       this.state.course !== nextState.cource;

    return valueChanged || stateChanged || validationChanged;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => (this.processProps(nextProps)));
  }

  // @TODO remove after removing filterquarter store
  onQuarterStoreChange = () => {
    const {valueFromNh} = this.state;

    if(valueFromNh) {
      const {
        objectName, fieldName, isNumeric
      } = this.props;
      const newValue = isNumeric ?
        parseFloat(FilterQuarterStore.myFlat[valueFromNh]) :
        FilterQuarterStore.myFlat[valueFromNh];

      if (this.props.value !== newValue) {
        this.props.actions.updateInObjectsState(
          [objectName, fieldName], () => (newValue));
      }
    }
  }

  processProps = props => {
    const {
      isNumeric, isApplyCourse, value: storedValue, currency
    } = props;
    const course = currency ? (currency.nominal / currency.value) : 1;
    const curUnit = currency ? (currency.symbol) : 'руб';
    let value = isNumeric ? 0 : '';

    if(currency && isApplyCourse && isNumeric) {
      value = storedValue && !isNaN(storedValue) ?
        Math.round(storedValue * course) : '';
    } else {
      value = storedValue === 0 ? '' : storedValue;
    }

    return {
      course: course,
      curUnit: curUnit,
      value: value
    };
  }

  prepareValue = value => {
    const {
      isNumeric, isApplyCourse, maxLength
    } = this.props;
    const {course, value: prevValue} = this.state;
    let parsedValue = parseFloat(
      value.toString().replace(/\s/g, '').replace(/\,/g, '.')
    );

    isNaN(parsedValue) && (parsedValue = 0);
    let storingValue = isNumeric ? (
      isApplyCourse ? parsedValue / course : parsedValue
    ) : value.toString();

    if(maxLength && isNumeric && storingValue > maxLength) {
      storingValue = maxLength;
    } else if(maxLength && !isNumeric && size(storingValue) > maxLength) {
      storingValue = prevValue;
    }

    return {parsedValue: parsedValue, storingValue: storingValue};
  }

  handleChange = (e, val) => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled, isPhone, countryCode
    } = this.props;
    const value = e ? e.target.value : val;
    const {parsedValue, storingValue} = this.prepareValue(value);
    const minmax = fieldName.substr(fieldName.indexOf('_') + 1);
    const hValue = getHelpValue(
      parsedValue,
      this,
      ['min', 'max'].indexOf(minmax) > -1 ? minmax : undefined
    );
    const hShow = e && value.toString().length < hValue.toString().length - 1 &&
      hValue > 0;

    if(isSliderEnabled || refreshOn === 'change' || !e) {
      const newValue =  isPhone ? phoneFormatter(
        storingValue,
        countryCode.current,
        countryCode.avail
      ) : storingValue;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (newValue));
    } else if(refreshOn === 'blur' || refreshOn === 'click') {
      this.setState(() => ({
        value: value
      }));
    }

    this.setState(() => ({
      showSuggest: hShow,
      suggestValue: hValue
    }));

  }

  setSuggestValue = (event) => {
    this.handleChange(false, this.state.suggestValue);

    this.setState(() => ({
      showSuggest: false
    }));

    event.preventDefault();
  };

  handleBlur = () => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled, isPhone, countryCode
    } = this.props;

    if(!isSliderEnabled && (refreshOn === 'blur')) {
      const {value} = this.state;
      const {storingValue} = this.prepareValue(value);
      const newValue = isPhone ? phoneFormatter(
        value,
        countryCode.current,
        countryCode.avail
      ) : storingValue;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (newValue));
    }

    setTimeout(() => {
      isMounted(this) && this.setState(() => ({
        showSuggest: false,
        focused: false
      }));
    }, 400);
  };

  handleClick = () => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled, isPhone, countryCode
    } = this.props;

    if(!isSliderEnabled && (refreshOn === 'click')) {
      const {value} = this.state;
      const {storingValue} = this.prepareValue(value);
      const newValue = isPhone ? phoneFormatter(
        value,
        countryCode.current,
        countryCode.avail
      ) : storingValue;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (newValue));
    }
  }

  handleOnFocus = (event) => {
    const value = event.target.value;
    const suggestValue = this.state.suggestValue || '';
    const show = value.toString().length < suggestValue.toString().length - 1 &&
      suggestValue > 0;

    this.setState(() => ({
      showSuggest: show,
      focused: true
    }));
  };

  handleKeyDown = event => {
    if(this.state.showSuggest) {
      switch(event.which) {
      case 13:
        this.setSuggestValue(event);
        break;
      case 40:
        event.preventDefault();
        this.setState({
          suggestActive: true
        });
        break;
      case 38:
        event.preventDefault();
        this.setState({
          suggestActive: false
        });
        break;
      default:
        //do nothing
      }
    }
  }

  render() {
    const {value, course, focused} = this.state;
    const curUnit = this.props.currency.symbol;
    const {
      label, placeholder, isSliderEnabled, unit, help, isApplyCourse, err, msg,
      objectName, fieldName, className, isNumeric, isPhone, rows, refreshOn,
      refreshButtonText, countryCode, isReadonly, isHidden, funnyPlaceHolder,
      visible, isNativeNumeric
    } = this.props;
    let {minValue, maxValue, step} = this.props;
    const renderValue = isPhone && !isNumeric ?
      phoneFormatter(
        value,
        countryCode.current,
        countryCode.avail
      ) : (
        isNumeric && isNativeNumeric && size(value) ?
          parseFloat(
            value.toString().replace(/\,/g, '.').replace(/[^\d\.\+\-]*/g, '')
          ) : value
      );
    const notEmptyValue =
      size(isNumeric ? priceFormatter(value) : renderValue) > 0;

    if (isApplyCourse) {
      minValue = Math.round(minValue * course);
      maxValue = Math.round(maxValue * course);
      step = Math.round(step * course);
    }

    return (
      <div
        className={classNames(className, s.UInput, 'clearfix')}
        style={{display: isHidden || !visible ? 'none' : 'block'}}>
        <div className={classNames(
          'uinput-container', 'row',
          {'has-error': err === 'error'},
          {'has-warning': err === 'warning'}
        )}>
          <label
            className='input-label col-xs-12'
            style={{display: !label ? 'none' : 'inline-block'}}>
            <span>{label && label.replace(/currencyUnit/g, curUnit)}</span>
          </label>
          <div className='col-xs-12'>
            {isSliderEnabled && !isReadonly ? (
              <InputRange
                ref={`UInput-${objectName}-${fieldName}`}
                onChange={this.handleChange}
                value={value}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleOnFocus}
                onBlur={this.handleBlur}
                className={classNames(
                  {'uinput-with-unit': unit ? true : false}
                )}
                placeholder={placeholder.replace(/currencyUnit/g, curUnit)}
                rangeClassName='sliderwithInput'
                rangeMin={minValue}
                rangeMax={maxValue}
                rangeStep={step} />
            ) : (rows > 1 ? (
                <textarea
                  ref={`UInput-${objectName}-${fieldName}`}
                  className={classNames(
                    'form-control',
                    {'uinput-with-unit': unit ? true : false},
                    {[s.withRefreshButton]: refreshOn === 'click'}
                  )}
                  rows={rows}
                  disabled={isReadonly}
                  value={renderValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onFocus={this.handleOnFocus}
                  onBlur={this.handleBlur}
                  placeholder={placeholder.replace(/currencyUnit/g, curUnit)}/>
              ) : (
                <input
                  type={isNativeNumeric && focused ? 'number' : 'text'}
                  ref={`UInput-${objectName}-${fieldName}`}
                  className={classNames({
                    'form-control': true,
                    'uinput-with-unit': unit ? true : false,
                    [s.withRefreshButton]: refreshOn === 'click',
                    'uinput-with-funny-placeholder':
                      funnyPlaceHolder && notEmptyValue
                  })}
                  disabled={isReadonly}
                  value={isNumeric && (!isNativeNumeric || !focused) ?
                    priceFormatter(value) : renderValue
                  }
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onFocus={this.handleOnFocus}
                  onBlur={this.handleBlur}
                  placeholder={placeholder.replace(/currencyUnit/g, curUnit)}/>
              )
            )}
            {refreshOn === 'click' ? (
                <button
                  className={classNames(
                    s.refreshButton, 'uinput-refresh-button', 'form-control'
                  )}
                  onClick={this.handleClick}>
                  {refreshButtonText}
                </button>
            ) : null}
            <SuggestBox
              className={isSliderEnabled ? 'withSlider' : 'withoutSlider'}
              showSuggest={this.state.showSuggest}
              suggestValue={this.state.suggestValue}
              suggestActive={this.state.suggestActive}
              setSuggestValue={this.setSuggestValue} />
            {unit ? (
              <span className='uinput-unit'>
                {unit.replace(/currencyUnit/g, curUnit)}
              </span>
            ) : null}
            {msg ? (
              <span className='help-block'>
                {msg}
              </span>
            ) : null}
            {help ? (
              <HelpIcon
                id={`uinput-${objectName}-${fieldName}`}
                closeButton={true}
                className='help-text-left'
                placement='top'
                helpText={help}/>
            ) : null}
            {funnyPlaceHolder && notEmptyValue ? (
              <span className='uinput-funny-placeholder'>
                {placeholder.replace(/currencyUnit/g, curUnit)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

}

UInput = connect(
  (state, ownProps) => {
    const {objectName, fieldName, isNumeric, secondValueName} = ownProps;
    const obj = state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {};

    return {
      isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
      isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
      msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
      err: obj._validationStates ? obj._validationStates[fieldName] : null,
      value: obj[fieldName] || (isNumeric ? 0 : ''),
      secondValue: secondValueName && obj[secondValueName] ?
        obj[secondValueName] : null,
      currency: state.ui.get('currency').toJS().current,
      countryCode: state.settings.get('countryCode').toJS(),
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : {},
      visible: ownProps.visibilityProperty ?
        state.ui.get(ownProps.visibilityProperty) || false :
        true
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(UInput);

UInput = withCondition()(UInput);
//UInput = listenCaret()(UInput); //temporarily disabled, until refactoring

export default UInput;
