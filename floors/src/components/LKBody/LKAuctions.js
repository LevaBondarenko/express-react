/**
 * LK Auctions component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {find, size} from 'lodash';
import HelpIcon from '../../shared/HelpIcon';
import LKAuctionsList from '../LKBody/LKAuctions/LKAuctionsList';
import LKAuction from '../LKBody/LKAuctions/LKAuction';
import LKManager from '../LKManager/LKManager';
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
import ga from '../../utils/ga';

class LKAuctions extends Component {
  static propTypes = {
    myauctions: React.PropTypes.array,
    objectsCache: React.PropTypes.object,
    user: React.PropTypes.object,
    auctionId: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    const classes = UserActions.objClasses;
    const objects = props.objectsCache;
    const auction = parseInt(props.auctionId) ?
      find(props.myauctions, {id: parseInt(props.auctionId)}) : false;
    const oclass = auction ? classes[auction.object.type_id] : false;
    const id = auction ? auction.object.ries_id : false;
    const object = oclass && objects[oclass] && objects[oclass][id] ?
      objects[oclass][id] : false;

    this.state = {
      aucTypes: [],
      myauctions: props.myauctions,
      objectsCache: props.objectsCache,
      auction: auction,
      object: object
    };
  }

  componentWillReceiveProps(nextProps) {
    const classes = UserActions.objClasses;
    const objects = nextProps.objectsCache;
    const auction = parseInt(nextProps.auctionId) ?
      find(nextProps.myauctions, {id: parseInt(nextProps.auctionId)}) :
      false;
    const oclass = auction ? classes[auction.object.type_id] : false;
    const id = auction ? auction.object.ries_id : false;
    const object = oclass && objects[oclass] && objects[oclass][id] ?
      objects[oclass][id] : false;

    this.setState(() => ({
      myauctions: nextProps.myauctions,
      objectsCache: nextProps.objectsCache,
      auction: auction,
      object: object
    }));
  }

  trackEvent = () => {
    ga('button', 'lk_torgi_dialog_return_to_list');
  };

  trackEventTorgi = () => {
    ga('pageview', '/virtual/lk/torgi');

    this.trackEventTorgi = () => {};
  }

  render() {
    const {auction, object} = this.state;

    this.trackEventTorgi();

    return size(this.props.myauctions) ? (
      <Row>
        <Col xs={10} className='lkbody-mainblock'>
          <div className='lkbody-auctions'>
            <Row>
              <Col xs={5}>
                <div className='lkbody-pagetitle'>
                  Торги
                  <HelpIcon
                    placement='top'
                    className='help-text-left'
                    helpText={(
                      <span>
                        Участвуйте в онлайн-торгах. Выставляйте свой объект
                        недвижимости или предлагайте свою цену на понравившуюся
                        недвижимость!
                      </span>
                    )}/>
                </div>
              </Col>
              {auction ? (
                <Col xs={7}>
                  <div className='lkbody-toolbar'>
                    <Button
                      bsStyle='link'
                      bsSize='small'
                      href='#/myauctions/'>
                      <i className='fa fa-angle-left' />
                      <span onClick={this.trackEvent}> Вернуться к списку торгов
                      </span>
                    </Button>
                  </div>
                </Col>
              ) : null}
            </Row>
            {auction && object && object !== 'not found' ?
              <LKAuction
                auction={auction}
                object={object}
                {...this.props}/> :
              <LKAuctionsList {...this.state} {...this.props}/>
            }
          </div>
        </Col>
        <Col xs={2} className='lkbody-sideblock'>
          <LKManager/>
        </Col>
      </Row>
    ) : (
      <Row>
        <Col xs={12}>
          <div className='lkbody-auctions'>
            <Row>
              <Col xs={2}>
                <div className='lkbody-pagetitle'>Торги</div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className='lkbody-very-big-icon'>
                  <div className='main-icon'>
                    <i className='fa fa-search'/>
                    <div className='sub-icon'>
                     :(
                    </div>
                  </div>
                </div>
                <div className='text-center'>
                  Вы пока не участвуете в торгах.<br/> Находите недвижимость
                  и предлагайте свою цену.
                </div>
              </Col>
            </Row>
            <Row className='lkbody-advantages'>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-home'/><br/>
                  <span>Ищите</span>
                </div>
                <span>Недвижимость на сайте</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-bar-chart'/><br/>
                  <span>Предлагайте</span>
                </div>
                <span>свою цену на интересующую Вас недвижимость</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-share-square-o'/><br/>
                  <span>Создавайте</span>
                </div>
                <span>предложения с лучшей ценой</span>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default LKAuctions;
