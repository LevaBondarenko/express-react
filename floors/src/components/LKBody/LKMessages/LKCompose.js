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
/**
 * Bootstrap 3 elements
 */
import Modal from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

class LKCompose extends Component {
  static propTypes = {
    messages: React.PropTypes.array,
    user: React.PropTypes.object,
    toId: React.PropTypes.number,
    toData: React.PropTypes.object,
    close: React.PropTypes.func,
    showCompose: React.PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.state = {
      toId: props.toId,
      toData: props.toData,
      msgBody: '',
      conversation: this.getConversation(props.toId, props.messages),
      showCompose: props.showCompose
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      toId: nextProps.toId,
      toData: nextProps.toData,
      conversation: this.getConversation(nextProps.toId, nextProps.messages),
      showCompose: nextProps.showCompose
    }));
  }

  send(e) {
    e.preventDefault();
    if(this.state.msgBody.length) {
      UserActions.create(
        {
          subj: ' ',
          body: this.state.msgBody,
          to_id: this.state.toId //eslint-disable-line camelcase
        },
        'message'
      );
      WidgetsActions.set('notify',[{
        msg: 'Сообщение отправлено',
        type: 'info'
      }]);
      this.setState(() => ({msgBody: ''}));
      this.props.close();
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Нужно ввести сообщение',
        type: 'warn'
      }]);
    }
  }

  handleBodyChange(e) {
    const value = e.target.value;

    this.setState(() => ({msgBody: value}));
  }

  getConversation(toId, messages) {
    let res = 0;

    for(const i in messages) {
      if(messages[i] &&
        (messages[i].from_id === toId || messages[i].to_id === toId)) {
        res = messages[i].id;
        break;
      }
    }

    return res;
  }

  render() {
    const {toData, msgBody, conversation, showCompose} = this.state;

    return (
      <Modal
        className='lkform wide'
        show={showCompose}
        onHide={this.props.close}>
          <ModalHeader closeButton></ModalHeader>
          <ModalBody>
            <form
              className="auth-form form-horizontal lkform-compose"
              autoComplete='off'
              onSubmit={this.send.bind(this)}>
              <Row>
                <Col xs={12}>
                  <Row className='lkform-header'>
                    <Col xs={8} className='lkform-header-title'>
                      <span>Написать сообщение </span>
                      <i className='fa fa-pencil-square-o' />
                    </Col>
                    <Col xs={4}
                      className='lkform-header-link'>
                      <a
                        href={`#/messages/${conversation}`}
                        style={{display: conversation ? 'block' : 'none'}}
                        onClick={this.props.close}>
                        перейти к диалогу
                      </a>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className='lkform-compose-to'>
                <Col xs={2}>Кому:</Col>
                <Col xs={10} className='lkform-compose-to-value'>
                  {toData.fio}
                </Col>
              </Row>
              <Row className='lkform-compose-body'>
                <Col xs={2}>Сообщение:</Col>
                <Col xs={12}>
                  <textarea
                    placeholder='Введите Ваше сообщение'
                    rows={4}
                    value={msgBody}
                    onChange={this.handleBodyChange.bind(this)} />
                </Col>
              </Row>
              <Row>
                  <Col xs={12}>
                      <Button type='submit' bsStyle='primary'>Отправить</Button>
                  </Col>
              </Row>
            </form>
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
      </Modal>
    );
  }
}

export default LKCompose;
