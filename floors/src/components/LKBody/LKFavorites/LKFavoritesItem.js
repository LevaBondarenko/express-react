/**
 * LK FavoritesItem component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {includes} from 'lodash';
import {postOrder, getFromBack} from '../../../utils/requestHelpers';
import {generateSearchUrl} from '../../../utils/Helpers';
import Helpers from '../../../utils/Helpers';
import FavButton from '../../../shared/FavButton';
import FavCommentBlock from '../../../shared/FavCommentBlock';
import CompareButton from '../../../shared/CompareButton';
import FavSubscribeButton from '../../../shared/FavSubscribeButton';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import DateTimePicker from '../../../shared/DateTimePicker';
import moment from 'moment/moment';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
import Image from '../../../shared/Image';
/* global data */

class LKFavoritesItem extends Component {
  static propTypes = {
    user: React.PropTypes.object,
    object: React.PropTypes.object,
    source: React.PropTypes.number,
    similarityParams: React.PropTypes.array,
    lastItem: React.PropTypes.bool
  };
  static defaultProps = {
    lastItem: false
  };
  constructor(props) {
    super(props);
    const dateTime = props.object.favData && props.object.favData.forreview ?
      props.object.favData.forreview.replace(' ', 'T') :
      null;

    this.analogsLink = this.analogsLink.bind(this);
    this.state = {
      object: props.object,
      show: false,
      draggable: true,
      datetime: dateTime
    };
  }

  componentWillReceiveProps(nextProps) {
    const dateTime = nextProps.object.favData &&
      nextProps.object.favData.forreview ?
      nextProps.object.favData.forreview.replace(' ', 'T') :
      null;

    this.setState(() => ({
      object: nextProps.object,
      datetime: dateTime
    }));
  }

  bid() {
    const {object} = this.state;

    UserActions.showBid({class: object.class, id: object.object_id});
  }

  remove() {
    const {favData} = this.state.object;

    WidgetsActions.set('notify',[{
      msg: `Объект ${favData.id} удален из избранного`,
      type: 'info'
    }]);
    UserActions.updateFavorites(
      'del',
      favData.id,
      favData.class
    );
  }

