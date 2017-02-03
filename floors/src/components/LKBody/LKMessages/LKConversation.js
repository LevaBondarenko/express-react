/**
 * LKConversation component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import marked from 'marked';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {getUser} from '../../../utils/requestHelpers';
import {getApiMediaUrl} from '../../../utils/mediaHelpers';
import {map, union} from 'lodash';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import userStore from '../../../stores/UserStore';
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';

/* global data */

class LKConversation extends Component {
  static propTypes = {
    message: React.PropTypes.object,
    messages: React.PropTypes.array,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    let conversation = [];
    const {message, messages, user} = props;
    const riesOpponent = message.from_id === props.user.id ?
      message.to.ries_id : message.from.ries_id;
    const opponent = message.from_id === props.user.id ?
      message.to_id : message.from_id;

    this.scrollToBottom.bind(this);
    for(const i in messages) {
      if(messages[i] &&
        (messages[i].from_id === opponent || messages[i].to_id === opponent)) {
        conversation = union([messages[i]], conversation);
        messages[i].readed || messages[i].from_id === user.id ||
          UserActions.update({}, `message/${messages[i].id}/set_read`);
      }
    }
    (opponent !== props.user.personal_manager) &&
      this.getOpponentData(riesOpponent);
    this.state = {
      answer: '',
      conversation: conversation,
      message: message,
      opponent: opponent,
      opponentData: riesOpponent === props.user.personalManager ?
        userStore.get('manager') || null : null
    };
    this.scrollToBottom();
  }

  componentWillReceiveProps(nextProps) {
    let conversation = [];
    const {message, messages, user} = nextProps;
    const riesOpponent = message.from_id === nextProps.user.id ?
      message.to.ries_id : message.from.ries_id;
    const opponent = message.from_id === nextProps.user.id ?
      message.to_id : message.from_id;

    for(const i in messages) {
      if(messages[i] &&
        (messages[i].from_id === opponent || messages[i].to_id === opponent)) {
        conversation = union([messages[i]], conversation);
        messages[i].readed || messages[i].from_id === user.id ||
          UserActions.update({}, `message/${messages[i].id}/set_read`);
      }
    }
    (opponent !== nextProps.user.personal_manager) &&
      (opponent !== this.state.opponent) &&
      this.getOpponentData(riesOpponent);
    this.setState(() => ({
      conversation: conversation,
      message: message,
      opponent: opponent,
      opponentData: riesOpponent === nextProps.user.personalManager ?
        userStore.get('manager') || this.state.opponentData :
        this.state.opponentData
    }));
    this.scrollToBottom();
  }

  getOpponentData(uid) {
    getUser({action: 'get_user', userId: uid}).then(response => {
      if(parseInt(response.ajax.id) > 0) {
        this.setState(() => ({
          opponentData: response.ajax
        }));
      }
    });
  }

  handleAnswerChange(e) {
    const value = e.target.value;

    this.setState(() => ({answer: value}));
  }

