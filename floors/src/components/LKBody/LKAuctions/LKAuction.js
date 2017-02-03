/**
 * LK Auction component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, keys, union, max, filter} from 'lodash';
import classNames from 'classnames';
import marked from 'marked';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {priceFormatter, priceCleanup, getAdress, getTitle}
 from '../../../utils/Helpers';
import {sendOrder} from '../../../utils/requestHelpers';
import {getApiMediaUrl} from '../../../utils/mediaHelpers';
import CheckButton from '../../../shared/CheckButton';
import FavButton from '../../../shared/FavButton';
import createFragment from 'react-addons-create-fragment';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
import ga from '../../../utils/ga';
/* global data */

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;


class LKAuction extends Component {
  static propTypes = {
    auction: React.PropTypes.object,
    object: React.PropTypes.object,
    user: React.PropTypes.object,
    messages: React.PropTypes.array
  };
  constructor(props) {
    super(props);
    const owner = props.auction.object.client_id;
    const mode = owner === props.user.id ? 'seller' : 'buyer';
    const bidders = mode === 'seller' ?
        this.prepareBiddersData(props.auction.bids, props.user.id) : {};
    const bidder = mode === 'seller' ?
      parseInt(keys(bidders)[0]) : props.user.id;
    const opponent = mode === 'seller' ? bidder : owner;
    const lastBid = this.getLastBid(props, mode);

    this.scrollToBottom.bind(this);
    this.state = {
      showConfirmAccept: false,
      answer: '',
      newBid: 0,
      withBid: false,
      offer: 0,
      auction: props.auction,
      object: props.object,
      user: props.user,
      mode: mode,
      bidders: bidders,
      bidder: bidder,
      lastBid: lastBid ? lastBid.price : 0,
      owner: owner,
      opponent: opponent,
      conversation: this.prepareConversation({
        messages: props.messages,
        user: props.user,
        opponent: opponent
      })
    };
    this.scrollToBottom();
  }

  componentWillReceiveProps(nextProps) {
    const owner = nextProps.auction.object.client_id;
    const mode = owner === nextProps.user.id ? 'seller' : 'buyer';
    const bidders = mode === 'seller' ?
        this.prepareBiddersData(nextProps.auction.bids, nextProps.user.id) : {};
    const bidder = mode === 'seller' ?
      parseInt(keys(bidders)[0]) : nextProps.user.id;
    const opponent = mode === 'seller' ? bidder : owner;
    const lastBid = this.getLastBid(nextProps, mode);

    this.setState(() => ({
      auction: nextProps.auction,
      object: nextProps.object,
      user: nextProps.user,
      mode: mode,
      bidders: bidders,
      bidder: bidder,
      lastBid: lastBid ? lastBid.price : 0,
      owner: owner,
      opponent: opponent,
      conversation: this.prepareConversation({
        messages: nextProps.messages,
        user: nextProps.user,
        opponent: opponent
      })
    }));
    this.scrollToBottom();
  }

  getLastBid(props, mode) {
    const {bidder, auction} = props;
    const seller = auction.object.client_id;
    let bid;

    if(mode === 'buyer') {
      bid = max(filter(auction.bids, {user_id: seller}), bid => bid.id); //eslint-disable-line camelcase
    } else {
      bid = max(filter(auction.bids, {user_id: bidder}), bid => bid.id); //eslint-disable-line camelcase
    }
    return bid;
  }

  prepareBiddersData(bids, uid) {
    const bidders = {};

    for(const i in bids) {
      if(bids[i] && bids[i].user.id !== uid) {
        bidders[bids[i].user.id] = {
          name: bids[i].user.i,
          riesId: bids[i].user.ries_id
        };
      }
    }

    return bidders;
  }

  prepareConversation(props) {
    const {messages, opponent, user} = props;
    let conversation = [];

    for(const i in messages) {
      if(messages[i] &&
        (messages[i].from_id === opponent || messages[i].to_id === opponent)) {
        conversation = union([messages[i]], conversation);
        messages[i].readed || messages[i].from_id === user.id ||
          UserActions.update({}, `message/${messages[i].id}/set_read`);
      }
    }

    return conversation;
  }

