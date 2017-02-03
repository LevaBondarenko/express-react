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
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {includes} from 'lodash';
import {testPassword} from '../../utils/Helpers';
import {getFromBack} from '../../utils/requestHelpers';
const Basil = canUseDOM ? require('basil.js') : {};

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import FormGroup from 'react-bootstrap/lib/FormGroup';

/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';

class ChangePassword extends Component {
  static propTypes = {
    mode: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      hash: null,
      stage: 0,
      password: {
        value: '',
        style: null,
        help: ''
      },
      password2: {
        value: '',
        style: null,
        help: ''
      }
    };
  }

  componentDidMount() {
    const data = {
      action: 'user_confirmbycode',
      to: 'email'
    };
    const locHash = window.location.hash.replace('#', '');
    const locHashParts = locHash.split('/');
    let mode = this.props.mode, hash = null, email = null;

    if(mode === 'auto') {
      if(includes(['changepassword', 'confirmemail'], locHashParts[0])) {
        mode = locHashParts[0];
        hash = locHashParts[1];
        email = atob(locHashParts[2]);
      } else {
        this.setState(() => ({stage: 99, mode: mode}));
      }
    } else {
      hash = locHashParts[0];
      email = atob(locHashParts[1]);
    }

    if(mode === 'changepassword') {
      data.auth_hash = 1; //eslint-disable-line camelcase
    }
    data.email = email;
    data.code = hash;

    if(email && hash) {
      getFromBack(data).then(response => {
        if(response.ok) {
          if(mode === 'changepassword') {
            this.setState(() => ({stage: 1, hash: response.data, mode: mode}));
          } else {
            this.setState(() => ({stage: 2, mode: mode}));
            UserActions.clearLocalCachedData();
          }
        } else {
          this.setState(() => ({stage: 99, mode: mode}));
          WidgetsActions.set('notify',[{
            msg: 'Ссылка не действительна или устарела!',
            type: 'warn'
          }]);
        }
      });
    }
  }

  changePassword(e) {
    const state = this.state;
    const {password, password2, hash} = state;

    if(password.value.length < 6) {
      password.style = 'error';
      password.help = 'короткий пароль, должно быть не менее 6 символов';
    } else if(!testPassword(password.value)) {
      password.style = 'warning';
      password.help = 'простой пароль, используйте буквы и цифры';
    } else if(password.value !== password2.value) {
      password2.style = 'error';
      password2.help = 'пароли не совпадают';
    } else {
      const basil = new Basil({namespace: 'etagi_com'});
      const cookieDomain = window.location.host.replace(/^[^.]*/, '');

      basil.set('auth_hash', hash, {
        domain: cookieDomain,
        namespace: '',
        storages: ['cookie'],
        expireDays: 1
      });
      UserActions.updateUser({password: password.value});
      window.location = '/';
    }

    e.preventDefault();
  }

  handleChange(e) {
    const {password} = this.state;
    let style, help;

    if(e.target.value.length === 0) {
      style = null;
      help = '';
    } else {
      switch(e.target.dataset.name) {
      case 'password':
        if(e.target.value.length < 6) {
          style = 'error';
          help = 'короткий пароль, должно быть не менее 6 символов';
        } else if(!testPassword(e.target.value)) {
          style = 'warning';
          help = 'простой пароль, используйте буквы и цифры';
        } else {
          style = 'success';
          help = '';
        }
        break;
      case 'password2':
        if(e.target.value === password.value) {
          style = 'success';
          help = '';
        } else {
          style = 'error';
          help = 'пароли не совпадают';
        }
        break;
      default:
        //do nothing
      }
    }
    this.setState({
      [e.target.dataset.name]: {
        value: e.target.value,
        style: style,
        help: help
      }
    });
  }

  get body() {
    const {password, password2, stage} = this.state;
    let body = null;

    switch(stage) {
    case 0 :
      body = (
        <div className='lkform'>
          <Row>
            <Col xs={12} className='text-center lkform-description'>
              <i className='fa fa-spinner fa-pulse fa-5x'/>
            </Col>
          </Row>
        </div>
      );
      break;
    case 1 :
      body = (
        <form
          className="lkform form-horizontal"
          autoComplete='off'
          onSubmit={this.changePassword.bind(this)}>
          <Row>
            <Col xs={12} className='text-center lkform-description'>
              Задайте новый пароль. Для надежности используйте не менее 6
              символов, заглавные и строчные буквы, цифры.
            </Col>
          </Row>
          <Row>
            <FormGroup className='col-xs-offset-4 col-xs-4'
                        validationState={password.style}>
            <FormControl
              type='password'
              placeholder="Новый пароль"
              ref='password'
              id="password"
              data-name='password'
              onChange={this.handleChange.bind(this)}
              value={password.value}/>
            <Feedback/>
            <HelpBlock>{password.help}</HelpBlock>
          </FormGroup>
          <FormGroup className='col-xs-offset-4 col-xs-4'
                      validationState={password2.style}>
            <FormControl
              type='password'
              placeholder="Повторите пароль"
              ref='password2'
              id="password"
              data-name='password2'
              onChange={this.handleChange.bind(this)}
              value={password2.value}/>
              <HelpBlock>{password.help}</HelpBlock>
              <Feedback/>
            </FormGroup>
          </Row>
          <Row>
            <Col xsOffset={4} xs={4} className='text-center'>
              <Button type='Submit' bsStyle='primary'>
                Изменить пароль
              </Button>
            </Col>
          </Row>
        </form>
      );
      break;
    case 2 :
      body = (
        <div className='lkform'>
          <Row>
            <Col xs={12} className='text-center lkform-description'>
              Спасибо! Ваш адрес электронной почты подтвержден!
            </Col>
          </Row>
          <Row>
            <Col xsOffset={4} xs={4} className='text-center'>
              <Button
                href='\my\'
                bsStyle='primary'>
                Перейти в Личный кабинет
              </Button>
            </Col>
          </Row>
        </div>
      );
      break;
    default :
      body = (
        <div className='lkform'>
          <Row>
            <Col xs={12} className='text-center lkform-description'>
              Ошибка: Ссылка не действительна или устарела!
            </Col>
          </Row>
        </div>
      );
    }
    return body;
  }

  render() {
    const {mode} = this.state;

    return (
      <div className='lkbody'>
        <h1 className='text-center'>
          {mode === 'changepassword' ?
            'Восстановление пароля' : 'Подтверждение email'
          }
        </h1>
        {this.body}
      </div>
    );
  }
}

export default ChangePassword;