  send() {
    if(this.state.answer.length) {
      UserActions.create(
        {
          subj: ' ',
          body: this.state.answer,
          to_id: this.state.opponent //eslint-disable-line camelcase
        },
        'message'
      );
      WidgetsActions.set('notify',[{
        msg: 'Сообщение отправлено',
        type: 'info'
      }]);
      this.setState(() => ({answer: ''}));
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Нужно ввести сообщение',
        type: 'warn'
      }]);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const conversation = this.refs.conversation ?
        ReactDOM.findDOMNode(this.refs.conversation)
        .getElementsByClassName('gm-scroll-view') : [];

      if(conversation.length) {
        conversation[0].scrollTop = conversation[0].scrollHeight;
      }
    }, 1000);
  }

  back() {
    window.location.hash = '#/messages/';
  }

  getConversationsAttributes() {
    const {message, opponentData} = this.state;
    const {user} = this.props;
    const {to_id, from_id, from, to} = message; //eslint-disable-line camelcase
    const oppAvaFromPics = (/pics2.etagi.com\/lk\//).test(
      opponentData ? opponentData.photo : 'no_photo'
    );
    const opponentPhoto = getApiMediaUrl(
        oppAvaFromPics ? 'lk' : '160160',
        oppAvaFromPics ? '' : 'profile',
        opponentData ? opponentData.photo : 'no_photo',
        data.options.mediaSource);
    const userAvaFromPics = (/pics2.etagi.com\/lk\//).test(
      user ? user.photo : ''
    );
    const userPhoto = getApiMediaUrl(
        userAvaFromPics ? 'lk' : '160160',
        userAvaFromPics ? '' : 'profile',
        user ? user.photo : 'no_photo',
        data.options.mediaSource);
    const opponentName = from_id === user.id ? //eslint-disable-line camelcase
      ((to ? `${to.i} ${to.o ? to.o : ''}` :
        `Пользователь #${to_id}`)) : //eslint-disable-line camelcase
      (from ? `${from.i} ${from.o ? from.o : ''}` :
        `Пользователь #${from_id}`); // eslint-disable-line camelcase
    const userName = user ? `${user.i} ${user.o ? user.o : ''}` :
      `Пользователь #${to_id}`; // eslint-disable-line camelcase

    return {opponentPhoto, userPhoto, opponentName, userName};
  }

  render() {
    const {conversation, opponent, answer} = this.state;
    const {opponentPhoto, userPhoto, opponentName, userName} =
      this.getConversationsAttributes();

    const conversationBlock = map(conversation, msg => {
      const createdDate = new Date(`${msg.created.replace(' ', 'T')}+05:00`);
      const today = new Date();
      const created =
        ((today.getTime() - createdDate.getTime()) / 86400000 | 0) < 1 &&
        today.getDate() === createdDate.getDate() ?
        createdDate.toLocaleTimeString() : createdDate.toLocaleDateString();
      let status;

      if(msg.type > 9999) {
        status = (
          <span className='conversation-status-blocked'>
            не доставлено
            <span
              className='conversation-status-blocked-help'
              title='Недопустимое содержание сообщения'>
              ?
            </span>
          </span>
        );
      } else if(msg.type > 999) {
        status = (
          <span className='conversation-status-checking'>
            отправка...
          </span>
        );
      } else if(!msg.readed) {
        status = (
          <span className='conversation-status-delivered'>
            доставлено
          </span>
        );
      } else {
        status = <span className='conversation-status-readed'>прочитано</span>;
      }

      return msg.from_id === opponent ?
        (<Row className='lkbody-messages-conversation-opponent' key={msg.id}>
          <Col xs={1} title={opponentName}>
            <img src={opponentPhoto} />
          </Col>
          <Col xs={11}>
            <div className='conversation-time'>{created}</div>
            <div
              className='conversation-body'
              dangerouslySetInnerHTML={{
                __html: marked(msg.body, {sanitize: true})
              }}/>
          </Col>
        </Row>) :
        (<Row className='lkbody-messages-conversation-user' key={msg.id}>
          <Col xs={11}>
            <div className='conversation-time'>{created}</div>
            <div
              className='conversation-body'
              dangerouslySetInnerHTML={{
                __html: marked(msg.body, {sanitize: true})
              }}/>
            <div className='conversation-status'>
              {status}
            </div>
          </Col>
          <Col xs={1} title={userName}>
            <img src={userPhoto} />
          </Col>
        </Row>);
    });

    return (
      <div className='lkbody-messages-wrapper'>
        <div className='lkbody-toolbar'>
          <Button
            bsStyle='link'
            bsSize='small'
            onClick={this.back.bind(this)}>
            <i className='fa fa-angle-left' /><span> Назад</span>
          </Button>
        </div>
        <div className='lkbody-messages-container'>
          <div className='lkbody-messages-opponent'>
            {opponentName}
          </div>
          <div className='lkbody-messages-conversation'>
            <GeminiScrollbar ref='conversation'>
              {conversationBlock}
            </GeminiScrollbar>
          </div>
          <div className='lkbody-messages-compose'>
            <textarea
              placeholder='Введите Ваше сообщение'
              rows={4}
              value={answer}
              onChange={this.handleAnswerChange.bind(this)} />
            <Button
              bsStyle='default'
              onClick={this.send.bind(this)}>
              Отправить
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default LKConversation;
