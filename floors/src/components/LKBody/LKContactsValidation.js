/**
 * LK SurveyBlock component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {getFromBack} from '../../utils/requestHelpers';
import {phoneFormatter, testPhone, testEmail} from '../../utils/Helpers';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';

/*global data*/

class LKContactsValidation extends Component {
  static propTypes = {
    user: React.PropTypes.object,
    isAuthorized: React.PropTypes.bool,
    confirmEmailPath: React.PropTypes.string,
    confirmEmailTemplate: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    const {user} = props;
    const phoneConfirmed =
      parseInt(user.phone) === parseInt(user.phoneConfirmCode);
    const emailConfirmed = user.email === user.emailConfirmToken;

    this.state = {
      phone: props.user.phone ? props.user.phone.replace('8', '+7') : '',
      email: props.user.email,
      phoneConfirmed: phoneConfirmed,
      emailConfirmed: emailConfirmed,
      phoneChanged: false,
      emailChanged: false,
      phoneCode: '',
      show: false,
      showEmailSended: false,
      showSurvey: true
    };
  }

  componentWillReceiveProps(nextProps) {
    const {user} = nextProps;
    const phoneConfirmed =
      parseInt(user.phone) === parseInt(user.phoneConfirmCode);
    const emailConfirmed = user.email === user.emailConfirmToken;

    this.setState(() => ({
      phone: nextProps.user.phone ?
        nextProps.user.phone.replace('8', '+7') : '',
      email: nextProps.user.email,
      phoneConfirmed: phoneConfirmed,
      emailConfirmed: emailConfirmed,
      phoneChanged: false,
      emailChanged: false
    }));
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  sendPhone() {
    const {phoneChanged, phone} = this.state;

    if(phoneChanged) {
      const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

      if(testPhone(cleanedPhone, true)) {
        UserActions.updateUser({phone: cleanedPhone});
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Телефон введен не верно!',
          type: 'warn'
        }]);
      }
    } else {
      this.toggle();
    }
  }

  sendEmail() {
    const {emailChanged, email} = this.state;

    if(emailChanged) {
      if(testEmail(email, true)) {
        UserActions.updateUser({email: email});
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Email введен не верно!',
          type: 'warn'
        }]);
      }
    } else {
      this.sendEmailCode();
    }
  }

  sendEmailCode() {
    if(!this.state.emailConfirmed && !this.state.showEmailSended) {
      const {email} = this.state;
      const {protocol, host} = window.location;
      const {confirmEmailPath, confirmEmailTemplate} = this.props;

      if(this.state.show) {
        document.removeEventListener('click', this.close);
      }
      this.setState(() => ({
        show: false
      }));
      getFromBack({
        action: 'user_sendcode',
        to: 'email',
        email: email,
        template: confirmEmailTemplate,
        baseurl: `${protocol}//${host}${confirmEmailPath}#`
      }).then(response => {
        if(response && response.ok) {
          document.addEventListener('click', this.close);
          this.setState(() => ({
            show: false,
            showEmailSended:
              !this.state.emailConfirmed && !this.state.showEmailSended
          }));
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки кода подтверждения!',
            type: 'warn'
          }]);
        }
      });

    }
  }

  toggle() {
    if(!this.state.phoneConfirmed && !this.state.show) {
      if(this.state.showEmailSended) {
        document.removeEventListener('click', this.close);
      }
      document.addEventListener('click', this.close);
      this.setState(() => ({
        show: !this.state.phoneConfirmed && !this.state.show,
        showEmailSended: false
      }));
    }
  }

  dismiss() {
    document.removeEventListener('click', this.close);
    this.setState(() => ({
      show: false,
      showEmailSended: false
    }));
  }

  close(e) {
    let ancestor = e.target;

    while(!ancestor.classList.contains('lk-popup') &&
      (ancestor = ancestor.parentElement)) {};
    if(!ancestor) {
      this.setState(() => ({show: false, showEmailSended: false}));
      document.removeEventListener('click', this.close);
    }
  }

  getCode() {
    const {phone} = this.state;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

    getFromBack({
      action: 'user_sendcode',
      to: 'phone',
      phone: cleanedPhone
    }).then(response => {
      if(response && response.ok) {
        WidgetsActions.set('notify',[{
          msg: 'Код подтверждения отправлен на Ваш телефон',
          type: 'info'
        }]);
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки кода подтверждения!',
          type: 'warn'
        }]);
      }
    });
  }

  setCode() {
    const {phoneCode, phone} = this.state;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

    if(phoneCode.length) {
      this.dismiss();
      this.setState(() => ({phoneCode: ''}));
      getFromBack({
        action: 'user_confirmbycode',
        to: 'phone',
        phone: cleanedPhone,
        code: phoneCode
      }).then(response => {
        if(response.ok) {
          UserActions.set(null, response.data);
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Неверный код!',
            type: 'warn'
          }]);
        }
      });
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Необходимо ввести код подтверждения!',
        type: 'warn'
      }]);
    }
  }

  surveyClose() {
    this.setState(() => ({showSurvey: false}));
  }

  handleChange(e) {
    const {user} = this.props;
    const {field} = e.target.dataset;
    const value = e.target.value;
    const changed = field === 'phone' ?
      (value.replace(/[^0-9+]*/g, '').replace('+7', '8') !== user.phone) :
      value !== user[field];

    this.setState(() => ({
      [field]: value,
      [`${field}Changed`]: changed
    }));
  }

  render() {
    const {isAuthorized} = this.props;
    const {
      phone, email, phoneConfirmed, emailConfirmed, phoneChanged, emailChanged,
      phoneCode, show, showSurvey, showEmailSended} = this.state;
    const phoneFormatted = phone && phone.length ? phoneFormatter(
      phone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    ) : '';

    return showSurvey && isAuthorized ? (
      <div className='lkbody-contacts'>
        <span className='lkbody-contacts-next'
          onClick={this.surveyClose.bind(this)}>
          пока пропустить
        </span>
        <Row>
          <Col xs={5}>
            <div className='lkbody-contacts-title'>
              Защитите свой аккаунт
            </div>
            <div className='lkbody-contacts-description'>
              Эти данные нужны для защиты Вашего аккаунта, если мы заметим
              подозрительную активность в Вашем аккаунте.
            </div>
          </Col>
          <Col xs={7}>
            <form>
              <div className='lkbody-contacts-param-group'>
                <div className='form-group clearfix'>
                  <label className='control-label col-xs-12'>
                    Электронная почта
                  </label>
                  <Col xs={8}>
                    <input
                      type='text'
                      value={email}
                      data-field='email'
                      className='form-control'
                      onChange={this.handleChange.bind(this)}/>
                  </Col>
                  <Col xs={4}>
                    <div className={classNames(
                      'lkbody-contacts-validate-link',
                      {'confirmed': emailConfirmed && !emailChanged}
                    )} onClick={this.sendEmail.bind(this)}>
                      {emailChanged ? 'Сохранить' : (emailConfirmed ?
                        <span><i className='fa fa-check'/>Подтверждено</span> :
                        'Подтвердить')
                      }
                      {showEmailSended ?
                        <div className='lk-popup'>
                          <div className='lk-popup-header'>
                            Подтверждение email
                          </div>
                          <div className='lk-popup-comment'>
                            На Ваш email отправлено письмо<br/>
                            с инструкциями по дальнейшим действиям
                          </div>
                          <Row><Col xs={12}>&nbsp;</Col></Row>
                          <div className='lk-popup-controls'>
                            <Button
                              bsStyle='primary'
                              bsSize='small'
                              onClick={this.dismiss.bind(this)}>
                              Закрыть
                            </Button>
                          </div>
                        </div> : null
                      }
                    </div>
                  </Col>
                </div>
                <div className='form-group clearfix'>
                  <label className='control-label col-xs-12'>
                    Телефон
                  </label>
                  <Col xs={8}>
                    <input
                      type='text'
                      placeholder='Введите ваш номер телефона'
                      value={phoneFormatted}
                      data-field='phone'
                      className='form-control'
                      onChange={this.handleChange.bind(this)}/>
                  </Col>
                  <Col xs={4}>
                    <div className={classNames(
                      'lkbody-contacts-validate-link',
                      {'confirmed': phoneConfirmed && !phoneChanged}
                    )} onClick={this.sendPhone.bind(this)}>
                      {phoneChanged ? 'Сохранить' : (phoneConfirmed ?
                        <span><i className='fa fa-check'/>Подтверждено</span> :
                        'Подтвердить')
                      }
                      {show ?
                        <div className='lk-popup'>
                          <div className='lk-popup-header'>
                            Подтверждение номера телефона
                          </div>
                          <div className='lk-popup-comment'>
                            Нажмите "Получить код", затем введите,<br/>
                            полученный в смс, код в поле ввода и<br/>
                            нажмите "Ввести код"
                          </div>
                          <Row>
                            <Col xs={12}>
                              <input
                                type='text'
                                value={phoneCode}
                                data-field='phoneCode'
                                className='form-control'
                                onChange={this.handleChange.bind(this)}/>
                            </Col>
                          </Row>
                          <div className='lk-popup-controls'>
                            <Button
                              bsStyle='default'
                              bsSize='small'
                              onClick={this.getCode.bind(this)}>
                              Получить код
                            </Button>
                            <Button
                              bsStyle='primary'
                              bsSize='small'
                              onClick={this.setCode.bind(this)}>
                              Ввести код
                            </Button>
                          </div>
                        </div> : null
                      }
                    </div>
                  </Col>
                </div>
              </div>
            </form>
          </Col>
        </Row>
      </div>
    ) : null;
  }
}

export default LKContactsValidation;

