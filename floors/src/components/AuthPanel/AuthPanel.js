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
import AuthPanelUserMenu from '../AuthPanel/AuthPanelUserMenu';
import AuthPanelLogin from '../AuthPanel/AuthPanelLogin';
import ga from '../../utils/ga/';
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

class AuthPanel extends Component {
  static propTypes = {
    invite: React.PropTypes.string,
    inviteFirst: React.PropTypes.string,
    invitePeriod: React.PropTypes.string,
    inviteText: React.PropTypes.string,
    profilePath: React.PropTypes.string,
    modules: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.toLK = false;
    this.state = {
      showForm: null,
      survey: null
    };
    this.onChange = this.onChange.bind(this);
    this.onHashChange = this.onHashChange.bind(this);
    this.onHashChange();
  }

  componentWillMount() {
    window.addEventListener('hashchange', this.onHashChange);
    userStore.onChange(this.onChange);
  }

  componentDidMount() {
    this.initUserStore();
  }

  initUserStore = () => {
    const lkSettings = {};

    lkSettings.invite = {
      enabled: parseInt(this.props.invite),
      first: parseInt(this.props.inviteFirst),
      period: parseInt(this.props.invitePeriod),
      text: this.props.inviteText
    };
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
    window.removeEventListener('hashchange', this.onHashChange);
    userStore.offChange(this.onChange);
  }

  onHashChange() {
    const isAuthorized = userStore.get('isAuthorized');
    const hash = window.location.hash ?
      window.location.hash.replace('#', '') : null;

    if(hash === 'register') {
      window.location.hash = '';
      if(isAuthorized === true) {
        window.location = `${this.props.profilePath}#`;
      } else {
        UserActions.showRegister();
        this.toLK = true;
      }
    }
  }

  onChange() {
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
      this.initUserStore();
    }
  }

  trackEvent = () => {
    ga('button', 'head_site_tyumen_lk_favorites');
  };

  render() {
    const favCount = size(this.state.favorites);
    const {profilePath} = this.props;

    return (
      <div className='authpanel'>
        <div className='authpanel-item'>
          <a href={`${profilePath}#/favorites/`} onClick={this.trackEvent}>
            <i className='fa fa-heart'/>
            <span> Избранное</span>
            {favCount ? <Badge>{favCount}</Badge> : null}
          </a>
        </div>
        {this.state.isAuthorized ?
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
