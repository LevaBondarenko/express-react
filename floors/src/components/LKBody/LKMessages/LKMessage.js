/**
 * LK Message component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';

class LKMessage extends Component {
  static propTypes = {
    message: React.PropTypes.object,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      message: props.message
    };
    props.message.readed ||
      UserActions.update({}, `message/${props.message.id}/set_read`);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      message: nextProps.message
    }));
    nextProps.message.readed ||
      UserActions.update({}, `message/${nextProps.message.id}/set_read`);
  }

  back() {
    window.location.hash = '#/messages/';
  }

  render() {
    const {id, type, to_id, from_id, subj, body, created, readed, from, to} = // eslint-disable-line no-unused-vars
      this.state.message;
    const fromName = from_id ? // eslint-disable-line camelcase
      (from ? `${from.f} ${from.i} ${from.o}` :
      `Пользователь #${from_id}`) : 'ФРК "ЭТАЖИ"'; // eslint-disable-line camelcase
    const createdDate = new Date(`${created.replace(' ', 'T')}+05:00`);
    const today = new Date();
    const timeString =
      ((today.getTime() - createdDate.getTime()) / 86400000 | 0) < 1 &&
      today.getDate() === createdDate.getDate() ?
      createdDate.toLocaleTimeString() : createdDate.toLocaleDateString();
    let icon = 'fa fa-comment';

    if(!from_id) { //eslint-disable-line camelcase
      switch(type) {
      case 1:
        icon = 'fa fa-heart';
        break;
      case 2:
        icon = 'fa fa-search';
        break;
      case 3:
        icon = 'fa fa-ruble';
        break;
      default:
        //do nothing
      }
    }

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
          <div className='lkbody-messages-header'>
            <Row><Col xs={1}>От:</Col><Col xs={11}>{fromName}</Col></Row>
            <Row><Col xs={1}>Тема:</Col>
            <Col xs={11}>
              <div className='lkbody-messages-header-subj'>
                <i className={icon} />&nbsp;
                <span>{subj}</span>
              </div>
              <div className='lkbody-messages-header-time'>{timeString}</div>
            </Col></Row>
          </div>
          <div className='lkbody-messages-body'
            dangerouslySetInnerHTML={{__html: body}} />
        </div>
      </div>
    );
  }
}

export default LKMessage;
