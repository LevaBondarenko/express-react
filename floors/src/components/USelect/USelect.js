/**
 * UInput widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import createFragment from 'react-addons-create-fragment';

import s from './USelect.scss';
import HelpIcon from '../../shared/HelpIcon';
import {getMortgageTypeByObject} from '../../utils/mortgageHelpers';
import ContextType from '../../utils/contextType';
import classNames from 'classnames';
import GeminiScrollbar from 'react-gemini-scrollbar';
import FormControl from 'react-bootstrap/lib/FormControl';
import {
  size, map, find, forEach, intersection, union, filter, flatten, difference,
  isArray
} from 'lodash';
import withCondition from '../../decorators/withCondition';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class USelect extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: React.PropTypes.string,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    className: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    searchPlaceholder: React.PropTypes.string,
    label: React.PropTypes.string,
    selectedLabel: React.PropTypes.string,
    help: React.PropTypes.string,
    isMultiselectEnabled: React.PropTypes.bool,
    isArray: React.PropTypes.bool,
    isSimple: React.PropTypes.bool,
    isTextSearchEnabled: React.PropTypes.oneOfType([
      React.PropTypes.bool, React.PropTypes.string
    ]),
    isCountOnlySelf: React.PropTypes.bool,
    collectionName: React.PropTypes.string,
    values: React.PropTypes.array,
    defaultValue: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string
    ]),
    actions: PropTypes.object,
    objectInfo: PropTypes.object,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
      React.PropTypes.number
    ]),
    storeValues: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ]),
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
  };

  static defaultProps = {
    isMultiselectEnabled: false,
    searchPlaceholder: 'Поиск...'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = this.processProps(props);
    this.state.listWidth = 0;
    this.state.listHeight = 0;
    this.state.q = '';
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    const {
      defaultValue, objectName, fieldName, isArray, isMultiselectEnabled,
      objectInfo
    } = this.props;
    const {value: existValue} = this.props;

    if(defaultValue && (!existValue || (isArray || isMultiselectEnabled ?
      existValue[0] === defaultValue[0] : existValue === defaultValue))) {
      const parsedDefault = defaultValue ?
        defaultValue.toString().split(':') : [];

      if(parsedDefault[0] === '_fromObject') {
        const objectValue = parsedDefault[1] === 'realtyTypeForMortgage' ?
          getMortgageTypeByObject(objectInfo) : objectInfo[parsedDefault[1]];
        const newValue = isArray || isMultiselectEnabled ?
          flatten([objectValue]) : objectValue;

        this.props.actions.updateInObjectsState(
          [objectName, fieldName], () => (newValue));
      } else if(!existValue) {
        this.props.actions.updateInObjectsState(
          [objectName, fieldName], () => (defaultValue));
      }
    }
    this.setState(() => (this.processProps(this.props)));
  }

  componentWillUnmount() {
    this.removeCss();
    document.removeEventListener('click', this.close);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => (this.processProps(nextProps)));
  }

  processProps = props => {
    const {
      values, collectionName, value, storeValues, isMultiselectEnabled, isArray,
      isCountOnlySelf
    } = props;
    let collection = collectionName && size(storeValues) ?
      map(storeValues, item => {
        return {value: item.id, title: item.name};
      }) : map(values, item => {
        return {value: item.id, title: item.name};
      });

    if(isCountOnlySelf) {
      const selfIdxs = values.map(item => item.id);

      collection = filter(collection, item => {
        return selfIdxs.indexOf(item.value) > -1;
      });
    }

    return {
      values: collection || [],
      value: value || (isArray && isMultiselectEnabled ? [] : ''),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const collectionChanged =
      size(this.state.values) !== size(nextState.values) ||
      size(difference(
        this.state.values.map(item => item.value),
        nextState.values.map(item => item.value)
      )) > 0;
    const valueChanged = isArray(nextState.value) ? (
        size(this.state.value) !== size(nextState.value) ||
          size(difference(this.state.value, nextState.value)) > 0 ||
          size(difference(nextState.value, this.state.value)) > 0
      ) : this.state.value !== nextState.value;
    const validationChanged = this.props.isReadonly !== nextProps.isReadonly ||
      this.props.isHidden !== nextProps.isHidden ||
      this.props.msg !== nextProps.msg || this.props.err !== nextProps.err;
    const stateChanged = this.state.show !== nextState.show ||
      this.state.q !== nextState.q ||
      this.state.listWidth !== nextState.listWidth ||
      this.state.listHeight !== nextState.listHeight;

    return collectionChanged || valueChanged || stateChanged ||
      validationChanged;
  }

  recalcUlSize = () => {
    const ulNode = ReactDOM.findDOMNode(this.refs.uSelectList);

    if(ulNode) {
      const newWidth = ulNode.offsetWidth;
      const newHeight = ulNode.offsetHeight;
      const {listWidth: oldWidth} = this.state;

      this.setState(() => ({
        listWidth: newWidth > oldWidth ? newWidth : this.state.listWidth,
        listHeight: newHeight + 12
      }));
    }

    if(this.props.isTextSearchEnabled) {
      const ts = ReactDOM.findDOMNode(this.refs.ts);

      if(ts) {
        ts.focus();
      }
    }
  }

  handleSelect = e => {
    const {
      objectName, fieldName, isMultiselectEnabled, isArray, isSimple
    } = this.props;
    const {value} = isSimple ? e.target : e.currentTarget.dataset;
    const {values, filteredValues, isReadonly} = this.state;
    const affected = value.split(',');
    let selected = this.state.value;
    const vals = filteredValues ? filteredValues : values;

    if(isMultiselectEnabled) {
      if(!size(selected)) {
        selected = affected;
      } else if(selected.indexOf(value) !== -1) {
        selected = filter(selected, selitem => {
          return affected.indexOf(selitem) === -1;
        });
      } else {
        selected = union(selected, affected);
      }
    } else if(isArray) {
      forEach(vals, item => {
        selected = filter(selected, selitem => {
          return item.value.split(',').indexOf(selitem) === -1;
        });
      });
      selected = union(selected, affected);
    } else {
      selected = value;
    }
    //WTF?!
    //const objToSet = {
    //  [fieldName]: selected
    //};
    //objToSet.notFirstCall = true;
    isReadonly || this.props.actions.updateInObjectsState(
      [objectName, fieldName], () => (selected));
    isMultiselectEnabled || this.close();
  }

  toggle = () => {
    const {isReadonly} = this.state;

    if(!isReadonly) {
      if(!this.state.show) {
        document.addEventListener('click', this.close);
      } else {
        document.removeEventListener('click', this.close);
      }
      this.setState(() => ({show: !this.state.show}));
      setTimeout(this.recalcUlSize, 100);
    }
  }

  close = e => {
    let ancestor = e && e.target;

    if(ancestor && ancestor.classList && ancestor.classList.contains('fa')) {
      return false;
    }

    if(ancestor) {
      while(!(ancestor.classList &&
        ancestor.classList.contains('uselect-container')) &&
        (ancestor = ancestor.parentNode)) {};
    }

    if(!ancestor || ancestor.id !== this.props.id) {
      this.setState(() => ({show: false, q: '', filteredValues: null}));
      document.removeEventListener('click', this.close);
    }
  }

  textSearch = event => {
    const q = event.target.value.toLowerCase();
    const {values} = this.state;

    const filteredValues = filter(values, val => {
      const piece = val.title.slice(0, q.length);

      return piece.toLowerCase() === q.toLowerCase();
    });

    this.setState(() => ({
      filteredValues: filteredValues,
      q: q
    }));
  }

  clearSearch = event => {
    event.preventDefault();

    this.setState(() => ({
      q: '',
      filteredValues: null
    }));
  }

  getSelectedItems = () => {
    const {isMultiselectEnabled, isArray} = this.props;
    const {value, values, filteredValues} = this.state;
    const vals = filteredValues ? filteredValues : values;
    let valuesIds = [];

    size(vals) && forEach(vals, item => {
      valuesIds = union(valuesIds, item.value.split(','));
    });
    const val = isMultiselectEnabled || isArray ? value : [value.toString()];

    return intersection(val, valuesIds);
  }

  render() {
    const {
      value, values, show, listWidth, listHeight, filteredValues, q
    } = this.state;
    const resultValues = filteredValues ? filteredValues : values;
    const {
      objectName, fieldName, className, placeholder, label, selectedLabel,
      help, isMultiselectEnabled, isArray, isSimple, id: widgetId,
      msg, err, isReadonly, isHidden, isTextSearchEnabled, searchPlaceholder
    } = this.props;
    const selectedItems = this.getSelectedItems();
    const selectedCount = size(selectedItems);
    const selectedItem = selectedCount ?
      find(values, item => {
        return item.value.split(',').indexOf(selectedItems[0]) !== -1;
      }) : null;
    const selectedTitle = selectedItem ? selectedItem.title : null;
    const buttonTitle = selectedCount ?
      (isMultiselectEnabled && selectedCount > 1 ?
      selectedLabel.replace(/count/g, selectedCount) :
      (selectedTitle ? selectedTitle : placeholder)) :
      placeholder;
    const selectedValue = isSimple ? value : null;
    let list = map(resultValues, item => {
      const itemValues = item.value.split(',');
      const selected = isMultiselectEnabled || isArray ?
        (value && size(intersection(value, itemValues))) :
        (value === item.value);

      return isSimple ? (
        <option
          key={`${widgetId}-${item.value}`}
          value={item.value}
          data-value={item.value}>
          {item.title}
        </option>
      ) : (
        <li
          key={`${widgetId}-${item.value}`}
          className={classNames(
            {'uselect-active-item': selected && !isMultiselectEnabled},
            {'uselect-multiselect-item': isMultiselectEnabled}
          )}
          data-value={item.value}
          onClick={this.handleSelect}>
          <span>
            {isMultiselectEnabled ? (
              <span className='uselect-checkbox'>
                {selected ? (<i className='fa fa-check' />) : null}
              </span>
            ) : null}
          {item.title}
          </span>
        </li>
      );
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});

    return (
      <div
        className={classNames(className, s.USelect, 'clearfix')}
        style={{display: isHidden ? 'none' : 'block'}}>
        <div id={`${widgetId}`} className={classNames(
          'uselect-container', 'row',
          {'has-error': err === 'error'},
          {'has-warning': err === 'warning'}
        )}>
          <label
            className='input-label col-xs-12'
            style={{display: !label ? 'none' : 'inline-block'}}>
            <span>{label}</span>
          </label>
          {isSimple ? (
            <div className='col-xs-12'>
              <FormControl componentClass='select'
                className={s.simple}
                value={selectedValue}
                disabled={size(resultValues) <= 0 || isReadonly}
                onChange={this.handleSelect}
                placeholder={buttonTitle}>
                {list}
              </FormControl>
            </div>
          ) : (
            <div className='col-xs-12'>
              <Button className={classNames(
                'form-control',
                'btn-select',
                {'disabled': size(resultValues) <= 0 || isReadonly}
              )}
                disabled={size(resultValues) <= 0 || isReadonly}
                bsStyle='default'
                data-field={`${objectName}-${fieldName}`}
                onClick={this.toggle}>
                <span className='btn-label'>{buttonTitle}</span>
                <span className='caret' />
              </Button>
              {show ? (
                <div className='uselect-wrapper'>
                  {isTextSearchEnabled ? (
                    <div className='uselect-text-search'
                      style={{
                        minWidth: listWidth ? `${listWidth}px` : '100%'
                      }}>
                      <input type="text"
                        placeholder={searchPlaceholder}
                        ref="ts"
                        value={q}
                        onChange={this.textSearch}/>
                      {size(q) ? (
                        <a href="#"
                           onClick={this.clearSearch}
                           className='fa fa-close' />
                      ) : null}
                    </div>
                  ) : null}
                  <div
                    className='uselect-list'
                    style={{
                      height: listHeight < 200 ? `${listHeight}px` : null,
                      minWidth: listWidth ? `${listWidth}px` : '100%',
                      top: this.props.isTextSearchEnabled ? '225%' : '100%'
                    }}>
                    <GeminiScrollbar>
                      <ul ref='uSelectList'>
                        {list}
                      </ul>
                    </GeminiScrollbar>
                  </div>
                </div>
              ) : null}
              {msg ? (
                <span className='help-block'>
                {msg}
              </span>
              ) : null}
              {help ? (
                <HelpIcon
                  id={`uselect-${objectName}-${fieldName}`}
                  closeButton={true}
                  className='help-text-left'
                  placement='top'
                  helpText={help}/>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

}

USelect = connect(
  (state, ownProps) => {
    const {
      objectName, fieldName, collectionName, isArray, isMultiselectEnabled
    } = ownProps;
    const obj = state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {};

    return {
      isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
      isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
      msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
      err: obj._validationStates ? obj._validationStates[fieldName] : null,
      value: obj[fieldName] ||
        (isArray || isMultiselectEnabled ? [] : ''),
      storeValues: obj.collections ?
        (obj.collections[collectionName] || []) : [],
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : {}
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(USelect);
USelect = withCondition()(USelect);

export default USelect;
