/**
 * LKWidgetFavorites component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

class LKWidgetAuctions extends Component {
  static propTypes = {
    myauctions: React.PropTypes.array,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  gotoAuctions() {
    window.location.hash = '#/myauctions/';
  }

  render() {
    const {myauctions} = this.props;
    const aucCount = size(myauctions);
    let newBids = 0;

    for(const i in myauctions) {
      if(myauctions[i]) {
        const {bids, object} = myauctions[i];
        const owner = object.client_id;

        for(const j in bids) {
          if(bids[j] && bids[j].user_id === owner) {
            newBids++;
            break;
          }
        }
      }
    }

    const block = aucCount ?
      (<div>
        <Row>
          <Col xs={6} className='lkbody-widget-value important'>
            {aucCount}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Открытых аукционов
          </Col>
        </Row>
        <Row>
          <Col xs={6} className='lkbody-widget-value'>
            {newBids}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Ответных ставок
          </Col>
        </Row>
        <div className='lkbody-widget-controls'>
          <Button
            bsStyle='link'
            bsSize='small'
            onClick={this.gotoAuctions.bind(this)}>
            <span>Посмотреть изменения </span>
            <i className='fa fa-angle-double-down' />
          </Button>
        </div>
      </div>) :
      (<div>
        <div className='lkbody-widget-info'>
          Предлагайте свою цену на интересующую Вас недвижимость.
        </div>
        <div className='lkbody-widget-controls'>
          <Button
            href='/realty/'
            bsStyle='link'
            bsSize='small'>
            <span>Предложить свою цену </span>
            <i className='fa fa-arrow-right' />
          </Button>
        </div>
      </div>);

    return block;
  }
}

export default LKWidgetAuctions;
