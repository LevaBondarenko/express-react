/**
 * UDoubleInput widget class
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

import React, {Component, PropTypes} from 'react';

import s from './UDoubleInput.scss';
import InputRange from '../../shared/InputRange';
import HelpIcon from '../../shared/HelpIcon';
import classNames from 'classnames';
import {priceFormatter} from 'etagi-helpers';
import listenCaret from '../../decorators/listenCaret';
import {getHelpValue} from '../../utils/priceHelpers';
import ContextType from '../../utils/contextType';

/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

import withCondition from '../../decorators/withCondition';
import SuggestBox from '../../shared/SuggestBox/';

@withCondition()
class UDoubleInput extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    parentField: React.PropTypes.string,
    parameterStore: React.PropTypes.string,
    className: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    label: React.PropTypes.string,
    isApplyCourse: React.PropTypes.bool,
    unit: React.PropTypes.string,
    help: React.PropTypes.string,
    refreshOn: React.PropTypes.string,
    isSliderEnabled: React.PropTypes.bool,
    defaultValue: React.PropTypes.number,
    step: React.PropTypes.number,
    currency: React.PropTypes.object,
    actions: PropTypes.object,
    parentValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    funnyPlaceHolder: React.PropTypes.bool,
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
    isNativeNumeric: PropTypes.bool
  };

  static defaultProps = {
    defaultValue: 30,
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

  componentWillUnmount() {
    this.removeCss();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const valueChanged = this.props.value !== nextProps.value ||
      this.props.parentValue !== nextProps.parentValue;
    const validationChanged = this.props.isReadonly !== nextProps.isReadonly ||
      this.props.isHidden !== nextProps.isHidden ||
      this.props.msg !== nextProps.msg || this.props.err !== nextProps.err;
    const stateChanged = this.state.showSuggest !== nextState.showSuggest ||
      this.state.suggestValue !== nextState.suggestValue;

    return valueChanged || stateChanged || validationChanged;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => (this.processProps(nextProps)));
  }

  processProps = props => {
    const {
      isApplyCourse, parameterStore
    } = props;
    let {
      value, parentValue
    } = props;
    const {currency} = props;
    const course = currency ? (currency.nominal / currency.value) : 1;
    const curUnit = currency ? (currency.symbol) : 'руб';

    if (parameterStore === 'percent') {
      if (currency && isApplyCourse) {
        parentValue = parentValue && !isNaN(parentValue) ?
          Math.round(parentValue * course) : 0;
      }

      return {
        course: course,
        curUnit: curUnit,
        percentValue: Math.round(value),
        numberValue: Math.round(parentValue * value / 100),
        parentValue: parentValue
      };
    } else {
      if (currency && isApplyCourse) {
        value = value ? Math.round(value * course) : 0;
        parentValue = parentValue && !isNaN(parentValue) ?
          Math.round(parentValue * course) : 0;
      }

      return {
        course: course,
        curUnit: curUnit,
        numberValue: Math.round(value),
        percentValue: Math.round(value / parentValue * 100),
        parentValue: parentValue
      };
    }
  }

  handleChange = (e, val) => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled,
      parameterStore
    } = this.props;
    const {parentValue} = this.state;
    const value = e ? e.target.value : val;
    let stateValue = parseFloat(
      value.toString().replace(/\s/g, '').replace(/\,/g, '.')
    );
    let percentValue = 0;

    isNaN(stateValue) && (stateValue = 0);
    const hValue = getHelpValue(stateValue, this);
    const hShow = e && value.toString().length < hValue.toString().length - 1 &&
      hValue > 0;

    if (parentValue && stateValue > parentValue) {
      stateValue = parentValue;
    }
    if (parentValue) {
      percentValue = stateValue / parentValue * 100;
    }

    if (isSliderEnabled || refreshOn === 'change') {
      const storingValue = parameterStore === 'percent' ?
        percentValue : stateValue;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (storingValue));
    } else if (refreshOn === 'blur') {
      this.setState(() => ({
        numberValue: stateValue,
        percentValue: percentValue
      }));
    }

    this.setState(() => ({
      showSuggest: hShow,
      suggestValue: hValue
    }));
  }

  setSuggestValue = () => {
    this.handleChange(false, this.state.suggestValue);

    this.setState(() => ({
      showSuggest: false,
      suggestActive: false
    }));

  };

  handleKeyDown = (event) => {

    if(this.state.showSuggest) {
      switch(event.which) {
      case 13:
        this.setSuggestValue();
        break;
      case 40:
        this.setState({
          suggestActive: true
        });
        break;
      case 38:
        this.setState({
          suggestActive: false
        });
        break;
      default:
        //do nothing
      }
    }
  }

  handleChangePercent = (e, val) => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled,
      isApplyCourse, parameterStore
    } = this.props;
    const {course, parentValue} = this.state;
    const value = e ? e.target.value : val;
    let stateValue = parseFloat(
      value.toString().replace(/\s/g, '').replace(/\,/g, '.')
    );
    let numberValue = 0;

    isNaN(stateValue) && (stateValue = 0);
    stateValue > 100 && (stateValue = 100);

    if (parentValue) {
      numberValue = Math.round(parentValue * stateValue / 100);
      numberValue = isApplyCourse ?
        Math.round(numberValue / course) : numberValue;
    }
    if (isSliderEnabled || refreshOn === 'change') {
      const storingValue = parameterStore === 'percent' ?
        stateValue : numberValue;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (storingValue));
    } else if (refreshOn === 'blur') {
      this.setState(() => ({
        percentValue: stateValue,
        numberValue: numberValue
      }));
    }
  }

  handleBlur = () => {
    const {
      objectName, fieldName, refreshOn, isSliderEnabled, parameterStore
    } = this.props;

    if (!isSliderEnabled && refreshOn === 'blur') {
      const {value, percentValue} = this.state;
      const setValue = parameterStore === 'percent' ?
        percentValue : value;

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (setValue));
    }

    setTimeout(() => {
      this.setState(() => ({
        showSuggest: false,
        focused: false
      }));
    }, 400);
  }

  handleOnFocus = (event) => {
    const value = event.target.value;
    const {suggestValue} = this.state;
    const show = suggestValue && suggestValue > 0 &&
      value.toString().length < suggestValue.toString().length - 1;

    this.setState(() => ({
      showSuggest: show,
      focused: true
    }));
  };

  render() {
    const {percentValue, numberValue, parentValue, focused} = this.state;
    const curUnit = this.props.currency.symbol;
    const {
      label, placeholder, isSliderEnabled, step, parentField,
      objectName, fieldName, className, unit, help, funnyPlaceHolder,
      isNativeNumeric
    } = this.props;

    return (
      <div className={classNames(className, s.UDoubleInput, 'clearfix')}>
        <div className='udoubleinput-container row'>
          <label
            className='input-label col-xs-12'
            style={{display: !label ? 'none' : 'inline-block'}}>
            <span>{label.replace(/currencyUnit/g, curUnit)}</span>
          </label>
          <div className='col-xs-12'>
            {isSliderEnabled ? (
              <InputRange
                ref={`udoubleinput-${objectName}-${fieldName}`}
                onChange={this.handleChange}
                value={numberValue}
                className={classNames(
                  {'udoubleinput-with-unit': unit ? true : false}
                )}
                rangeClassName='sliderwithInput'
                placeholder={placeholder.replace(/currencyUnit/g, curUnit)}
                rangeMin={0}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleOnFocus}
                onBlur={this.handleBlur}
                rangeMax={parentValue}
                rangeStep={Math.round(parentValue / step)} />
              ) : (
              <input
                type={isNativeNumeric && focused ? 'number' : 'text'}
                ref={`udoubleinput-${objectName}-${fieldName}`}
                className={classNames(
                  'form-control', {
                    'udoubleinput-with-unit': unit ? true : false,
                    'udoubleinput-with-funny-placeholder':
                      funnyPlaceHolder && numberValue !== null
                  }
                )}
                value={numberValue > 0 ?
                  priceFormatter(numberValue) : numberValue}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleOnFocus}
                onBlur={this.handleBlur}
                placeholder={placeholder.replace(/currencyUnit/g, curUnit)}/>
            )}
            {parentField &&
              <input
                type={isNativeNumeric && focused ? 'number' : 'text'}
                ref={`udoubleinput-${objectName}-${fieldName}-percent`}
                className={classNames(
                  'form-control',
                  {'udoubleinput-with-percent': unit ? true : false}
                )}
                value={percentValue}
                onChange={this.handleChangePercent}
                onBlur={this.handleBlur} />
            }
            {unit &&
              <span className='udoubleinput-unit'>
                {unit.replace(/currencyUnit/g, curUnit)}
              </span>
            }
            {parentField &&
              <span className='udoubleinput-percent'>
                %
              </span>
            }
            <SuggestBox
              className={isSliderEnabled ? 'withSlider' : 'withoutSlider'}
              showSuggest={this.state.showSuggest}
              suggestValue={this.state.suggestValue}
              suggestActive={this.state.suggestActive}
              setSuggestValue={this.setSuggestValue} />
            {help &&
              <HelpIcon
                id={`udoubleinput-${objectName}-${fieldName}`}
                closeButton={true}
                className='help-text-left'
                placement='top'
                helpText={help}/>
            }
            {funnyPlaceHolder && numberValue !== null ? (
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state, ownProps) {
  const {objectName, fieldName, parentField} = ownProps;
  const obj = state.objects.get(objectName) ?
    state.objects.get(objectName).toJS() : {};

  return {
    isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
    isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
    msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
    err: obj._validationStates ? obj._validationStates[fieldName] : null,
    value: obj[fieldName] || 0,
    parentValue: obj[parentField] || 0,
    currency: state.ui.get('currency').toJS().current,
    needCurrency: state.settings.get('needCurrency')
  };
}

UDoubleInput = connect(mapStateToProps, mapDispatchToProps)(UDoubleInput);
UDoubleInput = listenCaret()(UDoubleInput);

export default UDoubleInput;
