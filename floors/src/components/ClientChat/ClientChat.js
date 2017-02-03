/**
 * ClientChat widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './ClientChat.scss';
import {phoneFormatter, testPhone} from '../../utils/Helpers';
import {sendOrder} from '../../utils/requestHelpers';
import MessageList from './MessageList';
import OrderForm from './OrderForm';
/* Redux */
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';

class ClientChat extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    width: PropTypes.number,
    titleForm: PropTypes.string,
    buttonText: PropTypes.string,
    placeholder: PropTypes.string,
    cityNamePrepositional: PropTypes.string,
    thanksText: PropTypes.string,
    cityId: PropTypes.number,
    countryCode: PropTypes.object,
    ticketType: PropTypes.number,
    updateInUiState: PropTypes.func
  };

  static defaultProps = {
    width: 0,
    placeholder: 'Оставьте сообщение...',
    buttonText: 'Жду звонка',
    ticketType: 109
  }

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

    this.state = {
      mode: 'write',
      iconMode: 'write',
      placeholder: this.props.placeholder,
      messages: [],
      show: this.props.width === 0,
      phone: '',
      offline: true
    };
    this.isMobile = this.props.width === 0;
    this.ws = new WebSocket(`wss://online.etagi.com:9111/?type=${this.props.cityId}`);
  }

  wssStart = () => {
    const {ws} = this;

    ws.onopen = () => {
      console.log('Chat online'); //eslint-disable-line
    };
    ws.onclose = () => {
      console.log('Chat offline. Reconnect'); //eslint-disable-line
      this.wssStart();
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
      case 'sendmessage':
        if (msg.content.messages && this.state.handShake) {
          const content = msg.content;
          const incomingMessages = content.messages['Сегодня'] || [];
          const messages = incomingMessages.map(msg => {
            const date = new Date(msg.time);
            const hours = date.getHours();
            const minutes = `0${date.getMinutes()}`;
            const formattedTime = `${hours}:${minutes.substr(-2)}`;

            return {
              my: msg.type !== 'operator',
              text: msg.text.trim(),
              time: formattedTime,
              read: msg.read
            };
          });

          this.setState({
            offline: !!content.offline,
            operator: content.operator,
            messages: messages,
            avatar: content.avatar
          });
          const msgsWrapper = $(
            ReactDOM.findDOMNode(this.refs['messages-wrapper'])
          );

          if (this.props.width !== 0) {
            msgsWrapper
              .find('.gm-scroll-view')
              .animate({scrollTop: 50000}, 500);
          } else {
            msgsWrapper.animate({scrollTop: 50000}, 500);
          }
        }
        break;
      case 'user':
        // sender = msg.from + ': ';
        break;
      case 'handshake':
        this.setState({
          handShake: true
        });
        return;
      default:
        //
        break;
      }
    };
    setInterval(() => {
      const msg = {'content': '', 'type': 'user'};

      this.sendEmulatedMsg(msg);
    },3000);

  }

  sendEmulatedMsg= msg => {
    const data = JSON.stringify(msg);

    this.ws.send(data);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    const msgsWrapper = ReactDOM.findDOMNode(this.refs['messages-wrapper']);

    if (this.props.width !== 0) {
      msgsWrapper
        .querySelector('.gm-scroll-view')
        .scrollTop = 50000;
    } else {
      msgsWrapper
        .scrollTop = 50000;
    }


    this.wssStart();
  }

  onFocus = () => {
    this.setState({
      placeholder: ''
    });
  }

  onFocusOut = () => {
    this.setState({
      placeholder: this.props.placeholder
    });
  }

  setMessage = event => {
    event.preventDefault();

    this.textArea = event.target;

    this.textArea.style.height = 'auto';
    this.textArea.style.height = `${this.textArea.scrollHeight}px`;

    this.setState({
      msg: event.target.value,
    });
  }

  sendMsg = (textArea) => {
    if (!textArea) return false; //eslint-disable-line
    if (!this.state.msg) return false; //eslint-disable-line

    const {messages} = this.state;
    const date = new Date();
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`;
    const formattedTime = `${hours}:${minutes.substr(-2)}`;

    textArea.style.height = 'auto';

    messages.push({
      my: true,
      text: this.state.msg,
      date: date.getDate(),
      time: formattedTime,
      read: false
    });

    this.setState({
      messages: messages,
      msg: ''
    });

    this.ws.send(JSON.stringify({
      content: this.state.msg,
      type: 'user'
    }));

    const msgsWrapper = $(ReactDOM.findDOMNode(this.refs['messages-wrapper']));

    if (this.props.width !== 0) {
      msgsWrapper
        .find('.gm-scroll-view')
        .animate({scrollTop: 50000}, 500);
    } else {
      msgsWrapper.animate({scrollTop: 50000}, 500);
    }

  }

  onKeyPress = event => {
    if (event.charCode === 13) {
      this.sendMsg(event.target);

      event.preventDefault();
    }
  }

  fadeForm(mode) {
    const formEl = $('#order-form');

    formEl.fadeToggle('100', () => {
      this.setState(() => ({
        mode: mode
      }));
    });
  }

  changeMode = event => {
    event.preventDefault();

    let newMode;

    if (this.state.mode === 'call' || this.state.mode === 'thanks') {
      newMode = 'write';

      this.state.mode === 'call' && this.fadeForm(newMode);
      this.state.mode === 'thanks' && this.setState(() => ({
        mode: newMode
      }));
    } else {
      newMode = 'call';
      this.fadeForm(newMode);
    }

    this.setState(() => ({
      iconMode: newMode
    }));
  }

  hideChat = event => {
    event.preventDefault();

    this.setState({
      show: false
    });
  }

  showChat = event => {
    event.preventDefault();

    this.setState({
      show: true
    });
  }

  onInput = event => {
    event.preventDefault();
    const phone = event.target.value.trim();
    const newPhone = phoneFormatter(phone,
      this.props.countryCode.current,
      this.props.countryCode.avail
    );

    this.setState({
      phone: newPhone
    });
  }

  sendOrder = event => {
    event.preventDefault();

    if (!this.state.phone) return; // eslint-disable-line
    if (!testPhone(this.state.phone)) return; // eslint-disable-line

    const dataSend = {
      action: 'create_ticket',
      phone: this.state.phone,
      source: 'Web',
      'city_id': this.props.cityId,
      'type_id': this.props.ticketType
    };

    sendOrder(dataSend).then(response => {
      if (response.ajax.success) {
        this.setState({
          mode: 'thanks',
          phone: ''
        });
      }
    });
  }

  render() {
    const {width} = this.props;
    const {show} = this.state;

    return (
      <div className={`${s.root} ${show ? '' : s.hidden}`}
           style={{
             width: width ? width : '100%',
             height: width === 0 ? '100%' : 'inherit'
           }}>
        <div className={`${s.chatLabel} ${show ? s.hiddenLabel : ''}`}
             onClick={this.showChat}>
          <div className={s.labelContent}>
            <div className={s.labelText}>Задайте ваш вопрос</div>
            {
              this.state.offline !== true ? (
                <div className={s.status}>
              <span
                className={`${s.indicator} ${s.online}`} />
                  {this.state.offline ? 'Оффлайн' : 'Онлайн'}
                </div>
              ) : null
            }
          </div>
          <div className={s.labelPhoto}>
            <div className={s.image}
                 dangerouslySetInnerHTML={{__html: this.state.avatar}} />
          </div>
        </div>
        <div className={s.header}>
          <div className={s.image}
               dangerouslySetInnerHTML={{__html: this.state.avatar}} />
          <div className={s.headerText}>
            <div className={s.name}>{this.state.operator}</div>
            <div className={s.city}>в {this.props.cityNamePrepositional}</div>
            {
              this.state.offline !== true ? (
                <div className={s.status}>
              <span
                className={`${s.indicator} ${s.online}`} />
                  {this.state.offline ? 'Оффлайн' : 'Онлайн'}
                </div>
              ) : null
            }

          </div>
          <div className={s.close}>
            <a href="#" onClick={this.props.width !== 0 ?
              this.hideChat : event => {
                event.preventDefault();
                this.props.updateInUiState(['mobileShow'], () => null);
              }}>
              <img
                src="https://cdn-media.etagi.com/content/media/site/5/5d/5d47df3586f35c41d5635c75413a8492071aad56.png"
                alt="Закрыть"
              />
            </a>
          </div>
        </div>
        <div className={s.icon}>
            <a href="#"
               onClick={this.changeMode}
               className={this.state.iconMode === 'write' ?
                s.writeMode : s.callMode}
               title={this.state.iconMode === 'call' ?
                'Оставьте сообщение' : 'Оставьте ваш номер телефона'
               }
            />
        </div>
        <OrderForm
          mode={this.state.mode}
          titleForm={this.props.titleForm}
          sendOrder={this.sendOrder}
          onInput={this.onInput}
          phone={this.state.phone}
          buttonText={this.props.buttonText}
          thanksText={this.props.thanksText}
          changeMode={this.changeMode}
          width={width}
          ref="order-form"
        />
        <MessageList
          messages={this.state.messages}
          isMobile={width === 0}
          ref="messages-wrapper"/>
        <div className={s.form}>
          <div className={s.inputWrapper}>
            <textarea
              className={s.textArea}
              name="msg"
              id="msg"
              rows="1"
              onFocus={this.onFocus}
              onBlur={this.onFocusOut}
              onChange={this.setMessage}
              onKeyPress={this.onKeyPress}
              value={this.state.msg}
              placeholder={this.state.placeholder}
            />
            <a onClick={(event) => {
              event.preventDefault();
              this.sendMsg(this.textArea);
            }} className={s.inputIcon} href="#" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => {
  return {
    cityNamePrepositional: state
      .settings.get('selectedCity').get('name_prepositional'),
    countryCode: state
      .settings.get('countryCode').toJS(),
    cityId: state.settings.get('cityId')
  };
}, dispatch => {
  return bindActionCreators({
    updateInUiState: updateInUiState
  }, dispatch);
})(ClientChat);
