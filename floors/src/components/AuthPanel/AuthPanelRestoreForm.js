/**
 * Authorization Panel Password Restore Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {testPhone, testEmail, testPassword} from '../../utils/Helpers';
import {getFromBack} from '../../utils/requestHelpers';
import ga from '../../utils/ga';
const Basil = canUseDOM ? require('basil.js') : {};

/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import {FormControl, HelpBlock, FormGroup} from 'react-bootstrap/lib/';

class AuthPanelRestoreForm extends Component {
  static propTypes = {
    changePasswordPath: React.PropTypes.string,
    changePasswordTemplate: React.PropTypes.string,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      phone: {
        value: props.user.phone || props.user.email || '',
        style: null,
        help: ''
      },
      code: {
        value: '',
        style: null,
        help: ''
      },
      password: {
        value: '',
        style: null,
        help: ''
      },
      password2: {
        value: '',
        style: null,
        help: ''
      },
      stage: 0,
      haveCode: false,
      alreadySended: false,
      isLoading: false,
      alreadyUsed: props.user.phone || props.user.email || false
    };
  }

  restore(e) {
    const state = this.state;
    const {phone, code, password, password2, stage} = state;
    const cleanedPhone = phone.value.replace(/[^0-9+]*/g, '');

    ga('link', 'lk_enter_password_recovery_send');
    switch(stage) {
    case 0 :
      if(testPhone(cleanedPhone, true)) {
        this.setState(() => ({isLoading: true}));
        getFromBack({
          action: 'user_sendcode',
          to: 'phone',
          phone: cleanedPhone.replace('+7', '8')
        }).then(response => {
          const alreadySended = response.result &&
              response.result.indexOf('менее 10 минут') !== -1;

          if(response.ok || alreadySended) {
            this.setState(() => ({
              stage: 1,
              alreadySended: alreadySended,
              isLoading: false
            }));
          } else {
            WidgetsActions.set('notify',[{
              msg: `Ошибка отправки кода подтверждения: ${response.result}`,
              type: 'warn'
            }]);
            this.setState(() => ({isLoading: false}));
          }
        }, error => {
          WidgetsActions.set('notify',[{
            msg: `Ошибка отправки кода подтверждения: ${error.code}`,
            type: 'warn'
          }]);
          this.setState(() => ({isLoading: false}));
        });
      } else if(testEmail(phone.value)) {
        const {protocol, host} = window.location;
        const {changePasswordTemplate, changePasswordPath} = this.props;

        this.setState(() => ({isLoading: true}));
        getFromBack({
          action: 'user_sendcode',
          to: 'email',
          email: phone.value,
          template: changePasswordTemplate,
          baseurl: `${protocol}//${host}${changePasswordPath}#`
        }).then(response => {
          if(response && response.ok) {
            this.setState(() => ({
              stage: 2,
              isLoading: false
            }));
          } else {
            WidgetsActions.set('notify',[{
              msg: `Ошибка отправки кода подтверждения: ${response.result}`,
              type: 'warn'
            }]);
            this.setState(() => ({isLoading: false}));
          }
        });
      } else {
        phone.style = 'error';
        phone.help = 'Телефон или EMail введены некорректно';
      }
      break;
    case 1 :
      if(code.value.length !== 6) {
        code.style = 'error';
        code.help = 'Введите код полученный в смс';
      } else {
        this.setState(() => ({isLoading: true}));
        getFromBack({
          action: 'user_confirmbycode',
          to: 'phone',
          phone: cleanedPhone.replace('+7', '8'),
          code: code.value,
          auth_hash: 1 //eslint-disable-line camelcase
        }).then(response => {
          if(response.ok) {
            this.setState(() => ({
              stage: 3,
              hash: response.data,
              isLoading: false
            }));
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Неверный код или номер телефона не найден в БД!',
              type: 'warn'
            }]);
            this.setState(() => ({isLoading: false}));
          }
        });
      }
      break;
    case 2 :
      UserActions.closeForm();
      break;
    case 3 :
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

        basil.set('auth_hash', this.state.hash, {
          domain: cookieDomain,
          namespace: '',
          storages: ['cookie'],
          expireDays: 1
        });
        UserActions.updateUser({password: password.value});
      }
      break;
    default :
      //do nothing
    }

    e.preventDefault();
  }

  haveCode() {
    this.setState(() => ({
      stage: 1,
      haveCode: true
    }));
  }

  login(e) {
    UserActions.showLogin();
    e.preventDefault();
  }

  register(e) {
    UserActions.showRegister();
    ga('button', 'lk_enter_registration');
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
      case 'phone' :
        const cleanedPhone = e.target.value.replace(/[^0-9+]*/g, '');

        if(testPhone(cleanedPhone, true) || testEmail(e.target.value)) {
          style = 'success';
          help = '';
        }
        break;
      case 'code' :
        if(e.target.value.length === 6) {
          style = 'success';
          help = '';
        } else {
          style = 'error';
          help = 'Введите код, полученный в смс';
        }
        break;
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

  get description() {
    const {stage, alreadySended, alreadyUsed, haveCode} = this.state;
    let res = null;

    switch(stage) {
    case 0 :
      res = alreadyUsed ? (testPhone(alreadyUsed, true) ? (
          <Col xs={12}>
            Пользователь с указанным номером телефона уже существует.
            Подтвердите, что это ваш номер телефона, чтобы  восстановить
            пароль. Мы отправим SMS c кодом подтверждения на указанный
            номер телефона.
          </Col>
        ) : (
          <Col xs={12}>
            Пользователь с указанным Email уже существует.
            Подтвердите, что это ваш Email, чтобы  восстановить
            пароль. Мы отправим письмо со ссылкой для подтверждения на
            указанный Email.
          </Col>
        )
      ) : (
        <Col xs={12}>
          Введите номер телефона или email, указанные<br/>
          при регистрации, и нажмите "Продолжить":
        </Col>
      );
      break;
    case 1 :
      const toContinue = alreadyUsed ?
        'подтверждение телефона' : 'восстановление пароля';

      res = alreadySended ? (
        <Col xs={12}>
          Код подтверждения уже отправлен на указанный<br/>
          номер телефона менее 10 минут назад. Введите<br/>
          код, чтобы продолжить {toContinue}:
        </Col>
      ) : (haveCode ? (
          <Col xs={12}>
            Введите ранее полученный в SMS код, чтобы продолжить {toContinue}:
          </Col>
        ) : (
          <Col xs={12}>
            Мы отправили SMS c кодом подтверждения на<br/>
            указанный номер телефона. Введите код, чтобы<br/>
            продолжить {toContinue}:
          </Col>
        )
      );
      break;
    case 2 :
      res = (
        <Col xs={12}>
          Мы отправили на указанный email письмо со<br/>
          ссылкой для восстановления пароля. Проверьте<br/>
          электронную почту и перейдите по ссылке в письме.
        </Col>
      );
      break;
    case 3 :
      res = (
        <Col xs={12}>
          Введите Ваш новый пароль:
        </Col>
      );
      break;
    default :
      //do nothing
    }
    return res;
  }

  get inputs() {
    const {phone, code, stage, password, password2} = this.state;
    const cleanedPhone = phone.value.replace(/[^0-9+]*/g, '');
    const existCode = testPhone(cleanedPhone, true);
    let res = null;

    switch(stage) {
    case 0 :
      res = (
        <Row>
          <FormGroup className='col-xs-12'
                    validationState={phone.style}>
          <FormControl
            type='text'
            placeholder="Телефон или Ваш почтовый ящик"
            ref='phone'
            help={phone.help}
            id="login"
            data-name='phone'
            required='on'
            onChange={this.handleChange.bind(this)}
            value={phone.value}/>
          <HelpBlock>{phone.help}</HelpBlock>
          {existCode ? (
            <Col xs={6}>
              <a
                href="#auth-have-code"
                onClick={this.haveCode.bind(this)}
                style={{
                  position: 'absolute',
                  width: '100%',
                  left: '0'
                }}>
                У меня уже есть код
              </a>
            </Col>
          ) : null}
        </FormGroup>
        </Row>
      );
      break;
    case 1 :
      res = (
        <Row>
          <FormGroup className='col-xs-12'
                validationState={code.style}>
            <FormControl
              type='password'
              placeholder="Код подтверждения"
              ref='code'
              id="password"
              data-name='code'
              onChange={this.handleChange.bind(this)}
              value={code.value}/>
            <FormControl.Feedback/>
            <HelpBlock>{code.help}</HelpBlock>
        </FormGroup>
        </Row>
      );
      break;
    case 2 :
      res = <Row/>;
      break;
    case 3 :
      res = (
        <Row>
          <FormGroup className='col-xs-12'
                  validationState={password.style}>
          <FormControl
            type='password'
            placeholder="Новый пароль"
            ref='password'
            id="password"
            data-name='password'
            onChange={this.handleChange.bind(this)}
            value={password.value}/>
          <FormControl.Feedback/>
          <HelpBlock>{password.help}</HelpBlock>
        </FormGroup>
        <FormGroup className='col-xs-12'
          validationState={password2.style}>
          <FormControl
            type='password'
            placeholder="Повторите пароль"
            ref='password2'
            id="password"
            data-name='password2'
            onChange={this.handleChange.bind(this)}
            value={password2.value}/>
          <FormControl.Feedback/>
            <HelpBlock>{password2.help}</HelpBlock>
        </FormGroup>
        </Row>
      );
      break;
    default :
      //do nothing
    }
    return res;
  }

  get buttonText() {
    const {stage, isLoading} = this.state;
    let res = null;

    switch(stage) {
    case 0 :
      res = 'Продолжить';
      break;
    case 1 :
      res = 'Ввести код';
      break;
    case 2 :
      res = 'Готово';
      break;
    case 3 :
      res = 'Изменить пароль';
      break;
    default :
      //do nothing
    }
    if(isLoading) {
      res = <i className='fa fa-spinner fa-spin'/>;
    }
    return res;
  }

  get links() {
    const {stage} = this.state;
    let res = null;

    switch(stage) {
    case 0 :
      res = (
        <Row style={{marginTop: '12px'}}>
          <Col xs={6} style={{padding: '0 4px 0 4px'}}>
            <a href="#auth-login" onClick={this.login.bind(this)}>
              Уже зарегистрирован
            </a>
          </Col>
          <Col xs={6} style={{padding: '0 4px 0 4px'}}>
            <a href="#auth-restore" onClick={this.register.bind(this)}>
              Зарегистрируйтесь
            </a>
          </Col>
        </Row>
      );
      break;
    default :
      //do nothing
    }
    return res;
  }

  render() {
    const {alreadyUsed, isLoading} = this.state;
    const title = alreadyUsed ? (testPhone(alreadyUsed, true) ?
        'Подтверждение телефона' : 'Подтверждение Email'
      ) : 'Восстановление пароля';

    return (
      <form
        className="auth-form form-horizontal"
        autoComplete='off'
        onSubmit={this.restore.bind(this)}>
        <Row>
          <Col xs={12}><h2>
            {title}
          </h2></Col>
        </Row>
        <Row>{this.description}</Row>
        <Row><Col xs={12}>&nbsp;</Col></Row>
        {this.inputs}
        <Row style={{marginTop: '12px'}}>
          <Col xs={12}>
            <Button
              type='submit'
              bsStyle='primary'
              disabled={isLoading}>
              {this.buttonText}
            </Button>
          </Col>
        </Row>
        {this.links}
      </form>
    );
  }
}

export default AuthPanelRestoreForm;
