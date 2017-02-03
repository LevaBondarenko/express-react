/**
 * LK MyObjects just sended page
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {find, merge, clone, size, includes} from 'lodash';
import {generateSearchUrl} from '../../../utils/Helpers';
import UserActions from '../../../actions/UserActions';
import LKSearchItemObject from '../../LKBody/LKSearches/LKSearchItemObject';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';


class LKMyObjectsJustSended extends Component {
  static propTypes = {
    similarityParams: PropTypes.array,
    myobjects: PropTypes.array,
    objectId: PropTypes.string,
    types: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  analogsLink = () => {
    const {myobjects} = this.props;
    const object = find(myobjects, item => {
      return item.id === parseInt(this.props.objectId);
    });

    if(object) {
      const objectClass = UserActions.objClasses[object.type_id];
      const coords = object.coords ? object.coords.split(',') : [0,0];

      const like = this.props.similarityParams;
      const filter = {
        class: objectClass === 'newhousesflats' ? 'nh_flats' : objectClass
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
          const mul = param === 'price' ? 1000 : 1;
          let deviation = parseFloat(like[l].deviation);

          if(percent) {
            deviation = Math.floor(
              parseInt(object[param] * mul) * deviation / 100
            );
          }

          if(param !== 'distance') {
            if(deviation === 0) {
              filter[param] = includes(mustBeArrays, param) ?
                [object[param].toString()] : (object[param] * mul).toString();
            } else {
              filter[`${param}_min`] =
                (parseFloat(object[param] * mul) - deviation).toString();
              filter[`${param}_max`] =
                (parseFloat(object[param] * mul) + deviation).toString();
            }
          } else if(parseFloat(object.la) > 0 && parseFloat(object.lo) > 0) {
            filter.distance = deviation.toString();
            filter.la = coords[0];
            filter.lo = coords[1];
          }
        }
      }
      return generateSearchUrl(
        filter,
        `${searchUrls[objectClass]}?`,
        true
      );
    }
  };

  get prepareObject() {
    const {myobjects, objectId} = this.props;
    const object = find(myobjects, item => {
      return item.id === parseInt(objectId);
    });
    const objectClassRu = {
      1: ['квартира', 'flat'],
      3: ['комната', 'flat'],
      2: ['квартира', 'flat'],
      8: ['участок', 'land'],
      6: ['дача', 'garden'],
      4: ['дом', 'house'],
      5: ['коттедж', 'cottage'],
      7: ['таунхаус', 'townhouse']
    };
    const clonnedObject = clone(merge(object, object.metadata));
    const coords = object.coords ? object.coords.split(',') : '';
    const oclass = UserActions.objClasses[object.type_id];
    let photoFilename;

    if(size(object.photos) > 0) {
      photoFilename = object.photos[0].file;
    } else if (size(object.photos) === 0 && size(object.layouts) > 0) {
      photoFilename = object.layouts[0].file;
    } else {
      photoFilename = '0';
    }

    return merge(clonnedObject, {
      la: coords[0],
      lo: coords[1],
      price: object.price * 1000,
      class: oclass,
      price_m2: object.price * 1000 / object.square, //eslint-disable-line camelcase
      floors: object.newhouse ? object.newhouse.floors : object.floor,
      floor: oclass === 'cottages' ? 0 : object.floor,
      main_photo: photoFilename, //eslint-disable-line camelcase
      district: null, //always displaing address_meta in just sended module
      to_center: null, //eslint-disable-line camelcase
      house_num: object.house, //eslint-disable-line camelcase
      rooms: object.room,
      date_update: '', //eslint-disable-line camelcase
      area_house: object.square, //eslint-disable-line camelcase
      area_land: object.square_land, //eslint-disable-line camelcase
      square: oclass === 'cottages' ? 0 : object.square,
      type_ru: objectClassRu[object.type_id][0], //eslint-disable-line camelcase
      type: objectClassRu[object.type_id][1]
    });
  }

  render() {
    const object = this.prepareObject;

    return (
      <div>
        <Row>
          <Col xs={12}>
            <div className='text-center'>
              <h3>Поздравляем!</h3>
              <h3>Вы создали объект недвижимости</h3>
            </div>
            <Row>
              <Col xs={3} />
              <LKSearchItemObject
                object={object}
                disableFav={true}
                disableLink={true}
                class={object.class} />
            </Row>
            <Col xs={12}>
              <div className='text-center'>
                Сейчас ваш объект проходит проверку и дальнейшее
                редактирование<br/> недоступно.
                Ожидайте уведомление на почту или смс.<br/>
                Если у вас есть вопросы, вы можете позвонить на
                горячую линию<br/>
                <a className='lkbody--phone' href='tel:88005102510'>
                  8-800-510-2-510
                </a> (звонок по России бесплатный)
              </div>
            </Col>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className='text-center'>
            <Button
              target='_blank'
              className='lkbody--addAnalogs'
              bsStyle='success'
              href={this.analogsLink()}>
              Посмотреть похожую недвижимость
            </Button>
            <div className="lkbody--addAnother">
              <a className="lkbody--addAnother__link"
                href="#/myobjects/add">
                <i className="fa fa-chevron-circle-right"></i>
                Добавить еще объект
              </a>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default LKMyObjectsJustSended;
