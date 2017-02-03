/**
 * UValidator widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import createFragment from 'react-addons-create-fragment';
import s from './UValidator.scss';
import classNames from 'classnames';
import {size, forEach, assignIn, omit, map} from 'lodash';
import {testPhone, phoneCleanup, testEmail} from '../../utils/Helpers';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  updateInObjectsState, mergeInObjectsState
} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

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

class UValidator extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    rules: React.PropTypes.array,
    validateOnChange: React.PropTypes.bool,
    displayErrors: React.PropTypes.string,
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    dumpToConsole: React.PropTypes.bool,
    blockHeight: React.PropTypes.number,
    actions: PropTypes.object,
    obj: React.PropTypes.object,
    countryCode: React.PropTypes.object,
  };

  static defaultProps = {
    rules: [],
    validateOnChange: false,
    blockHeight: 60
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      checked: {},
      errors: {},
      validateOnChangeOverride: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.processProps(this.props, true);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = (props, isInit = false) => {
    const {
      objectName, dumpToConsole, validateOnChange, obj
    } = props;
    const {_needValidate} = obj || {};
    const {validateOnChangeOverride} = this.state;

    dumpToConsole && console.log('UValidator:', obj); //eslint-disable-line no-console

    if(isInit) {
      const {rules} = this.props;
      const initObj = {
        _validationStatus: true,
        _validationStates: {},
        _validationMsgs: {},
        _needValidate: false,
        _readonly: [],
        _hidden: []
      };

      forEach(rules, item => {
        const {rule, field} = item;

        switch(rule) {
        case 'readonly':
          initObj._readonly.push(field);
          break;
        case 'hidden':
          initObj._hidden.push(field);
          break;
        default:
          //do nothing
        }
      });
      this.props.actions.mergeInObjectsState({[objectName]: {...initObj}});
    }

    (validateOnChange || _needValidate || validateOnChangeOverride) &&
      setTimeout(() => {
        const validationResult = this.validate(obj);

        if(validationResult || _needValidate) {
          const vdToSave = validationResult ?
            validationResult : {_needValidate: false};

          this.props.actions.mergeInObjectsState({[objectName]: {...vdToSave}});
        }
        isMounted(this) && validationResult && this.setState(() => ({
          validateOnChangeOverride: true
        }));
      }, 100);
  }

  validate = obj => {
    const {rules, countryCode} = this.props;
    const {checked} = this.state;
    const newChecked = {};
    const withErrors = [];
    let {
      _validationStates, _validationMsgs
    } = obj || {};
    let anyChanged = false;
    let _validationStatus = true;

    forEach(rules, item => {
      const {rule, field, param, msg, err} = item;
      const fieldValue = obj[field] === undefined ? null : (
        typeof obj[field] !== 'object' ? obj[field] : JSON.stringify(obj[field])
      );

      if(fieldValue !== checked[field] && withErrors.indexOf(field) === -1) {
        let error = false;

        newChecked[field] = fieldValue;
        anyChanged = true;

        _validationStates = omit(_validationStates, field);
        _validationMsgs = omit(_validationMsgs, field);

        switch(rule) {
        case 'array_min_length':
          error = !obj[field] || size(obj[field]) < parseInt(param);
          break;
        case 'min_length':
          error = !obj[field] || size(obj[field].toString()) < parseInt(param);
          break;
        case 'required':
          error = !obj[field] || size(obj[field].toString()) < 1;
          break;
        case 'phone':
          error = !testPhone(
            phoneCleanup(obj[field]),
            true,
            countryCode.avail
          );
          break;
        case 'email':
          error = !testEmail(obj[field]);
          break;
        default:
          //do nothing
        }

        if(error) {
          withErrors.push(field);
          _validationStates[field] = err;
          _validationMsgs[field] = msg;
          _validationStatus = false;
        } else {
          _validationStates[field] = null;
          _validationMsgs[field] = null;
        }
      }
    });

    const result = {
      _needValidate: false,
      _validationStatus: _validationStatus,
      _validationStates: _validationStates,
      _validationMsgs: _validationMsgs
    };

    if(anyChanged) {
      isMounted(this) && this.setState(() => ({
        checked: assignIn(checked, newChecked),
        errors: result
      }));
    } else {
      isMounted(this) && this.setState(() => ({
        checked: assignIn(checked, newChecked)
      }));
    }

    return anyChanged && result;
  }

  render() {
    const {errors} = this.state;
    const {displayErrors, className, blockHeight, id} = this.props;
    const anyErrors = errors._validationStates &&
      Object.keys(errors._validationStates).filter(key => {
        return errors._validationStates[key] !== null;
      }).length > 0;
    let errorsBlock = null;

    if(errors && anyErrors) {
      switch(displayErrors) {
      case 'one':
        const withError = errors._validationStates &&
          Object.keys(errors._validationStates).find(key => {
            return errors._validationStates[key] !== null;
          });

        errorsBlock = (
          <span
            key={`${id}-0`}
            className={withError ? classNames(
              {'has-error': errors._validationStates[withError] === 'error'},
              {'has-warning': errors._validationStates[withError] === 'warning'}
            ) : null}>
            {errors._validationMsgs[withError]}
          </span>
        );
        break;
      case 'all':
        errorsBlock = map(errors._validationMsgs, (item, key) => {
          return errors._validationStates[key] ? (
            <span
              key={`${id}-${key}`}
              className={errors._validationStates ? classNames(
                {'has-error': errors._validationStates[key] === 'error'},
                {'has-warning': errors._validationStates[key] === 'warning'}
              ) : null}>
              {item}
            </span>
          ) : null;
        });
        break;
      default:
        //do nothing
      }
    }

    errorsBlock = size(errorsBlock) > 0 ?
      createFragment({errorsBlock: errorsBlock}) : null;

    return displayErrors === 'disabled' || !anyErrors ? (
      <div className={s.root}/>
    ) : (
      <div
        className={classNames(className, s.root, 'clearfix')}
        style={{height: blockHeight > 0 ? `${blockHeight}px` : 0}}>
        {anyErrors ? (
          <div className={classNames(
            'uvalidator-container',
            'help-block',
            {'uvalidator-tooltip': blockHeight < 0}
          )} style={{bottom: blockHeight < 0 ? `${-blockHeight}px` : null}}>
            {errorsBlock}
          </div>
        ) : null}
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(
    {updateInObjectsState, mergeInObjectsState},
    dispatch
  )};
}

function mapStateToProps(state, ownProps) {
  const {
    objectName
  } = ownProps;

  return {
    obj: state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {},
    countryCode: state.settings.get('countryCode').toJS()
  };
}


UValidator = connect(mapStateToProps, mapDispatchToProps)(UValidator);
UValidator = withCondition()(UValidator);

export default UValidator;