  handleAnswerChange(e) {
    const value = e.target.value;

    this.setState(() => ({answer: value}));
  }

  send = () => {
    const {answer, newBid, withBid, user, owner, bidder, auction} = this.state;
    const toId = owner === user.id ? bidder : owner;

    if(answer.length || (newBid && withBid)) {
      const body = newBid && withBid ?
        `**Новая ставка:** *${priceFormatter(newBid)}* руб.\n\n${answer}` :
        answer;

      UserActions.create(
        {
          type: 3,
          subj: ' ',
          body: body,
          to_id: toId //eslint-disable-line camelcase
        },
        'message'
      );
      if(newBid && withBid) {
        UserActions.create(
          {price: newBid},
          `lot/${auction.id}/bid`
        );
        WidgetsActions.set('notify',[{
          msg: 'Ставка отправлена',
          type: 'info'
        }]);
      }
      WidgetsActions.set('notify',[{
        msg: 'Сообщение отправлено',
        type: 'info'
      }]);
      this.setState(() => ({answer: ''}));

      ga('button', 'lk_torgi_dialog_send');
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

  bid() {
    const {object} = this.state;

    UserActions.showBid({class: object.class, id: object.object_id});
  }

  changeBid = (event) => {
    const newBid = priceCleanup(event.target.value);

    this.setState(() => ({
      newBid: newBid ? parseInt(newBid) : 0,
      withBid: true
    }));

    ga('checkbox', 'lk_torgi_dialog_change_rate', 'on');
  }

  toggleWithBid = () => {
    this.setState(() => ({withBid: !this.state.withBid}));
    const event = this.state.withBid ? 'off' : 'on';

    ga('checkbox', 'lk_torgi_dialog_change_rate', event);

  }

  changeBidder(e) {
    let ancestor = e.target;

    while(!ancestor.classList.contains('btn') &&
      (ancestor = ancestor.parentElement)) {};
    if(ancestor) {
      const bidder = parseInt(ancestor.dataset.id);

      this.setState(() => ({
        bidder: bidder,
        opponent: bidder,
        conversation: this.prepareConversation({
          messages: this.props.messages,
          user: this.props.user,
          opponent: bidder
        })
      }));
      this.scrollToBottom();
    }
  }

  requestConfirmAccept = () => {
    const {lastBid, object} = this.state;

    this.setState(() => ({
      offer: lastBid ? lastBid : object.price,
      showConfirmAccept: true
    }));

    ga('button', 'lk_torgi_dialog_agree');
  }

  closeConfirmAccept() {
    this.setState(() => ({showConfirmAccept: false}));
  }

  acceptOffer() {
    //длинные тексты сообщений в этом методе временные, после доработки шаблонизатора эти сообщения будут генерироваться в нем по отдельным запросам
    const {user, mode, opponent, offer, object, bidders, bidder, owner} =
      this.state;
    const commonPart = '\n\nВ ближайшее время с Вами свяжется специалист компании ФРК «Этажи» и Вы сможете обсудить дальнейшие действия.'; //eslint-disable-line max-len
    const sellerId = mode === 'seller' ? user.id : owner;
    const buyerId = mode === 'buyer' ? user.id : bidder;

    this.setState(() => ({showConfirmAccept: false}));
    const dataSend = {
      action: 'create_ticket',
      phone: user.phone,
      message: `Запрос на просмотр объекта от пользователя ЛК при окончании торгов, выбранный объект: ${object.class} ${object.object_id}, продавец: ${sellerId}, покупатель: ${buyerId}, принятое предложение: ${offer} руб.`, //eslint-disable-line max-len
      source: 'Web',
      advanced_source: 'LK Objects Review Request', //eslint-disable-line camelcase
      type_id: 132, //eslint-disable-line camelcase
      city_id: data.options.cityId, //eslint-disable-line camelcase
      objectId: 0
    };

    sendOrder(dataSend).then(response => {
      if (response.ajax.success) {
        const notifyBlock =
          (
            <div>
              <div className='notify-header'>Заявка отправлена</div>
              <div className='notify-body'>
                <span>
                  В ближайшее время с Вами свяжется специалист
                  ФРК "ЭТАЖИ"
                </span><br/>
                <span>
                  Номер созданной заявки <b>{response.ajax.data.ticket_id}</b>
                </span>
              </div>
            </div>
          );

        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 30
        }]);
        UserActions.create(
          {
            type: 3,
            subj: 'Достигнута договоренность в торгах',
            body: mode === 'seller' ?
              `Вы согласились с предложением Покупателя ${bidders[bidder].name} продать ему объект недвижимости №${object.object_id} за ${priceFormatter(offer)} руб.${commonPart}` : //eslint-disable-line max-len
              `Вы согласились с предложением Продавца объекта недвижимости №${object.object_id} купить его за ${priceFormatter(offer)} руб.${commonPart}`, //eslint-disable-line max-len
            to_id: user.id //eslint-disable-line camelcase
          },
          'message'
        );
        UserActions.create(
          {
            type: 3,
            subj: ' ',
            body: mode === 'buyer' ?
              `Ваше предложение Покупателю ${user.i} продать ему объект недвижимости №${object.object_id} за ${priceFormatter(offer)} руб. принято.${commonPart}` : //eslint-disable-line max-len
              `Ваше предложение Продавцу объекта недвижимости №${object.object_id} купить его за ${priceFormatter(offer)} руб. принято.${commonPart}`, //eslint-disable-line max-len
            to_id: opponent //eslint-disable-line camelcase
          },
          'message'
        );
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      }
    }, error => {
      error;
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
  }

  render() {
    const {
      object, user, conversation, answer, opponentData, mode,
      newBid, withBid, bidders, bidder, showConfirmAccept, opponent, offer
    } = this.state;
    const userName = `${user.i} ${user.o ? user.o : ''}`;
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
    let filter = map(bidders, (item, key) => {
      return(
        <Button
          bsStyle='default'
          key={key}
          data-id={key}
          className={classNames({active: bidder === parseInt(key)})}
          onClick={this.changeBidder.bind(this)}>
          <span>Покупатель </span>
          <span>{item.name}</span>
        </Button>
      );
    });
    const opponentName = mode === 'buyer' ?
      `Продавец объекта ${object.object_id}` :
      `Покупатель ${bidders[bidder].name}`;

    filter = size(filter) > 0 ?
      createFragment({filter: filter}) :
      createFragment({filter: <div/>})  ;
    const {lastBid} = this.state;
    const priceM = priceFormatter(Math.ceil(object.price_m2));
    const mortgagePay = priceFormatter(object.mortgage_pay);
    const title = getTitle(object.rooms, object.type_ru);
    let location;

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
    const aucBlock = (
      <Col xs={12}>
      <div
        className='objects--item__nomap clearfix'
        ref={object.id}>
        <Col xs={7}>
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
                <Col xs={5} className='objects--item__nomap--detail'>
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
                      </p>) : null}
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
                </Col>
                <Col xs={7} className='objects--item__nomap--detail'>
                    {(object.series && object.series !== '0' ?
                      <p><b>Серия</b>: {object.series}</p> : null)}
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
                  Начальная цена
                </div>
                <div>Последнее предложение</div>
              </div>
              <div className='auction-prices-value'>
                <div>
                  {`${priceFormatter(object.price)} руб.`}
                </div>
                <div>
                  {`${priceFormatter(lastBid ? lastBid : object.price)} руб.`}
                </div>
                <div/>
              </div>
            </div>
          </div>
        </Col>
        <div className='item--controls'>
          <Button
            bsStyle='info'
            onClick={this.requestConfirmAccept}>
            Согласиться с предложением
          </Button>
        </div>
      </div>
      </Col>
    );
    let conversationBlock = map(conversation, msg => {
      const createdDate = new Date(`${msg.created.replace(' ', 'T')}+05:00`);
      const today = new Date();
      const created =
        ((today.getTime() - createdDate.getTime()) / 86400000 | 0) < 1 &&
        today.getDate() === createdDate.getDate() ?
        createdDate.toLocaleTimeString() : createdDate.toLocaleDateString();

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
          </Col>
          <Col xs={1} title={userName}>
            <img src={userPhoto} />
          </Col>
        </Row>);
    });

    conversationBlock = size(conversationBlock) > 0 ?
      createFragment({conversationBlock: conversationBlock}) :
      createFragment({
        conversationBlock: <div/>
      });

    return(
      <div className='lkbody-auctions-wrapper lkbody-messages'>
        <div className='lkbody-auctions-container'>
          <div className={classNames(
            'lkbody-auctions-opponent',
            {'with-corner': mode === 'buyer'}
          )}>
            {mode === 'buyer' ? opponentName : filter}
          </div>
          <Row>
            {aucBlock}
          </Row>
          <div className='lkbody-auctions-conversation'>
            <GeminiScrollbar ref='conversation'>
              {conversationBlock}
            </GeminiScrollbar>
          </div>
          <div className='lkbody-auctions-compose'>
            <textarea
              placeholder='Введите Ваше сообщение'
              rows={6}
              value={answer}
              onChange={this.handleAnswerChange.bind(this)} />
            <div className='lkbody-auctions-compose-params'>
              <span>Ваша ставка:</span>
              <div className='lkbody-auctions-bid form-group'>
                <div className='bid-value'>
                  <input
                    className='form-control text-right'
                    value={priceFormatter(newBid)}
                    onChange={this.changeBid}/>
                  <span className='unit'> руб.</span>
                </div>
                <div className='bid-change-check'>
                  <CheckButton
                    itemID='lkbid-withBid'
                    itemLabel='Изменить ставку'
                    onValue={true}
                    offValue={false}
                    onChange={this.toggleWithBid}
                    dataModel={{}}
                    mode='0'
                    checked={withBid ? 'checked' : false}
                  />
                </div>
              </div>
              <Button
                bsStyle='default'
                onClick={this.send}>
                Отправить
              </Button>
            </div>
          </div>
        </div>
        {showConfirmAccept ?
          <Modal
            className='lkform'
            show={showConfirmAccept}
            onHide={this.closeConfirmAccept.bind(this)}>
              <ModalHeader closeButton></ModalHeader>
              <ModalBody>
                <div
                  className="auth-form form-horizontal lkform-compose">
                  <Row>
                    <Col xs={12}>
                      <Row className='lkform-header'>
                        <Col xs={12} className='lkform-header-title'>
                          <span>Принять предложение?</span>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <span>Вы действительно согласны с предложением </span>
                          <span>{
                            mode === 'buyer' ?
                              `Продавца объекта ${object.object_id}` :
                              `Покупателя ${bidders[bidder].name}`
                          }</span>
                          <span> и согласны </span>
                          <span>{mode === 'buyer' ? 'купить' : 'продать'}</span>
                          <span> этот объект недвижимости за </span>
                          <span><b>{priceFormatter(offer)}</b></span>
                          <span> руб.?</span>
                        </Col>
                      </Row>
                      <Row><Col xs={12}>&nbsp;</Col></Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <Button
                        bsStyle='danger'
                        onClick={this.closeConfirmAccept.bind(this)}>
                        Нет, я случайно!
                      </Button>
                      <Button
                        bsStyle='success'
                        onClick={this.acceptOffer.bind(this)}>
                        Да, я согласен!
                      </Button>
                    </Col>
                  </Row>
                </div>
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
          </Modal> : null
        }
        </div>
    );
  }
}

export default LKAuction;