  signReview(newDateTime) {
    const {favData} = this.state.object;
    const {phone} = this.props.user;
    const datetime = `${newDateTime}+0500`;
    const objs = {[favData.class]: [favData.id]};

    if(newDateTime === false) {
      const notifyBlock =
        (
          <div>
            <div className='notify-header'>Отказ от просмотра</div>
            <div className='notify-body'>
              <span>Вы отказались от просмотра объекта </span>
              <span>{favData.id}</span><br/>
            </div>
          </div>
        );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 30
      }]);
      favData.forreview = null;
      UserActions.updateFavorites(
        'add',
        favData.id,
        favData.class,
        favData
      );
    } else {
      const dateFormatted =
        moment(`${newDateTime}+05:00`)
          .toDate()
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
      const dataSend = {
        phone: phone.replace(/[^0-9+]*/g, '').replace('+7', '8'),
        message: `Запрос на просмотр объекта от пользователя ЛК, выбранный объект: ${favData.class} ${favData.id} выбранное время: ${dateFormatted} `, //eslint-disable-line max-len
        source: 'LK',
        advanced_source: 'LK Objects Review Request', //eslint-disable-line camelcase
        type_id: 132,  //eslint-disable-line camelcase
        city_id: data.options.cityId,  //eslint-disable-line camelcase
        objectId: 0,
        extra: JSON.stringify({
          datetime: datetime,
          objs: objs
        }, (key, value) => {
          if(typeof value === 'number') {
            return value.toString();
          }
          if(value) {
            return value;
          }
        })
      };

      postOrder(dataSend).then(response => {
        if (response.ok) {
          const notifyBlock =
            (
              <div>
                <div className='notify-header'>Запись на просмотр</div>
                <div className='notify-body'>
                  <span>Заявка на просмотр отправлена</span><br/>
                  <span>Объект </span>
                  <span><b>{favData.id}</b></span><br/>
                  <span>Дата и время просмотра:</span><br/>
                  <span><b>{dateFormatted}</b></span><br/>
                  <span>
                    В ближайшее время с Вами свяжется специалист
                    службы просмотров и уточнит детали
                  </span><br/>
                  <span>
                    Номер созданной заявки <b>{response.ticket_id}</b>
                  </span>
                </div>
              </div>
            );

          WidgetsActions.set('notify',[{
            msg: notifyBlock,
            type: 'custom',
            time: 30
          }]);
          getFromBack({
            action: 'user_get_all'
          }).then(response => {
            if(response.ok) {
              UserActions.fill(response.data);
            } else {
              WidgetsActions.set('notify',[{
                msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                type: 'warn'
              }]);
            }
          });
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
  }

  dragStart(e) {
    const {dataset} = e.target;
    const baseEle = document.getElementById(`${dataset.class}-${dataset.id}`);
    const dragImg = baseEle.cloneNode(true);

    dragImg.style.opacity = 0.4;
    e.target.style.opacity = 0.4;
    dragImg.style.zoom = 0.4;
    dragImg.style.position = 'fixed';
    dragImg.style.top = '-1000px';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 180, 0);
    e.dataTransfer.setData('id', dataset.id);
    e.dataTransfer.setData('class', dataset.class);
    e.dataTransfer.dropEffect = 'link';
  }

  dragEnd(e) {
    e.target.style.opacity = 1;
  }

  analogsLink() {
    const {object} = this.state;
    const like = this.props.similarityParams;
    const filter = {
      class: object.class === 'newhousesflats' ? 'nh_flats' : object.class
    };
    const searchUrls = {
      flats: '/realty/search/',
      newhousesflats: '/zastr/search/',
      cottages: '/realty_out/search/',
      offices: '/commerce/search/',
      rent: '/realty_rent/search/'
    };
    const mustBeArrays = ['type', 'rooms'];

    for(const l in like) {
      if(like[l] && object[like[l].param]) {
        const param = like[l].param;
        const percent = like[l].percent;
        let deviation = parseFloat(like[l].deviation);

        if(percent) {
          deviation = Math.floor(
            parseInt(object[param]) * deviation / 100
          );
        }

        if(param !== 'distance') {
          if(deviation === 0) {
            filter[param] = includes(mustBeArrays, param) ?
              [object[param].toString()] : object[param].toString();
          } else {
            filter[`${param}_min`] =
              (parseFloat(object[param]) - deviation).toString();
            filter[`${param}_max`] =
              (parseFloat(object[param]) + deviation).toString();
          }
        } else if(parseFloat(object.la) > 0 && parseFloat(object.lo) > 0) {
          filter.distance = deviation.toString();
          filter.la = object.la.toString();
          filter.lo = object.lo.toString();
        }
      }
    }
    return generateSearchUrl(
      filter,
      `${searchUrls[object.favData ? object.favData.class : object.class]}?`,
      true
    );
  }

  setDraggable(e) {
    this.setState(() => ({draggable: !e}));
  }

  render() {
    const {object, show, datetime, draggable} = this.state;
    const priceM = Math.ceil(object.price_m2);
    const mortgagePay = object.mortgage_pay || '';
    const title = Helpers.getTitle(object.rooms, object.type_ru);
    let location;
    const minDate = moment().add(1, 'days').format('YYYY-MM-DD');
    const maxDate = moment().add(14, 'days').format('YYYY-MM-DD');
    const {lastItem} = this.props;


    location = `/realty/${object.object_id}`;
    if(object) {
      switch(object.class) {
      case 'flats':
        location = `/realty/${object.object_id}`;
        break;
      case 'newhousesflats':
        location = `/zastr/jk/${object.jkSlugUrl}#${object.object_id}`;
        break;
      case 'cottages' :
        location = `/realty_out/${object.object_id}`;
        break;
      case 'rent' :
        location = `/realty_rent/${object.object_id}`;
        break;
      case 'offices':
        location = `/commerce/${object.object_id}`;
        break;
      default :
        //do nothing
      }
    }

    const imageProps = {
      image: object.main_photo ?
        object.main_photo.replace('/photos/', '') : null,
      visual: 'photos',
      width: 300,
      height: 267
    };

    let adress = Helpers.getAdress(
      object.district, object.street, object.house_num
    );

    adress = `${data.collections.cities[object.city_id].name}, ${adress} `;

    const favButton = object.favData ?
      (<FavButton
        key={`fav${object.class}${object.object_id}`}
        className='btn-fav-infavmodule'
        oclass={object.favData.class}
        oid={object.favData.id}
        needConfirm={true}
      />) : null;
    const compareButton = object.favData ?
      (<CompareButton
        key={`review${object.class}${object.object_id}`}
        className='btn-fav-infavmodule'
        oclass={object.favData.class}
        oid={object.favData.id}
      />) : null;
    const subscribeButton = object.favData ?
      (<FavSubscribeButton
        key={`subscribe${object.class}${object.object_id}`}
        className='btn-fav-infavmodule'
        object={object.favData}
      />) : null;

    const toCenter = (object.la && object.lo && parseFloat(object.la) &&
      parseFloat(object.lo) && parseFloat(object.to_center)) ? (
        <span className='adress--tocenter'>
          ({Math.round(object.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;

    const oldPricePercent = parseInt(object.old_price) ?
      (object.price - object.old_price) * 100 / object.old_price | 0 : 0;

    const dateFormatted = object.favData && object.favData.forreview ?
      moment(`${object.favData.forreview.replace(' ', 'T')}+05:00`).toDate()
        .toLocaleString(
          'ru',
          {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
        ) : false;
    const dateUpdate =
      `Последний раз цена изменилась ${object.date_update.split(' ')[0]}`;
    const analogsLink = this.analogsLink();

    return (
      <Col xs={12}>
      <div
        id={`${object.favData.class}-${object.favData.id}`}
        className='objects--item__nomap clearfix'
        ref={object.id}
        data-class={object.favData.class}
        data-id={object.favData.id}
        draggable={draggable && object.status === 'active'}
        onDragStart={this.dragStart.bind(this)}
        onDragEnd={this.dragEnd.bind(this)}>
        <Col xs={3}>
          <div className='objects--item__nomap--img'>
            {object.status === 'active' ?
              <a href={location} target='_blank'>
                <Image draggable={false}
                  className='img-responsive' {...imageProps}/>
              </a> :
              <span>
                <Image className='img-responsive' {...imageProps}/>
              </span>
            }
          </div>
        </Col>
        <Col xs={9}>
          <div className='objects--item__nomap--title clearfix'>
            <h3 className='pull-left col-xs-7'>
              {object.status === 'active' ?
                <a href={location} target='_blank'><b>{title}</b></a> :
                <span><b>{title}</b></span>
              }
              <div className='objects--item__nomap-tools'>
                {favButton}{subscribeButton}{compareButton}
              </div>
            </h3>
            <Price className='item--price pull-right'
              price={object.price}> <PriceUnit/>
            {(oldPricePercent !== 0 ?
              <span>
                <span
                  className={classNames(
                      'item--oldprice-percent',
                      {'red': oldPricePercent > 0 ? true : false}
                  )}
                  title={dateUpdate}>
                  {`${oldPricePercent > 0 ? '+' : ''}${oldPricePercent}%`}
                </span>
                <br/>
                {object.old_price ? (
                  <span className='item--oldprice-withtitle'>
                      Старая цена &nbsp;
                    <Price className='item--oldprice strikethrough'
                      price={object.old_price}> <PriceUnit/>
                    </Price>
                  </span>
                ) : null}
              </span> : <br/>)}
            </Price>
            <p className='col-xs-8 adress' style={{padding: 0}}>
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
            <Col xs={12}
              className='item--description clearfix'>
              <Row>
                <Col xs={4} className='objects--item__nomap--detail'>
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
                  {object.type === 'land' ? // для загородки
                    (<p>
                      <b>Цена за сотку:</b>
                      <Price style={{display: 'block'}}
                        price={Math.round(object.price / object.area_land)}>
                        &nbsp;<PriceUnit/>
                      </Price>
                    </p>) :
                    null}
                </Col>
                <Col xs={4} className='objects--item__nomap--detail'>
                  {(object.square && priceM && object.favData.class !== 'rent' ?
                    <p><b>Цена за м<sup>2</sup></b>:&nbsp;
                      <Price price={priceM}> <PriceUnit/></Price>
                    </p> : null)}
                  {parseInt(object.area_house) !== 0 &&
                            object.class === 'cottages' &&
                            object.type !== 'land' ?
                    (<p><b>Цена за м<sup>2</sup>:</b>&nbsp;
                      <Price
                        price={Math.round(object.price / object.area_house)}>
                        &nbsp;<PriceUnit/>
                      </Price>
                    </p>) :
                    null}
                  {(object.walls && object.walls !== '0' ?
                    <p><b>Материал стен</b>: {object.walls}</p> : null)}
                  {(mortgagePay && mortgagePay !== '0' &&
                    object.favData.class !== 'rent' ?
                    <p className='mortgagePay'>
                      <b>В ипотеку</b>:&nbsp;
                      <Price className='mortgagePay'
                        price={mortgagePay}> <PriceUnit>/мес</PriceUnit>
                      </Price>
                    </p> : null)}
                </Col>
                <Col xs={4} className='objects--item__nomap--detail'>
                  {object.class === 'newhousesflats' ?
                    <p>
                      <b>Застройщик</b>
                      : <span>{object.builder}</span>
                    </p> : null
                  }
                  {dateFormatted ?
                    <p>
                      <b>Просмотр</b>
                      : <span className='detail-date'>{dateFormatted}</span>
                    </p> : null
                  }
                </Col>
                {object.status === 'active' ?
                  <div className='item--controls'
                    style={{display: show ? 'block' : null}}>
                    <DateTimePicker
                      title={dateFormatted ?
                        'Изменить время просмотра' : 'Записаться на просмотр'}
                      cancelTitle='Отменить просмотр'
                      saveTitle='Выбрать'
                      datetime={datetime}
                      maxDate={maxDate}
                      minDate={minDate}
                      topAlign={lastItem}
                      onDateTimeChange={this.signReview.bind(this)}/>
                    {object.favData.class === 'flats' ?
                      <Button
                         bsStyle='info'
                         onClick={this.bid.bind(this)}>
                         Предложить свою цену
                       </Button> : null
                    }
                  </div> : null
                }
              </Row>
              <Row>
                <Col xs={4} className='objects--item__nomap--detaillink'>
                  <a href={location} target='_blank'>Подробнее >></a>
                </Col>
                <Col xs={4} className='objects--item__nomap--detaillink'>
                  <a href={analogsLink} target='_blank'>
                    Показать похожие объекты >>
                  </a>
                </Col>
              </Row>
            </Col>
          </div>
        </Col>
        <FavCommentBlock
          object={object.favData}
          onEditStateChange={this.setDraggable.bind(this)} />
        {object.status === 'active' ? null :
          <div className='objects--item__nomap--sold'>
            <div className='objects--item__nomap--sold-back' />
            <span className='objects--item__nomap--sold-title'>
              <i className='fa fa-home' />
              <br/>
              объекта больше нет на сайте
            </span>
            <br/>
            <span className='objects--item__nomap--sold-descr'>
              Вероятно, он уже нашёл своего счастливого владельца
            </span>
            <br/>
            <Button
              bsStyle='info'
              href={analogsLink}
              target='_blank'
              className='objects--item__nomap--sold-controls'>
              Посмотреть похожие
            </Button>
            <br/>
            <Button
              bsStyle='link'
              className='objects--item__nomap--sold-controls'
              onClick={this.remove.bind(this)}>
              Удалить из избранного
            </Button>
          </div>}
      </div>
      </Col>
    );
  }
}

export default LKFavoritesItem;
