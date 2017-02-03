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
import Image from '../../shared/Image';
import {generateSearchUrl} from '../../utils/Helpers';
import Helpers from '../../utils/Helpers';
import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import CompareButton from '../../shared/CompareButton';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/* global data */

class SubsetItem extends Component {
  static propTypes = {
    user: React.PropTypes.object,
    object: React.PropTypes.object,
    subsetData: React.PropTypes.object,
    source: React.PropTypes.number,
    similarityParams: React.PropTypes.array
  };
  constructor(props) {
    super(props);
    this.analogsLink = this.analogsLink.bind(this);
    this.state = {
      object: props.object,
      subsetData: props.subsetData
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      object: nextProps.object,
      subsetData: nextProps.subsetData
    }));
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
      `${searchUrls[object.class]}?`,
      true
    );
  }

  render() {
    const {object, subsetData} = this.state;
    const priceM = Math.ceil(object.price_m2);
    const mortgagePay = object.mortgage_pay || '';
    const title = Helpers.getTitle(object.rooms, object.type_ru);
    const comment = subsetData.comment || '';
    const oclass = object.class === 'newhousesflats' ?
      'nh_flats' : object.class;
    let location;
    const imageProps = {
      image: object.main_photo,
      visual: 'photos',
      width: 300,
      height: 267
    };

    switch(object.class) {
    case 'flats':
      location = `/realty/${object.object_id}/`;
      break;
    case 'newhousesflats':
      location = `/zastr/jk/${object.jkSlugUrl}#${object.object_id}`;
      break;
    case 'cottages' :
      location = `/realty_out/${object.object_id}/`;
      break;
    case 'offices' :
      location = `/commerce/${object.object_id}/`;
      break;
    case 'rent' :
      location = `/realty_rent/${object.object_id}/`;
      break;
    default :
      location = `/realty/${object.object_id}/`;
    }

    let adress = Helpers.getAdress(
      object.district, object.street, object.house_num
    );

    adress = `${data.collections.cities[object.city_id].name}, ${adress} `;

    const favButton =
      (<FavButton
        key={`fav${oclass}${object.object_id}`}
        className='btn-fav-infavmodule'
        oclass={oclass}
        oid={object.object_id}
        needConfirm={true}
      />);
    const compareButton =
      (<CompareButton
        key={`review${oclass}${object.object_id}`}
        className='btn-fav-infavmodule'
        oclass={oclass}
        oid={object.object_id}
      />);

    const toCenter = (object.la && object.lo && parseFloat(object.la) &&
      parseFloat(object.lo) && parseFloat(object.to_center)) ? (
        <span className='adress--tocenter'>
          ({Math.round(object.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;

    const oldPricePercent = parseInt(object.old_price) ?
      (object.price - object.old_price) * 100 / object.old_price | 0 : 0;

    const dateFormatted = object.favData && object.favData.forreview ?
      (new Date(`${object.favData.forreview.replace(' ', 'T')}+0500`))
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
        id={`${oclass}-${object.object_id}`}
        className='objects--item__nomap clearfix'
        ref={object.id}>
        <Col xs={3}>
          <div className='objects--item__nomap--img'>
            {object.status === 'active' ?
              <a href={location} target='_blank'>
                <Image draggable={false} className='img-responsive'
                  {...imageProps}/>
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
                {favButton}{compareButton}
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
                  {(object.square && priceM && object.class !== 'rent' ?
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
                    object.class !== 'rent' ?
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
                <div className='item--controls'>
                    <Button
                      href={location}
                      bsStyle='info'>
                      Подробнее
                    </Button>
                </div>
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
        {comment && comment.length ? (
          <div className='objects--item__nomap--comment'>
            <div className='objects--item__nomap--comment-text'>
              <span>{comment}</span>
            </div>
          </div>
        ) : null}
      </div>
      </Col>
    );
  }
}

export default SubsetItem;
