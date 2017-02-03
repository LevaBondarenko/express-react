/**
 * LK AuctionsItem component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {filter, max, includes} from 'lodash';
import marked from 'marked';
import {getAdress, priceFormatter, getTitle, declOfNum}
  from '../../../utils/Helpers';
import FavButton from '../../../shared/FavButton';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions'; // eslint-disable-line no-unused-vars
import ga from '../../../utils/ga';
import Image from '../../../shared/Image';
/* global data */

class LKAuctionItem extends Component {
  static propTypes = {
    object: React.PropTypes.object,
    auction: React.PropTypes.object,
    mode: React.PropTypes.string,
    auctionMode: React.PropTypes.string,
    bidder: React.PropTypes.number,
    uid: React.PropTypes.number,
    onAcceptOffer: React.PropTypes.func
  };
  static defaultProps = {
    mode: 'in-list'
  };
  constructor(props) {
    super(props);
    const lastBid = this.getLastBid(props);
    const {lastMsg, unreaded} = this.prepareMessage(props, lastBid);

    this.getLastBid = this.getLastBid.bind(this);
    this.state = {
      showConfirmAccept: false,
      object: props.object,
      auction: props.auction,
      mode: props.mode,
      auctionMode: props.auctionMode,
      bidder: props.bidder,
      lastBid: lastBid.price,
      lastMsg: lastMsg,
      unreaded: unreaded
    };
  }

  componentWillReceiveProps(nextProps) {
    const lastBid = this.getLastBid(nextProps);
    const {lastMsg, unreaded} = this.prepareMessage(nextProps, lastBid);

    this.setState(() => ({
      object: nextProps.object,
      auction: nextProps.auction,
      mode: nextProps.mode,
      auctionMode: nextProps.auctionMode,
      bidder: nextProps.bidder,
      lastBid: lastBid.price,
      lastMsg: lastMsg,
      unreaded: unreaded
    }));
  }

  getLastBid(props) {
    const {auctionMode, bidder, auction, mode, uid} = props;
    const seller = auction.object.client_id;
    let bid;

    if(mode === 'in-list') {
      if(uid === seller) {
        bid = max(auction.bids, bid => bid.id);
      } else {
        bid = max(filter(auction.bids, {user_id: uid}), bid => bid.id); //eslint-disable-line camelcase
      }
    } else if(auctionMode === 'buyer') {
      bid = max(filter(auction.bids, {user_id: seller}), bid => bid.id); //eslint-disable-line camelcase
    } else {
      bid = max(filter(auction.bids, {user_id: bidder}), bid => bid.id); //eslint-disable-line camelcase
    }
    return bid;
  }

  prepareMessage(props, lastBid) {
    const {auction, messages, uid} = props;
    const seller = auction.object.client_id;
    const opps = seller === uid ? [uid, lastBid.user.id] : [uid, seller];
    let lastMsg = false;
    let unreaded = 0;

    for(const i in messages) {
      if(messages[i] && includes(opps, messages[i].from_id) &&
        includes(opps, messages[i].to_id)) {
        if(!lastMsg) {
          lastMsg = messages[i].from_id === uid ?
            `**Вы:** ${messages[i].body}` :
            messages[i].body;
        }
        if(!messages[i].readed && messages[i].to_id === uid) {
          unreaded++;
        }
      }
    }
    if(!lastMsg) {
      lastMsg = 'Сообщений нет';
    }
    return {lastMsg: lastMsg, unreaded: unreaded};
  }

  bid = () => {
    const {object} = this.state;

    UserActions.showBid({class: object.class, id: object.object_id});
    ga('link', 'lk_torgi_list_change_rate');
  }

  acceptOffer() {
    this.props.onAcceptOffer(this.state.lastBid ?
      this.state.lastBid : this.state.object.price);
  }

  trackEvent = () => {
    ga('button', 'lk_torgi_list_to_dialog');
  };

