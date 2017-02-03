/**
 * UCheckBox widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './UCheckBox.scss';
import HelpIcon from '../../shared/HelpIcon';
import CheckButton from '../../shared/CheckButton';
import classNames from 'classnames';
import withCondition from '../../decorators/withCondition';
import {isEqual} from 'lodash';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class UCheckBox extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    onValue: React.PropTypes.string,
    offValue: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    className: React.PropTypes.string,
    label: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    title: React.PropTypes.string,
    isRadio: React.PropTypes.bool,
    help: React.PropTypes.string,
    isCollection: React.PropTypes.bool,
    actions: PropTypes.object,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.array
    ]),
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
  };

  static defaultProps = {
    isRadio: false,
    isCollection: false
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

  componentDidMount() {
    const {
      defaultValue, objectName, fieldName, isCollection
    } = this.props;

    if(defaultValue && isCollection) {
      const newValue = defaultValue.split(',');

      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (newValue));
    }
    this.setState(() => (this.processProps(this.props)));
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => (this.processProps(nextProps)));
  }

  processProps = props => {
    const {
      onValue, isCollection, value, isReadonly, isHidden, msg, err
    } = props;

    if(isCollection) {
      return {
        checked: isEqual(value, onValue.split(',')),
        msg: msg,
        err: err,
        isReadonly: isReadonly,
        isHidden: isHidden
      };

    } else {
      return {
        checked: value === onValue,
        msg: msg,
        err: err,
        isReadonly: isReadonly,
        isHidden: isHidden
      };
    }

  }

  handleChange = () => {
    const {checked} = this.state;
    const {
      objectName,
      fieldName,
      offValue,
      onValue,
      isRadio,
      isCollection
    } = this.props;
    let newValue = null;

    if(isCollection) {
      newValue = checked ? offValue.split(',') : onValue.split(',');
    } else {
      newValue = checked ? offValue : onValue;
    }
    (!isRadio || !checked) && this.props.actions.updateInObjectsState(
      [objectName, fieldName], () => (newValue));
  }

  render() {
    const {
      objectName, fieldName, offValue, onValue, isRadio, label, help, className,
      title
    } = this.props;
    const {checked, msg, err} = this.state;

    return (
      <div className={classNames(className, s.UCheckBox, 'clearfix')}>
        <div className={classNames(
          'ucheckbox-container', 'row',
          {'has-error': err === 'error'},
          {'has-warning': err === 'warning'}
        )}>
          <label className='input-label col-xs-12'>
            {title}
          </label>
          <div className='col-xs-12'>
            <CheckButton
              itemID={`ucheckbox-${objectName}-${fieldName}-${onValue}`}
              onValue={onValue}
              offValue={offValue}
              radiomode={isRadio}
              onChange={this.handleChange}
              checked={checked}
              itemLabel={label}/>
            {msg ? (
              <span className='help-block'>
                {msg}
              </span>
            ) : null}
            {help ? (
              <HelpIcon
                id={`ucheckbox-${objectName}-${fieldName}`}
                closeButton={true}
                className='help-text-left'
                placement='top'
                helpText={help}/>
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
  const {
    objectName, fieldName, isCollection
  } = ownProps;
  const obj = state.objects.get(objectName) ?
    state.objects.get(objectName).toJS() : {};

  return {
    isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
    isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
    msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
    err: obj._validationStates ? obj._validationStates[fieldName] : null,
    value: obj[fieldName] || (isCollection ? [] : null)
  };
}

UCheckBox = connect(mapStateToProps, mapDispatchToProps)(UCheckBox);
UCheckBox = withCondition()(UCheckBox);

export default UCheckBox;
