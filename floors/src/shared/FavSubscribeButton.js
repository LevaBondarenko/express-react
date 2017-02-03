/**
 * Shared FavSubscribeButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {testEmail} from '../utils/Helpers';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Row from 'react-bootstrap/lib/Row';
/**
 * React/Flux entities
 */

import userStore from '../stores/UserStore';
import UserActions from '../actions/UserActions';
import WidgetsActions from '../actions/WidgetsActions';

class FavSubscribeButton extends Component {
  static propTypes = {
    object: React.PropTypes.object,
    style: React.PropTypes.object,
    className: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = {
      object: props.object,
      show: false,
      email: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      object: nextProps.object
    }));
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  save() {
    const {object, show} = this.state;
    const user = userStore.get('userInfo');
    const subscribe = parseInt(object.subscribe);

    if(show) {
      this.setState(() => ({show: false}));
      document.removeEventListener('click', this.close);
    } else if(subscribe || (user.email && user.email.length)) {
      WidgetsActions.set('notify',[{
        msg: subscribe ?
          `Вы отписались от рассылки по изменениям объекта ${object.id}` :
          `Вы подписались на рассылку по изменениям объекта ${object.id}`,
        type: 'info'
      }]);
      object.subscribe = subscribe ? 0 : 1;
      UserActions.updateFavorites(
        'add',
        object.id,
        object.class,
        object
      );
    } else {
      this.setState(() => ({show: true}));
      document.addEventListener('click', this.close);
    }
  }

  saveEmail() {
    if(this.validation() !== 'success') {
      WidgetsActions.set('notify',[{
        msg: 'Email введен не корректно',
        type: 'info'
      }]);
    } else {
      UserActions.updateUser({email: this.state.email});
      this.closeClick();
    }
  }

  validation(help = 0) {
    const results = {
      success: ['success', ''],
      warning: ['warning', 'Адрес электронной почты введен не корректно'],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    const {email} = this.state;
    const length = email ? email.length : 0;
    let result;

    if(length < 2) {
      result = results.error[help];
    } else if(!testEmail(email)) {
      result = results.warning[help];
    } else {
      result = results.success[help];
    }

    return result;
  }

  handleChange(e) {
    const value = e.target.value;

    this.setState(() => ({email: value}));
  }

  close(e) {
    let ancestor = e.target;

    while((ancestor = ancestor.parentElement) &&
          !ancestor.classList.contains('lk-popup')) {};
    if(!ancestor) {
      this.setState(() => ({show: false}));
      document.removeEventListener('click', this.close);
    }
  }

  closeClick() {
    this.setState(() => ({show: false}));
    document.removeEventListener('click', this.close);
  }

  render() {
    const {style} = this.props;
    const {show, object} = this.state;
    const title = 'Подписаться на получение изменений по объекту на Email';
    const modeClass = classNames(
      'btn-fav',
      {'on': parseInt(object.subscribe) === 1},
      this.props.className
    );

    return (
      <div className={modeClass} style={style}>
        <Button
          title={title}
          bsStyle='default'
          bsSize='large'
          onClick={this.save.bind(this)}>
            <i className='fa fa-envelope-o' />
        </Button>
        {show ?
          <div className='lk-popup'>
            <div className='lk-popup-header'>
              Ваш EMAIL @
            </div>
            <div className='lk-popup-comment' />
            <Row>
              <div className='objects--item__nomap--comment no-back'>
                <div>
                  <FormControl type='text'
                    hasFeedback
                    value={this.state.email}
                    placeholder='Электронная почта'
                    help={this.validation(1)}
                    bsStyle={this.validation()}
                    bsSize='small'
                    onChange={this.handleChange.bind(this)} />
                </div>
                <div className='objects--item__nomap--comment-controls'>
                  <Button
                    bsStyle='link'
                    bsSize='small'
                    onClick={this.closeClick.bind(this)}>
                    Отмена
                  </Button>
                  <Button
                    bsStyle='primary'
                    bsSize='small'
                    onClick={this.saveEmail.bind(this)}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </Row>
          </div> : null
        }
      </div>
    );
  }
}

export default FavSubscribeButton;