  render() {
    const {object, auction, lastBid, lastMsg, unreaded} = this.state;
    const seller = auction.object.client_id;
    const {uid} = this.props;
    const priceM = priceFormatter(Math.ceil(object.price_m2));
    const mortgagePay = priceFormatter(object.mortgage_pay);
    const title = getTitle(object.rooms, object.type_ru);
    const messages = declOfNum(unreaded,
      [' новое сообщение', ' новых сообщения', ' новых сообщений']);
    let location;

    const imageProps = {
      image: object.main_photo,
      visual: object.visual,
      width: 300,
      height: 267
    };


    switch(object.class) {
    case 'flats':
      location = `/realty/flat/?id=${object.object_id}`;
      break;
    case 'newhousesflats':
      location = `/zastr/jk/${object.jkSlugUrl}#${object.object_id}`;
      break;
    case 'cottages' :
      location = `/realty_out/object/?id=${object.object_id}`;
      break;
    case 'rent' :
      location = `/realty_rent/flat/?id=${object.object_id}`;
      break;
    default :
      location = `/realty/?id=${object.object_id}`;
    }

    let adress = getAdress(
      object.district, object.street, object.house_num
    );

    adress =
      `${data.collections.cities[parseInt(object.city_id)].name}, ${adress} `;

    const favButton =
      (<FavButton
        key={object.class + object.object_id}
        className='btn-fav-insearchlayout'
        oclass={object.class}
        oid={object.object_id}
      />);


    const toCenter = (object.la && object.lo && parseFloat(object.la) &&
      parseFloat(object.lo) && parseFloat(object.to_center)) ? (
        <span className='adress--tocenter'>
          ({Math.round(object.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;

    return (
      <Col xs={12}>
      <div
        className='objects--item__nomap clearfix'
        ref={object.id}>
        <Col xs={3}>
          <div className='objects--item__nomap--img'>
            {object.status === 'active' ?
              <a href={location} target='_blank'>
                <Image draggable={false}
                  className='img-responsive'
                  {...imageProps} />
              </a> :
              <span>
                <Image className='img-responsive' {...imageProps} />
              </span>
            }
          </div>
        </Col>
        <Col xs={4}>
          <div className='objects--item__nomap--title clearfix'>
            <h3 className='pull-left col-xs-12'>
              {object.status === 'active' ?
                <a href={location} target='_blank'><b>{title}</b></a> :
                <span><b>{title}</b></span>
              }
              {favButton}
            </h3>
            <p className='col-xs-12 adress' style={{padding: 0}}>
              {object.class === 'newhousesflats' ?
                <span className='objects--item__nomap--title-jk'>
                  {object.gp.replace(/&quot;/g, '"')}<br/>
                </span> : null
              }
              <span className="glyphicon glyphicon-map-marker"
                aria-hidden="true" />
              {adress}
              {toCenter}
            </p>
          </div>
          <div className='objects--item__nomap--content clearfix'>
            <Col xs={12} className='item--description clearfix'>
              <Row>
                <Col xs={12} className='objects--item__nomap--detail'>
                    {(object.square ?
                      <p><b>Площадь:</b> {object.square} м<sup>2</sup></p> :
                      null)}
                    {parseInt(object.area_house) !== 0 &&
                              object.class === 'cottages' &&
                              object.type !== 'land' ?
                      (<p><b>Площадь дома:</b>&nbsp;
                        <span>{object.area_house}&nbsp;м<sup>2</sup></span>
                      </p>) :
                      null}
                    {parseInt(object.area_land) !== 0 &&
                              object.class === 'cottages' ?
                      (<p><b>Площадь участка:</b>&nbsp;
                        {object.area_land}&nbsp;сот.
                      </p>) :
                      null}
                    {(object.floor ?
                      <p><b>Этаж/Этажность:</b>&nbsp;
                        {object.floor}/{object.floors}</p> :
                        null)}
                    {(parseInt(object.floors) !== 0 &&
                               object.class === 'cottages' &&
                               object.type !== 'land' ? // для загородки
                      <p><b>Этажность</b>:&nbsp;
                        {object.floors}
                      </p> :
                      null)}
                    {(parseInt(object.rooms) !== 0 &&
                               object.class === 'cottages' &&
                               object.type !== 'land' ? // для загородки
                      <p><b>Кол-во комнат</b>:&nbsp;
                        {object.rooms}
                      </p> :
                      null)}
                    {(object.series && object.series !== '0' ?
                      <p><b>Серия</b>: {object.series}</p> : null)}
                    {(object.square && priceM ?
                      <p><b>Цена за м<sup>2</sup></b>: {priceM} руб.</p> :
                        null)}
                    {parseInt(object.area_house) !== 0 &&
                              object.class === 'cottages' &&
                              object.type !== 'land' ?
                      (<p><b>Цена за м<sup>2</sup>:</b>&nbsp;
                        {priceFormatter(
                            Math.round(object.price / object.area_house)
                          )}&nbsp;руб.
                      </p>) :
                      null}
                    {object.type === 'land' ? // для загородки
                      (<p>
                        <b>Цена за сотку: </b>
                        <span>
                          {priceFormatter(
                            Math.round(object.price / object.area_land))}
                          &nbsp;руб.
                        </span>
                      </p>) :
                      null}
                    {(object.walls && object.walls !== '0' ?
                      <p><b>Материал стен</b>: {object.walls}</p> : null)}
                    {(mortgagePay !== '0' ?
                      <p className='mortgagePay'>
                        <b>В ипотеку</b>:&nbsp;
                        <span className='mortgagePay'>
                          {mortgagePay} руб./мес
                        </span>
                      </p> : null)}
                </Col>
              </Row>
             </Col>
          </div>
        </Col>
        <Col xs={5}>
          <div className='objects--item__nomap--auction clearfix'>
            <div className='auction-prices'>
              <div className='auction-prices-header'>
                <div>
                  {uid === seller ? 'Последняя ставка' : 'Ваша ставка'}
                </div>
                <div>Текущая цена</div>
              </div>
              <div className='auction-prices-value'>
                <div>
                  {`${priceFormatter(lastBid)} руб.`}
                </div>
                <div>{`${priceFormatter(object.price)} руб.`}</div>
              </div>
              <a onClick={this.bid}>
                <i className='fa fa-arrow-right'/>&nbsp;
                Изменить ставку
              </a>
            </div>
            <div className='auction-messages'>
              <div className='auction-messages-header'>
                <a href={`#/myauctions/${auction.id}`}>
                  <i className='fa fa-envelope-o'/>&nbsp;
                  <span>
                    {unreaded > 0 ? <b>{unreaded}{messages}</b> :
                      'Последнее сообщение'}
                  </span>
                </a>
              </div>
              <div
                className='auction-messages-last'
                dangerouslySetInnerHTML={{
                  __html: marked(lastMsg, {sanitize: true})
                }}/>
            </div>
            <div className='auction-controls'>
              <Button
                bsStyle='info'
                onClick={this.trackEvent}
                href={`#/myauctions/${auction.id}`}>
                Открыть
              </Button>
            </div>
          </div>
        </Col>
      </div>
      </Col>
    );
  }
}

export default LKAuctionItem;
