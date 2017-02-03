/**
 * Authorization Panel Login Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import AuthPanelLoginForm from '../AuthPanel/AuthPanelLoginForm';
import AuthPanelWrongForm from '../AuthPanel/AuthPanelWrongForm';
import AuthPanelRegisterForm from '../AuthPanel/AuthPanelRegisterForm';
import AuthPanelRestoreForm from '../AuthPanel/AuthPanelRestoreForm';
import AuthPanelSurveyForm from '../AuthPanel/AuthPanelSurveyForm';
import AuthPanelInviteForm from '../AuthPanel/AuthPanelInviteForm';
import LKHelp from '../LKBody/LKHelp';
import ga from '../../utils/ga';
import userStore from '../../stores/UserStore';
import classNames from 'classnames';
import s from './authpanel.scss';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
/**
 * React/Flux entities
 */
import UserTypes from '../../constants/UserTypes';
import UserActions from '../../actions/UserActions';

/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;

class AuthPanelLogin extends Component {
  static propTypes = {
    showForm: React.PropTypes.string,
    lkSettings: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.basil = {};
  }

  componentDidMount() {
    const Basil = require('basil.js');

    this.basil = new Basil({namespace: 'etagi_com'});
  }

  close() {
    if(this.props.showForm === UserTypes.FORM_INVITE &&
      this.props.lkSettings.invite.enabled && canUseDOM) {
      const {basil} = this;
      const date = new Date();
      const invite = userStore.get('invite');

      if (!basil.get('inviteShowed') ||
        date.getTime() > basil.get('inviteShowed')) {
        basil.set('inviteShowed', date.getTime() + invite.period * 1000);
      }
      UserActions.scheduleShowInvite();
    }

    UserActions.closeForm();
  }

  openLogin() {
    ReactDOM.findDOMNode(this.refs.loginButton).blur();
    ga('button', 'head_site_tyumen_lk_enter');
    UserActions.showLogin();
  }

  openRegister() {
    ReactDOM.findDOMNode(this.refs.registerButton).blur();
    ga('button', 'head_site_tyumen_lk_signup');
    UserActions.showRegister();
  }

  render() {
    let showModal = true;
    let form;
    let widex = false;
    let lkPromoBg  = false;

    switch(this.props.showForm) {
    case UserTypes.FORM_LOGIN:
      form = <AuthPanelLoginForm {...this.props}/>;
      break;
    case UserTypes.FORM_REGISTER:
      form = <AuthPanelRegisterForm {...this.props}/>;
      break;
    case UserTypes.FORM_SURVEY:
      form = <AuthPanelSurveyForm {...this.props}/>;
      break;
    case UserTypes.FORM_RESTORE:
      form = <AuthPanelRestoreForm {...this.props}/>;
      break;
    case UserTypes.FORM_WRONG:
      form = <AuthPanelWrongForm {...this.props}/>;
      break;
    case UserTypes.FORM_INVITE:
      form = <AuthPanelInviteForm {...this.props}/>;
      widex = true;
      lkPromoBg = true;
      break;
    case UserTypes.FORM_HELP :
      form = <LKHelp {...this.props} />;
      break;
    default:
      showModal = false;
      form = null;
    }

    const classDialog = classNames({
      'login-form': true,
      'lk-promo-bg': lkPromoBg,
      widex: widex,
      in: true
    });

    return (
      <div className={classNames('user-menu-toggle', s.authpanelItem)}>
        <Button
          className={s.signin}
          ref='loginButton'
          bsStyle='link'
          onClick={this.openLogin.bind(this)}>
          Войти в личный кабинет
        </Button>
        <Button
          className={s.signup}
          ref='registerButton'
          bsStyle='link'
          onClick={this.openRegister.bind(this)}>
          Зарегистрироваться
        </Button>
        <Modal
          className={classDialog}
          show={showModal}
          onHide={this.close.bind(this)}>
            <ModalHeader closeButton></ModalHeader>
            <ModalBody>
                {form}
            </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default withStyles(s)(AuthPanelLogin);
