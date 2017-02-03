/**
 * LK MessagesListItem component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import marked from 'marked';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class LKMessagesListItem extends Component {
  static propTypes = {
    message: React.PropTypes.object,
    uid: React.PropTypes.number
  };
  constructor(props) {
    super(props);
  }

  showMessage(e) {
    let target = e.target;

    while((target = target.parentElement) && !target.dataset.msgid) {}
    const msgid = target.dataset.msgid;

    window.location.hash = `#/messages/${msgid}`;
  }

  render() {
    const {id, type, from_id, to_id, subj, body, created, readed, from, to} = // eslint-disable-line camelcase
      this.props.message;
    const {uid} = this.props;
    const fromName = from_id === uid ? //eslint-disable-line camelcase
      ((to ? `${to.i} ${to.o ? to.o : ''} ` :
        `Пользователь #${to_id} `)) : // eslint-disable-line camelcase
      (from_id ? (from ? `${from.i} ${from.o ? from.o : ''} ` : //eslint-disable-line camelcase
        `Пользователь #${from_id} `) : subj); // eslint-disable-line camelcase
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

    return(
      <div className='lkbody-messages-item'>
        <Row onClick={this.showMessage.bind(this)} data-msgid={id}
          className={readed === null && from_id !== uid ? // eslint-disable-line camelcase
            'lkbody-messages-unreaded' : 'lkbody-messages-readed'}>
          <Col xs={1} className='lkbody-messages-item-icon'>
            <i className={icon} />
          </Col>
          <Col xs={9} className='lkbody-messages-item-from'>
            <span>{fromName}</span>
            <span className='lkbody-messages-item-subj'
              dangerouslySetInnerHTML={{
                __html: marked(
                  from_id ? //eslint-disable-line camelcase
                    (from_id === uid ? //eslint-disable-line camelcase
                      `Вы: ${subj} ${body}` : `${subj} ${body}`) :
                      '',
                  {sanitize: true})
              }}/>
          </Col>
          <Col xs={2} className='lkbody-messages-item-time' title={created}>
            {timeString}
          </Col>
        </Row>
      </div>
    );
  }
}

export default LKMessagesListItem;
