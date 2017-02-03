/**
 * Authorization Panel component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
import AuthPanelUserMenu from './AuthPanelUserMenu';
import AuthPanelLogin from './AuthPanelLogin';
import s from './authpanel.scss';
import ga from '../../utils/ga';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import emptyFunction from 'fbjs/lib/emptyFunction';
const Basil = canUseDOM ? require('basil.js') : {};

/**
 * Bootstrap 3 elements
 */
import Badge from 'react-bootstrap/lib/Badge';
/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import UserTypes from '../../constants/UserTypes';
import WidgetsActions from '../../actions/WidgetsActions';

class AuthPanel extends Component {
  static propTypes = {
    invite: React.PropTypes.string,
    inviteFirst: React.PropTypes.string,
    invitePeriod: React.PropTypes.string,
    inviteText: React.PropTypes.string,
    profilePath: React.PropTypes.string,
    modules: React.PropTypes.object,
    showCompare: React.PropTypes.string,
    paymentsUrl: React.PropTypes.string,
    paymentsScid: React.PropTypes.string,
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
    this.toLK = false;
    this.state = {
      showForm: null,
      survey: null
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    window.addEventListener('hashchange', this.onHashChange);
    userStore.onChange(this.onChange);
  }

  componentDidMount() {
    this.initUserStore();
    this.onHashChange();
  }

  initUserStore = () => {
    const lkSettings = {};

    lkSettings.invite = {
      enabled: parseInt(this.props.invite),
      first: parseInt(this.props.inviteFirst),
      period: parseInt(this.props.invitePeriod),
      text: this.props.inviteText
    };
    lkSettings.paymentsUrl = this.props.paymentsUrl;
    lkSettings.paymentsScid = parseInt(this.props.paymentsScid);
    lkSettings.modules = this.props.modules;
    lkSettings.isInitialized = true;
    UserActions.fill(lkSettings);
    this.setState(() => ({
      isAuthorized: userStore.get('isAuthorized'),
      user: userStore.get('userInfo'),
      showForm: userStore.get('showForm'),
      survey: userStore.get('survey'),
      lkSettings: lkSettings
    }));
    lkSettings.invite.enabled && UserActions.scheduleShowInvite();
  }


  componentWillUnmount() {
    this.removeCss();
    window.removeEventListener('hashchange', this.onHashChange);
    userStore.offChange(this.onChange);
  }

  onHashChange = () => {
    const isAuthorized = userStore.get('isAuthorized');
    const hash = canUseDOM && window.location.hash ?
      window.location.hash.replace('#', '') : null;
    /*global data*/
    const oid = data.object && data.object.info.object_id;
    const oclass = data.object && data.object.info.class;

    switch (hash) {
    case 'register':
      window.location.hash = '';
      if(isAuthorized === true) {
        window.location = `${this.props.profilePath}#`;
      } else {
        UserActions.showRegister();
        this.toLK = true;
      }
      break;
    case 'togglefavorite':
      if (isAuthorized === true) {
        const inFavorites = UserActions.inFavorite(oid, oclass);

        UserActions.updateFavorites(inFavorites ? 'del' : 'add', oid, oclass);
        const notifyBlock = (<div>
          <div className='notify-header'>Избранное</div>
          <div className='notify-body'>
            <span>Объект </span>
            <span><b>{oid}</b></span><br/>
            <span>
              {(inFavorites ?
                'удален из избранного' : 'добавлен в избранное')}.
            </span><br/>
            <a className='notify-link' href='/my/#/favorites/'>
              Перейти к избранному
            </a>
          </div>
        </div>);

        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 15
        }]);
      } else {
        const invite = userStore.get('invite');

        if(invite.enabled) {
          UserActions.showInvite();
        } else {
          UserActions.showLogin();
        }
      }
      window.location.hash = '';
      break;
    case 'togglecompare':
      const inCompare = UserActions.inCompare(oid, oclass);

      UserActions.updateCompare(inCompare, oid, oclass);
      window.location.hash = '';
    default:
      break;
    }
  }

  onChange = () => {
    const isAuthorized = userStore.get('isAuthorized');
    const isInitialized = userStore.get('isInitialized');
    const showForm = userStore.get('showForm');

    if(isInitialized) {
      if(this.toLK && isAuthorized) {
        window.location = `${this.props.profilePath}#`;
      }
      if(showForm === UserTypes.FORM_REGISTER) {
        this.toLK = false;
      }
      this.setState(() => ({
        isAuthorized: isAuthorized,
        user: userStore.get('userInfo'),
        showForm: showForm,
        survey: userStore.get('survey'),
        myauctions: userStore.get('myauctions'),
        favorites: userStore.get('favorites'),
        messages: userStore.get('messages'),
        objects: userStore.get('objectsCache'),
        bidOnObject: userStore.get('bidOnObject')
      }));
    } else {
      setTimeout(() => { this.initUserStore(); }, 0);
    }
  }

  trackEvent = () => {
    ga('button', 'head_site_tyumen_lk_favorites');
  };

  getCompareCount() {
    const basil = new Basil({namespace: 'etagi_com'});

    return size(basil.get('objs2compare'));
  }

  render() {
    const favCount = size(this.state.favorites);
    const compareCount = this.getCompareCount();
    const {isAuthorized, lkSettings} = this.state;
    const {profilePath, showCompare} = this.props;
    const favoritesEnabled = lkSettings &&
      lkSettings.modules && lkSettings.modules.favorites;

    return (
      <div className={s.authpanel}>
        {parseInt(showCompare) ? (
          <div className={s.authpanelItem}>
            <a href='/compare/' onClick={this.trackEvent}>
              <i className='fa fa-list-ul'/>
              <span className={s.subIcon}>+</span>
              <span> Сравнение</span>
              {compareCount ? <Badge>{compareCount}</Badge> : null}
            </a>
          </div>
        ) : null }
        {isAuthorized && favoritesEnabled ? (
          <div className={s.authpanelItem}>
            <a href={`${profilePath}#/favorites/`} onClick={this.trackEvent}>
              <i className='fa fa-heart-o'/>
              <span> Избранное</span>
              {favCount ? <Badge>{favCount}</Badge> : null}
            </a>
          </div>
        ) : null }
        {isAuthorized ?
          <AuthPanelUserMenu {...this.state} {...this.props}/> :
          <AuthPanelLogin {...this.state} {...this.props}/>
        }
      </div>
    );
  }
}

AuthPanel.defaultProps = {
  invite: '0',
  inviteFirst: '0',
  invitePeriod: '0',
  inviteText: ''
};

export default AuthPanel;
