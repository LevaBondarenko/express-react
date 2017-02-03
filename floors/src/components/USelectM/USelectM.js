/**
 * USelectM widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import {declOfNum} from '../../utils/Helpers';
import s from './USelectM.scss';
import {size, map, filter, difference, sortBy} from 'lodash';
import Immutable, {Iterable} from 'immutable';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class USelectM extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    collectionName: React.PropTypes.string,
    defaultLabel: PropTypes.string,
    modalLabel: PropTypes.string,
    searchLabel: PropTypes.string,
    replacement: PropTypes.array,
    customLabel: PropTypes.string,
    actions: PropTypes.object,
    values: PropTypes.array,
    value: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string
    ]),
    storeValues: PropTypes.array,
    defaultValue: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string
    ]),
    visible: PropTypes.bool
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      search: '',
      onlySelected: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    nextProps.value.length || this.setState(() => ({onlySelected: false}));
  }

  shouldComponentUpdate(nextProps, nextState) {
    const collectionChanged =
      size(this.props.storeValues) !== size(nextProps.storeValues) ||
      size(difference(
        this.props.storeValues.map(item => item.id),
        nextProps.storeValues.map(item => item.id)
      )) > 0;
    const selectionChanged =
      size(this.props.value) !== size(nextProps.value) ||
      size(difference(this.props.value, nextProps.value)) > 0;
    const stateChanged = this.state.show !== nextState.show ||
      this.state.search !== nextState.search ||
      this.state.onlySelected !== nextState.onlySelected;

    return collectionChanged || selectionChanged || stateChanged;
  }

  toggleShow = () => {
    this.setState(() => ({
      show: !this.state.show,
      search: this.state.show ? '' : this.state.search
    }));
  }

  toggleModeSelected = () => {
    this.setState(() => ({onlySelected: true}));
  }

  toggleModeAll = () => {
    this.setState(() => ({onlySelected: false}));
  }

  clear = () => {
    const {objectName, fieldName} = this.props;

    this.props.actions.updateInObjectsState([objectName, fieldName], () => (
      Immutable.fromJS([])));
  }

  searchChange = e => {
    const {value} = e.target;

    this.setState(() => ({search: value}));
  }

  selectionChange = e => {
    const {objectName, fieldName} = this.props;
    const {value} = e.target;

    this.props.actions.updateInObjectsState([objectName, fieldName], state => {
      const isEmpty = state == undefined;
      const wasIterable = Iterable.isIterable(state);
      const selected = isEmpty ? [] : (wasIterable ? state.toJS() : state);
      const index = selected.indexOf(value);

      if (index > -1) {
        selected.splice(index, 1);
      } else {
        selected.push(value);
      }
      return wasIterable || isEmpty ? Immutable.fromJS(selected) : selected;
    });
  }

  get buttonTitle() {
    const {
      value, replacement, defaultLabel, customLabel, storeValues
    } = this.props;
    const count = value.length;
    let selectedItem = null;

    if (count === 1) {
      selectedItem =
        storeValues.find(item => (item.id === value[0])) ||
        {name: ''};
    }

    return count > 0 ? (
      count > 1 ? (
        `${customLabel} ${count} ${declOfNum(count, replacement)}`
      ) : (
        `${customLabel} ${selectedItem.name}`
      )
    ) : defaultLabel;
  }

  get list() {
    const {storeValues, value, objectName, fieldName} = this.props;
    const {search, onlySelected} = this.state;
    const list = map(sortBy(filter(storeValues, item => {
      const bySelected = onlySelected ?
        value.indexOf(item.id.toString()) > -1 : true;
      const bySearch = search.length ?
        item.name.toLowerCase().indexOf(search.toLowerCase()) === 0 : true;

      return bySelected && bySearch;
    }),
    item => item.name),
    item => {
      const checked = value.indexOf(item.id.toString()) > -1;

      return (
        <div key={`${objectName}-${fieldName}-${item.id}`}>
          <input
            id={`${objectName}-${fieldName}-${item.id}`}
            type='checkbox'
            checked={checked}
            onChange={this.selectionChange}
            value={item.id}/>
          <label htmlFor={`${objectName}-${fieldName}-${item.id}`}>
            <i/>
            <span>{item.name}</span>
          </label>
        </div>
      );
    });

    return size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: (
        <div className={s.emptyList}>
          Ни один элемент не соответствует условиям отображения
        </div>
      )});
  }

  render() {
    const {show, onlySelected, search} = this.state;
    const {value, replacement, modalLabel, searchLabel} = this.props;
    const count = value.length;

    return (
      <div className={s.root}
        style={{display: !this.props.visible ? 'none' : 'block'}}>
        <button
          onClick={this.toggleShow}
          className={classNames('form-control', s.toggleButton)}>
          {this.buttonTitle}
        </button>
        {count > 0 ? (
          <button className={s.buttonClear} onClick={this.clear}/>
        ) : null}
        {show ? (
          <div className={classNames(s.modal, 'mobile-modal', 'fullscreen')}>
            <div className={s.modalClose} onClick={this.toggleShow}/>
            <div className={s.modalTitle}>{modalLabel}</div>
            <input
              type='text'
              value={search}
              className={classNames(s.search, 'form-control')}
              onChange={this.searchChange}
              placeholder={searchLabel}/>
            <div className={classNames(s.modeSelector, 'btn-group')}>
              <button
                className={classNames(
                  s.modeButton, {[s.active]: !onlySelected}, 'form-control'
                )}
                onClick={this.toggleModeAll}>
                Все
              </button>
              <button
                className={classNames(
                  s.modeButton, {[s.active]: onlySelected}, 'form-control'
                )}
                disabled={!count}
                onClick={this.toggleModeSelected}>
                {`Выбранные: ${count}`}
              </button>
            </div>
            <button
              disabled={!count}
              onClick={this.clear}
              className={classNames(s.buttonClear2, 'form-control')}>
              Очистить
            </button>
            <div className={s.list}>
              {this.list}
            </div>
            <button
              className={classNames(s.accept, 'mobile-primary-button')}
              onClick={this.toggleShow}>
              {count > 0 ? (
                `Выбрать ${count} ${declOfNum(count, replacement)}`
              ) : (
                'Закрыть'
              )}
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const {objectName, fieldName, collectionName} = ownProps;
    const obj = state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {};

    return {
      value: obj[fieldName] || [],
      storeValues: obj.collections ?
        (obj.collections[collectionName] || []) : [],
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
)(USelectM);
