/**
 * LK Booking Detail component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import Portal from 'react-portal';
import classNames from 'classnames';
import request from 'superagent';
import {union, without, map, size, forEach} from 'lodash';
import {phoneFormatter} from '../../../utils/Helpers';
import LKBookingObjInfo from './LKBookingObjInfo';
import LKBookingPaymentType from './LKBookingPaymentType';
import LKBookingSettleConfirm from './LKBookingSettleConfirm';
import HelpIcon from '../../../shared/HelpIcon';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import CheckButton from '../../../shared/CheckButton';
import Image from '../../../shared/Image';
import servicesConfig from './config/services';
import LKBookingHelp from './LKBookingHelp';
import ga from '../../../utils/ga';

import WidgetsActions from '../../../actions/WidgetsActions';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './style.scss';
/* global data */
class LKBookingDetail extends Component {
  static propTypes = {
    user: PropTypes.object,
    bookingId: PropTypes.string,
    book: PropTypes.object,
    step: PropTypes.number,
    objects: PropTypes.object,
    comission: PropTypes.number,
    paymentsUrl: PropTypes.string,
    paymentsScid: PropTypes.number,
    contractLink: PropTypes.string,
    phone: PropTypes.string,
    alreadyPayed: PropTypes.bool,
    requestSended: PropTypes.bool,
    onBookingUpdate: PropTypes.func,
    worktime: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      buttonLoader: false,
      selected: 'cash',
      services: [],
      servicesInfo: [],
      priceTotal: props.comission
    };
  }

  onChange = e => {
    const {value} = e.target;
    const {book, objects, comission} = this.props;
    const obj = objects.rent ? objects.rent[book.objectId] : null;
    const {services} = this.state;
    const newServices = services.indexOf(value) === -1 ?
        union(services, [value]) : without(services, value);
    let newPriceTotal = comission;
    const newServiceInfo = [];

    forEach(servicesConfig, (item, key) => {
      if(newServices.indexOf(key) !== -1) {
        let servicePrice = 0;

        ga('checkbox', 'on', 'rent_online_LK_step2_Zastrahovat_kvartiru');

        switch(item.priceType) {
        case 'fixed':
          servicePrice = item.price;
          break;
        case 'perSquare':
          servicePrice = obj && obj.square ? item.price * obj.square : 0;
          break;
        default:
          //don nothing
        }
        newPriceTotal += servicePrice;
        newServiceInfo.push({
          service: key,
          price: servicePrice,
          serviceRu: item.shortTitle
        });
      }else{
        ga('checkbox', 'off', 'rent_online_LK_step2_Zastrahovat_kvartiru');
      }
    });

    this.setState(() => ({
      services: newServices,
      priceTotal: newPriceTotal,
      servicesInfo: newServiceInfo
    }));
  }

  onPrint = () => {
    const body = document.getElementsByTagName('BODY')[0];
    const className = body.className;

    ga('button', 'rent_online_LK_step3_Skachat_dokument');
    body.className = `print-selected ${className}`;
    window.print();
    setTimeout(() => {
      body.className = className;
    }, 100);
  }

  onSend = () => {
    const {book, phone, user} = this.props;
    const {owner} = book.details;

    if (owner && user.email) {
      const phones = owner.phone.split(',');
      const existPhone = size(phones) > 0 && size(phones[0]) > 0;

      this.setState({
        buttonLoader: true
      });

      request
      .post('/backend/')
      .send({
        action: 'send_rolk_receipt',
        actionType: 'ownerContacts',
        address: size(owner.address) ? owner.address : 'Н/Д',
        email: user.email,
        name: size(owner.name.replace(/\s/g, '')) ? owner.name : 'Н/Д',
        phones: existPhone ? map(phones, item => {
          return phoneFormatter(
            item,
            data.options.countryCode.current,
            data.options.countryCode.avail
          );
        }).join(', ') :
        `Н/Д. Обратитесь по тел. ${phone}`,
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки сообщения на почту. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Сообщение с контактными данными владельца успешно отправлено', // eslint-disable-line max-len
            type: 'info'
          }]);
          this.setState({
            buttonLoader: false
          });
        }
      });
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки сообщения на почту. Попробуйте обновить страницу',
        type: 'dang'
      }]);
    }

    ga('button', 'rent_online_LK_step3_Otpravit_na_pochtu');
  }

  trackContractLink = () =>{
    ga('button', 'rent_online_LK_step3_Skachat_dokument');
  }

  focusOnHelp = e => {
    let ancestor = e.target;

    while(!ancestor.dataset.btnsendid && (ancestor = ancestor.parentNode)) {};

    const {btnsendid} = ancestor.dataset;

    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    document.getElementById(btnsendid) &&
     document.getElementById(btnsendid).click();
  }

  get additionalServices() {
    const {book, objects} = this.props;
    const {services} = this.state;
    const obj = objects.rent ? objects.rent[book.objectId] : null;
    let list = map(servicesConfig, (item, key) => {
      let priceDesc = null, price = null;

      switch(item.priceType) {
      case 'fixed':
        price = (
          <Price className={s.servicePrice} price={item.price}>
            &nbsp;
            <PriceUnit />
          </Price>
        );
        break;
      case 'perSquare':
        const priceValue = obj && obj.square ? item.price * obj.square : 0;

        price = (
          <Price className={s.servicePrice} price={priceValue}>
            &nbsp;
            <PriceUnit />
          </Price>
        );
        priceDesc = (
          <Price className={s.servicePriceDesc} price={item.price}>
            &nbsp;
            <PriceUnit /> за 1м<sup>2</sup>
          </Price>
        );
        break;
      default:
        //do nothing
      }
      return (
        <div className={s.servicesListItem} key={key}>
          <div className={s.servicesListItemControl}>
            <CheckButton
              itemID={`services-${key}`}
              onValue={key}
              onChange={this.onChange}
              checked={services.indexOf(key) !== -1}
              itemLabel={item.title}/>
          </div>
          <div className={classNames(
            s.servicesListItemPrice,
            {[s.priceDescBold]: services.indexOf(key) !== -1}
          )}>
            {price}
            {priceDesc}
          </div>
          <Col xs={12}>
            {item.description}
          </Col>
        </div>
      );
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: <div/>});

    return (
      <Col xs={4} className={s.additionalService}>
        <div className={s.servicesTitle}>
          А еще мы можем
          <HelpIcon
            id={`bookId${book.id}`}
            closeButton={true}
            className='help-valign-center help-border-circle help-text-left'
            placement='top'
            helpText={(
              <span>
                Доступные дополнительные услуги при заселении
              </span>
            )}/>
        </div>
        <div className={s.servicesList}>
          {list}
        </div>
      </Col>
    );
  }

  get totalPrice() {
    const {book, objects, comission, bookingId} = this.props;
    const {services, priceTotal, worktime} = this.state;
    const obj = objects.rent ? objects.rent[book.objectId] : null;
    const {offworkPhone, workPhone} = data.options.rentOnline;
    const phone = worktime ? workPhone : offworkPhone;
    let list = map(servicesConfig, (item, key) => {
      let res = null;

      if(services.indexOf(key) !== -1) {
        let servicePrice = 0;

        switch(item.priceType) {
        case 'fixed':
          servicePrice = item.price;
          break;
        case 'perSquare':
          servicePrice = obj && obj.square ? item.price * obj.square : 0;
          break;
        default:
          //do nothing
        }

        res = (
          <span className={s.priceItem} key={key}>
            {`${item.shortTitle}:`}
            <Price price={servicePrice}>
              &nbsp;
              <PriceUnit/>
            </Price>
          </span>
        );
      }
      return res;
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: <div/>});

    return (
      <Col xs={4} className={s.totalPrice}>
        <div className={s.pricesPerServices}>
          <span className={s.priceItem}>
            Комиссия:
            <Price price={comission}>
              &nbsp;
              <PriceUnit/>
            </Price>
          </span>
          {list}
        </div>
        <div className={s.priceTotal}>
          <span className={s.priceItem}>
            Итого к оплате:
            <Price price={priceTotal}>
              &nbsp;
              <PriceUnit/>
            </Price>
          </span>
        </div>
        <Portal isOpened={true} className={'block-to-print'}>
          <div>
            <Row>
              <Row>
                <Col xs={3}>
                  <Image
                    image='//cdn-media.etagi.com/static/site/8/88/88c2a28550e69c97033636d2ad6804bae2c31be9.png' // eslint-disable-line
                    className='img-responsive' />
                </Col>
                <Col xs={9} className={s.invoiceTitle}>
                  Квитанция на оплату<br/> номер брони {book.details.selectedId}
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <h3 className={s.lkBodyBookingListHead}>
                    Поздравляем! Вы забронировали отличную квартиру!
                  </h3>
                </Col>
              </Row>
              <Row className={s.lkBodyBookingListItem}>
                {obj ?
                  <LKBookingObjInfo obj={obj} disableSlider={true} /> :
                  <Col xs={5} className={s.bookingObjectInfo}/>
                }
                <Col xs={4} className={`${s.totalPrice} pull-right`}>
                  <div className={classNames(
                    s.pricesPerServices, s.invoicePrices
                  )}>
                    <span className={s.priceItem}>
                      Комиссия:
                      <Price price={comission}>
                        &nbsp;
                        <PriceUnit/>
                      </Price>
                    </span>
                    {list}
                  </div>
                  <div className={s.priceTotal}>
                    <span className={s.priceItem}>
                      Итого к оплате:
                      <Price price={priceTotal}>
                        &nbsp;
                        <PriceUnit/>
                      </Price>
                    </span>
                  </div>
                </Col>
              </Row>

              <Col xs={12}>
                <LKBookingHelp
                  phone={phone}
                  ticketId={bookingId} />
              </Col>
            </Row>
          </div>
        </Portal>
      </Col>
    );
  }

  get ownerContacts() {
    const {book, bookingId, objects, phone, user, worktime} = this.props;
    const {buttonLoader} = this.state;
    const {owner} = book.details;
    const phones = owner.phone.split(',');
    const obj = objects.rent ? objects.rent[book.objectId] : null;
    const {offworkPhone, workPhone} = data.options.rentOnline;
    const phoneHelp = worktime ? workPhone : offworkPhone;
    const existPhone = size(phones) > 0 && size(phones[0]) > 0;

    return (
      <Col xs={8} className={s.ownerContacts}>
        <div className={s.ownerContactsTitle}>
          Созвонитесь с собственником и подтвердите заселение
        </div>
        <Col xs={5} className={s.ownerContactsList}>
          <span>Имя собственника:</span>
          <span>Телефон:</span>
          <span>Адрес:</span>
        </Col>
        <Col xs={7} className={s.ownerContactsValues}>
          <span>
            {size(owner.name.replace(/\s/g, '')) ? owner.name : 'Н/Д'}
          </span>
          <span className={existPhone ? s.ownerContactsPhones : null}>
            {existPhone ? map(phones, item => {
              return phoneFormatter(
                item,
                data.options.countryCode.current,
                data.options.countryCode.avail
              );
            }).join(', ') :
            `Н/Д. Обратитесь по тел. ${phone}`}
          </span>
          <span>{size(owner.address) ? owner.address : 'Н/Д'}</span>
        </Col>
        <Col xs={5} className={s.ownerContactsList}>
          <span>
            Распечатайте или отправьте себе подтверждение:
          </span>
        </Col>
        <Col xs={7} className={s.ownerContactsValues}>
          <Button
            className={s.contactsPrintButton}
            onClick={this.onPrint}>
            <div>Распечатать</div>
          </Button>
          {user.email ?
            (<Button
              className={
                classNames(
                  [s.contactsSendButton],
                  !buttonLoader && [s.contactsSendButtonImg])
              }
              disabled={buttonLoader}
              onClick={this.onSend}>
                {buttonLoader ?
                  <i className='fa fa-spinner fa-spin' /> :
                  <div>Отправить на почту</div>
                }
            </Button>) :
            (<Button
              className={
                classNames(
                  'btn-disabled',
                  [s.contactsSendButton],
                  [s.disabledSendButton])
              }
              data-btnsendid='helpEmailSendContacts'
              onClick={this.focusOnHelp}>
                <HelpIcon
                  id='helpEmailSendContacts'
                  closeButton={true}
                  className='help-border-circle help-text-left' // eslint-disable-line max-len
                  placement='top'
                  helpText={(
                    <span>
                      Для того, чтобы отправить<br />
                      контактные данные владельца на<br />
                      почту, в профиле ЛК должен быть<br />
                      указан ее адрес.
                    </span>
                  )}/>
            </Button>)
          }
          <Button
            className={s.contractDownloadButton}
            href={this.props.contractLink}
            onClick={this.trackContractLink}>
            <div>Скачать договор</div>
          </Button>
        </Col>
        <Portal isOpened={true} className={'block-to-print'}>
          <Row>
            <Row>
              <Col xs={3}>
                <Image
                  image='//cdn-media.etagi.com/static/site/8/88/88c2a28550e69c97033636d2ad6804bae2c31be9.png' // eslint-disable-line
                  className='img-responsive' />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <h3 className={s.lkBodyBookingListHead}>
                Оплата прошла успешно! С этого момента можете созвониться с
                собственником и заселяться.
                </h3>
              </Col>
            </Row>
            <Row className={s.lkBodyBookingListItem}>
              {obj ?
                <LKBookingObjInfo obj={obj} disableSlider={true} /> :
                <Col xs={5} className={s.bookingObjectInfo}/>
              }
              <Col xs={6} className="pull-right">
                <Row className={s.ownerContacts} style={{width: '100%'}}>
                  <div className={s.ownerContactsTitle}>
                    Созвонитесь с собственником и подтвердите заселение
                  </div>
                  <Col xs={5} className={s.ownerContactsList}>
                    <span>Имя собственника:</span>
                    <span>Телефон:</span>
                    <span>Адрес:</span>
                    <span/>
                  </Col>
                  <Col xs={7} className={s.ownerContactsValues}>
                    <span>
                      {size(owner.name.replace(/\s/g, '')) ? owner.name : 'Н/Д'}
                    </span>
                    <span className={s.ownerContactsPhones}>
                      {existPhone ? map(phones, item => {
                        return phoneFormatter(
                          item,
                          data.options.countryCode.current,
                          data.options.countryCode.avail
                        );
                      }).join(', ') :
                      `Н/Д. Обратитесь по тел. ${phone}`}
                    </span>
                    <span>{owner.address}</span>
                    <span/>
                  </Col>
                  <Col xs={5} className={s.ownerContactsList}>
                    <span>Телефон офиса:</span>
                    <span>Номер бронирования:</span>
                  </Col>
                  <Col xs={7} className={s.ownerContactsValues}>
                    <span>{phone}</span>
                    <span>{book.details.selectedId}</span>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Col xs={12}>
              <LKBookingHelp
                phone={phoneHelp}
                ticketId={bookingId} />
            </Col>
          </Row>
        </Portal>
      </Col>
    );
  }

  render() {
    const {
      book,
      objects,
      step,
      alreadyPayed,
      requestSended,
      comission
    } = this.props;
    const {priceTotal, servicesInfo, worktime} = this.state;
    const obj = objects.rent ? objects.rent[book.objectId] : null;
    const {offworkPhone, workPhone} = data.options.rentOnline;
    const mediaSource = data.options.mediaSource;
    const phone = worktime ? workPhone : offworkPhone;

    return (
      <div>
        <Row className={s.lkBodyBookingListItem}>
          {obj ?
            <LKBookingObjInfo obj={obj}/> :
            <Col xs={5} className={s.bookingObjectInfo}/>
          }
          {step === 2 && !alreadyPayed ? this.additionalServices : null}
          {step === 2 && !alreadyPayed ? this.totalPrice : null}
          {step === 3 ? this.ownerContacts : null}
        </Row>
        {step === 2 && !alreadyPayed ? (
          <LKBookingPaymentType
            {...this.props}
            price={priceTotal}
            comission={comission}
            obj={obj ? obj : null}
            objId={book.objectId}
            mediaSource={mediaSource}
            phone={phone}
            ticketId={book.details.ticketId}
            bookingId={book.details.selectedId}
            onPrint={this.onPrint}
            servicesInfo={servicesInfo}/>
        ) : null}
        {step === 2 && alreadyPayed ? (
          <Row className={s.alreadyPayedWarning}>
            <Col xs={12}>
              Для заселения можно выбрать только одну<br/>
              квартиру. Для того чтобы заслиться в эту,<br/>
              необходимо отменить предыдущее бронирование.
            </Col>
          </Row>
        ) : null}
        {step === 3 ? (
          <LKBookingSettleConfirm
            book={book}
            onBookingUpdate={this.props.onBookingUpdate}
            requestSended={requestSended}/>
        ) : null}
      </div>
    );
  }
}

export default withStyles(s)(LKBookingDetail);
