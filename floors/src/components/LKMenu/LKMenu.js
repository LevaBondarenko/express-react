/**
 * LK Menu component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, isArray, includes} from 'lodash';
import classNames from 'classnames';
import createFragment from 'react-addons-create-fragment';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';
import UserTypes from '../../constants/UserTypes';


class LKMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      page: window.location.hash ?
        window.location.hash.replace('#', '').split('#')[0] : null,
      menu: null,
      availModules: [],
      loginInvited: false
    };
    this.onChange = this.onChange.bind(this);
    this.onHashChange = this.onHashChange.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentWillMount() {
    window.addEventListener('hashchange', this.onHashChange);
    window.addEventListener('scroll', this.onScroll);
    this.onChange();
  }

  componentDidMount() {
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHashChange);
    window.removeEventListener('scroll', this.onScroll);
    userStore.offChange(this.onChange);
  }

  onScroll() {
    const el = ReactDOM.findDOMNode(this.refs.menubox);
    const offsetTop = this.offsetTop ? this.offsetTop : el.offsetTop + 60;
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    if(!this.offsetTop) {
      this.offsetTop = el.offsetTop + 60;
    }
    el.style.position = scrollTop > offsetTop ? 'fixed' : 'relative';
  }

  onHashChange() {
    const hash =  window.location.hash ?
      window.location.hash.replace('#', '') : null;

    this.setState(() => ({
      page: hash
    }));
  }

  onChange() {
    const isAuthorized = userStore.get('isAuthorized');
    const meta = userStore.get('userMeta');
    const pIntegrity = UserActions.getIntegrity();
    const availModules = meta.availModules ? meta.availModules.split(',') : [];
    const modules = userStore.get('modules'), message = [];
    let newModule = false;

    setTimeout(() => {
      const form = userStore.get('showForm');

      if(!isAuthorized && form === UserTypes.FORM_NONE) {
        this.needLogin(this.state.loginInvited);
      }
    }, 1000);

    for(const i in modules) {
      if(modules[i] && !includes(availModules, i) &&
        parseInt(modules[i].accessLevel) < pIntegrity) {
        availModules.push(i);
        newModule = true;
        message.push(modules[i].title);
      }
    }

    if(newModule) {
      const newAvailModules = availModules.join(',');

      meta.availModules = newAvailModules;
      setTimeout(() => WidgetsActions.set('notify',[{
        msg: `Вы получили доступ к новым модулям: ${message.join(', ')}`,
        type: 'info',
        time: 10
      }]), 0);
      UserActions.updateUser({
        availModules: newAvailModules
      });
    }

    this.setState(() => ({
      isAuthorized: isAuthorized,
      user: userStore.get('userInfo'),
      meta: meta,
      favorites: userStore.get('favorites'),
      searches: userStore.get('searches'),
      messages: userStore.get('messages'),
      myauctions: userStore.get('myauctions'),
      myobjects: userStore.get('myobjects'),
      lots: userStore.get('lots'),
      modules: modules,
      pIntegrity: pIntegrity,
      availModules: availModules,
      loginInvited: isAuthorized ? false : this.state.loginInvited
    }));
  }

  needLogin(redirect) {
    if(redirect) {
      window.location = this.props.redirectUrl;
    } else {
      UserActions.showLogin();
      this.setState(() => ({
        loginInvited: true
      }));
    }
  }

  getSubmenu(module) {
    let submenu;
    const model = this.state[module] ? this.state[module] : [];

    switch(module) {
    case 'favorites' :
      if(model && model.length) {
        const out = map(model, (item, key) => {
          return(
            <div key={key}>
              <span>{item.class}</span>
              <span>{item.id}</span>
            </div>
          );
        });

        submenu =
          (<div>
            {out.slice(0, 3)}
          </div>);
      }
      if(!submenu) {
        submenu = <div><span>Ничего нет</span></div>;
      }
      break;
    default:
      submenu = `submenu for: ${module}`;
    }
    return submenu;
  }

  toggleSubmenu(e) {
    const newmenu = this.state.menu === e.target.dataset.module ? null :
        e.target.dataset.module;

    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState(() => ({
      menu: newmenu
    }));
  }

  showHelp() {
    UserActions.showHelp();
  }

  render() {
    let userMenu;
    const {availModules, pIntegrity, user, page, modules} = this.state;
    const state = this.state;
    const moduleName = page ? /^\/(\w*)\//.exec(page) : null;
    const integrityTooltip =
      (<Tooltip id='profile_pIntegrity'>
        <p><strong>{`Ваш профиль заполнен на ${pIntegrity}%`}</strong></p>
        <p>{this.props.integrityComment}</p>
      </Tooltip>);
    const selectedModuleTitle = moduleName ?
      (modules[moduleName[1]] ? modules[moduleName[1]].title : null) :
      (modules.mainpage ? modules.mainpage.title : null);
    const text = this.props.text ?
      {__html: this.props.text} : {__html: '<br />'};

    userMenu = map(this.state.modules, (module, key) => {
      let count, link, action = null;
      const enabled = includes(availModules, key);

      if(key !== 'messages') {
        count = state[key] && isArray(state[key]) && state[key].length ?
          ` (${state[key].length})` : '';
      } else {
        count = 0;
        for(const i in state.messages) {
          if(state.messages[i] && !state.messages[i].readed &&
            state.messages[i].to_id === user.id) {
            count++;
          }
        }
        count = ` (${count})`;
      }
      if(key === 'mainpage') {
        link = '/my/#/';
      } else if(key === 'analytics') {
        link = '/my/analytics/';
      } else if(key === 'help') {
        link = null;
        action = this.showHelp.bind(this);
      } else {
        link = `/my/#/${key}/`;
      }

      return   (
        <div
          key={key}
          className='lkmenu-usermenu-item'>
          <Button
            type='button'
            bsStyle='default'
            data-link={key}
            disabled={!enabled}
            className={
              classNames(
                {'active':
                  (!moduleName && key === 'mainpage') ||
                  (moduleName && moduleName[1] === key)},
                {disabled: !enabled}
              )
            }
            href={link}
            onClick={action}>
              <i className={classNames('fa', module.glyph)}/>
              <span>
                {key === 'help' ?
                  ` ${module.title} по:` : ` ${module.title}${count}`}
              </span>
              {key === 'help' ? (
                <span className='lkmenu-usermenu-item-helptitle'>
                  {selectedModuleTitle ? `разделу ${selectedModuleTitle}` : ''}
                </span>
              ) : null}
          </Button>
        </div>
      );
    });

    userMenu = createFragment({userMenu: userMenu});

    const profilePercent = this.props.profile === '1' ? (
      <div className='lkmenu-integrity'>
        <div className='lkmenu-integrity-title'>
          <span>Ваш профиль:</span>
          <span><a href='#/profile/'><i className='fa fa-pencil'/></a></span>
        </div>
        <OverlayTrigger placement='right' overlay={integrityTooltip}>
          <div className='lkmenu-integrity-value'>
            <ProgressBar
                now={pIntegrity}
                label="%(percent)s%" />
            <span>Заполнен на: </span>
            <span className='lkmenu-integrity-value-percent'>
              {`${pIntegrity}%`}
            </span>
          </div>
        </OverlayTrigger>
      </div>
    ) : null;

    return (
      <div className='lkmenu' ref='menubox'>
        <div className='lkmenu-usermenu'>
          {userMenu}
        </div>
        {profilePercent}
        <div className="lkmenu-html" dangerouslySetInnerHTML={text} />
      </div>
    );
  }
}

LKMenu.propTypes = {
  redirectUrl: React.PropTypes.string,
  integrityComment: React.PropTypes.string,
  profile: React.PropTypes.string,
  text: React.PropTypes.string
};
LKMenu.defaultProps = {
  redirectUrl: '/'
};

export default LKMenu;
