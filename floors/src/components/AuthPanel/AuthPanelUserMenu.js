/**
 * Authorization Panel Logged On User Menu component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {simulateClick} from '../../core/DOMUtils';
import {map} from 'lodash';
import classNames from 'classnames';
import AuthPanelSurveyForm from '../AuthPanel/AuthPanelSurveyForm';
import LKBid from '../LKBody/LKAuctions/LKBid';
import LKHelp from '../LKBody/LKHelp';
import createFragment from 'react-addons-create-fragment';
/**
 * React/Flux entities
 */
import UserTypes from '../../constants/UserTypes';
import UserActions from '../../actions/UserActions';
/**
 * Bootstrap 3 elements
 */
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Badge from 'react-bootstrap/lib/Badge';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

/* global data */

class AuthPanelUserMenu extends Component {
  static propTypes = {
    profilePath: PropTypes.string,
    user: PropTypes.object,
    survey: PropTypes.object,
    showForm: PropTypes.string,
    modules: PropTypes.object,
    bidOnObject: PropTypes.object,
    messages: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  close() {
    UserActions.closeForm();
  }

  logout() {
    UserActions.logout();
  }

  goto(e) {
    const loc = window.location;
    const path = this.props.profilePath;
    const hash = e.target.dataset.link ?
      e.target.dataset.link : e.target.parentElement.dataset.link;

    if(loc.pathname !== path) {
      window.location.href = hash === 'mainpage' ? `${loc.origin}${path}#/` :
        `${loc.origin}${path}#/${hash}/`;
    } else {
      window.location.hash = hash === 'mainpage' ? '#/' : `#/${hash}/`;
    }
    simulateClick();
  }

  render() {
    const {messages, user, showForm} = this.props;
    let messagesCount = 0;
    const username = user.i + (user.f && ` ${user.f}`);
    const avaFromPics = (/pics2.etagi.com\/lk\//).test(user.photo) ||
      (/cdn-media.etagi.com\/content\/media\/lk\//).test(user.photo);
    const photoUrl = avaFromPics ? user.photo : getApiMediaUrl(
        avaFromPics ? 'lk' : '160160',
        avaFromPics ? '' : 'profile',
        user.photo && user.photo.length ? user.photo : 'no_photo',
        data.options.mediaSource);

    for(const i in messages) {
      if(messages[i] && !messages[i].readed && messages[i].to_id === user.id) {
        messagesCount++;
      }
    }
    const title = (
      <div className='avatar'>
        <img
          src={photoUrl}
          alt={username}
          height='40px'
          width='40px'
          className='img-circle'/>
        {messagesCount ? <Badge>{messagesCount}</Badge> : null}
        <div className='nowrap username'>
          <span className='username-welcome'>Добро пожаловать,</span><br/>
          <span className='username-name'>{username}</span>
        </div>
      </div>
    );
    let form, showModal = true;

    switch(showForm) {
    case UserTypes.FORM_SURVEY:
      form = (<AuthPanelSurveyForm
               title={this.props.survey.title}
               question={this.props.survey.question}
               field={this.props.survey.field}/>);
      break;
    case UserTypes.FORM_BID :
      form = <LKBid {...this.props} />;
      break;
    case UserTypes.FORM_HELP :
      form = <LKHelp {...this.props} />;
      break;
    default:
      showModal = false;
      form = null;
    }

    const mainMenu = createFragment({mainMenu:
      map(this.props.modules, (module, key) => {
        return key === 'help' ? <div key={key}/> : (
          <div className='usermenu-item'>
            <Button
              type='button'
              bsStyle='default'
              data-link={key}
              onClick={this.goto.bind(this)}>
                {` ${module.title}`}
                {key === 'messages' && messagesCount ?
                   <Badge>{messagesCount}</Badge> : null}
            </Button>
          </div>
        );
      })
    });

    return (
      <div className='authpanel-item user-menu-toggle'>
        <DropdownButton
          id='DropdownButton-authPanel-btn'
          ref='dropdownbutton'
          bsStyle='link'
          noCaret
          eventKey={1}
          title={title}
        >
          <div className='usermenu'>
            {mainMenu}
            <div className='usermenu-item'>
              <Button
                type='button'
                bsStyle='default'
                onClick={this.logout.bind(this)}>
                Выйти
              </Button>
            </div>
          </div>
        </DropdownButton>
        <Modal
          className={classNames(
              'lkform',
              {'wide': showForm !== UserTypes.FORM_HELP},
              {'widexxx': showForm === UserTypes.FORM_HELP}
          )}
          show={showModal}
          onHide={this.close.bind(this)}>
          <ModalHeader closeButton></ModalHeader>
          <ModalBody>
            {form}
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default AuthPanelUserMenu;
