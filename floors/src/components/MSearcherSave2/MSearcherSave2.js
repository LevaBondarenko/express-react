/**
 * MSearcherSave2 widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {size} from 'lodash';
import classNames from 'classnames';
import moment from 'moment/moment';
import ga from '../../utils/ga';
import s from './MSearcherSave2.scss';
import {modelCompare} from '../../utils/Helpers';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {userDataCreate} from '../../actionCreators/UserDataActions';
import {updateInUiState} from '../../actionCreators/UiActions';
import {getActiveModel} from '../../selectors/';

class MSearcherSave2 extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    model: PropTypes.object,
    actions: PropTypes.object,
    buttonText: PropTypes.string,
    gaEvent: PropTypes.string,
    gaEventSuccess: PropTypes.string,
    cityId: PropTypes.number,
    isAuthorized: PropTypes.bool,
    isSearchesEnabled: PropTypes.bool,
    searches: PropTypes.array
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      searchTitle: ''
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {searches: newSearches, model: newModel} = nextProps;
    const {searches, model} = this.props;
    const searchesChanged = size(searches) !== size(newSearches);
    const modelChanged = !modelCompare(model, newModel);
    const isAuthorizedChanged =
      this.props.isAuthorized !== nextProps.isAuthorized;
    const showChanged = this.state.show !== nextState.show;
    const searchTitleChanged = this.state.searchTitle !== nextState.searchTitle;

    return searchesChanged || modelChanged || isAuthorizedChanged ||
      showChanged || searchTitleChanged;
  }

  get created() {
    const {searches, model} = this.props;

    return !searches.every(item => {
      return !modelCompare(item.filter, model);
    });
  }

  get searchTitle() {
    const dateFormatted =
      (new Date(
        `${moment().format('YYYY-MM-DD')}T10:00:00+0500`
      ))
        .toLocaleString('ru', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

    return `Подписка от ${dateFormatted}`;
  }

  toggleShow = () => {
    const {gaEvent, isAuthorized} = this.props;

    size(gaEvent) && ga('button', gaEvent);
    if(isAuthorized) {
      this.setState(() => ({show: !this.state.show}));
    } else {
      this.props.actions.updateInUiState(['mobileShow'], () => ('lk'));
    }
  }

  create = () => {
    const {gaEventSuccess, model, cityId} = this.props;
    const {searchTitle} = this.state;
    const searchName = size(searchTitle) ? searchTitle : this.searchTitle;
    const objClass = model.class;

    size(gaEventSuccess) && ga('button', gaEventSuccess);

    model.city_id = model.city_id || cityId || 23; // eslint-disable-line camelcase
    this.props.actions.userDataCreate(
      {
        filter: JSON.stringify(model, (key, value) => {
          if(typeof value === 'number' && value) {
            return value.toString();
          }
          if(value) {
            return value;
          }
        }),
        name: searchName,
        class: objClass,
        notifications: 1,
        notifications_email: 1 //eslint-disable-line camelcase
      },
      'searches'
    );
  }

  titleChange = e => {
    const {value} = e.target;

    this.setState(() => ({searchTitle: value}));
  }

  render() {
    const {buttonText, isSearchesEnabled} = this.props;
    const {show, searchTitle} = this.state;

    return isSearchesEnabled ? (
      <div className={s.root}>
        <div className={s.button}>
          <button
            className={'form-control'}
            onClick={this.toggleShow}>
            <span className={s.addSearchIco} />
            <span className={s.addSearchText}>{buttonText}</span>
          </button>
        </div>
        {show ? (this.created ? (
          <div className={classNames(s.modal, 'mobile-modal', 'fullscreen')}>
            <div className={s.modalClose} onClick={this.toggleShow}/>
            <div className={s.modalTitle}>Вы подписаны</div>
            <span className={s.decription}>
              На новые предложения по вашему запросу.<br/>
              Изменить параметры уведомлений можно в разделе Подписки.
            </span>
          </div>
        ) : (
          <div className={classNames(s.modal, 'mobile-modal', 'fullscreen')}>
            <div className={s.modalClose} onClick={this.toggleShow}/>
            <div className={s.modalTitle}>Подпишитесь на обновления</div>
            <span className={s.decription}>
              Узнавайте первыми о новых предложениях, подходящих по параметрам,
              в личном кабинете.<br/><br/>
              Вы можете указать название подписки:
            </span>
            <input
              placeholder={this.searchTitle}
              className={classNames('form-control', s.titleInput)}
              value={searchTitle}
              onChange={this.titleChange}/>
            <button
              className={classNames('mobile-primary-button', s.createButton)}
              onClick={this.create}>
              <span className={s.createIco}/>
              <span className={s.createText}>{buttonText}</span>
            </button>
          </div>
        )) : null}
      </div>
    ) : null;
  }

}

export default connect(
  state => {
    const lkSettings = state.settings.get('lkSettings').toJS();
    const isSearchesEnabled = lkSettings.modules.find(item => {
      return item.name === 'searches' && item.enabled;
    }) !== undefined;

    return {
      model: getActiveModel(state),
      cityId: state.settings.get('cityId'),
      isAuthorized: state.userData.get('isAuthorized'),
      searches: state.userData.get('searches') ?
        state.userData.get('searches').toJS() : [],
      isSearchesEnabled: isSearchesEnabled
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({userDataCreate, updateInUiState}, dispatch)
    };
  }
)(MSearcherSave2);
