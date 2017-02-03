/**
 * LK Body component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, values, includes, size, map, without, head, reject}
  from 'lodash';
import classNames from 'classnames';
import {getObjects} from '../../utils/requestHelpers';
import mediaHelpers from '../../utils/mediaHelpers';
import {unicodeUnescape, declOfNum} from '../../utils/Helpers';
import HelpIcon from '../../shared/HelpIcon';
import FavButton from '../../shared/FavButton';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import createFragment from 'react-addons-create-fragment';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
/* global data */
const Basil = canUseDOM ? require('basil.js') : {};

class Comparator extends Component {
  static propTypes = {
    mountNode: React.PropTypes.string,
    parameters: React.PropTypes.string
  };
  static defaultProps = {
    parameters: 'renter_exist,purpose'
  }
  constructor(props) {
    super(props);
    this.state = {
      types: [],
      objects: {},
      subsetData: {},
      mode: 'all',
      skipParams: this.props.parameters,
      noTranslate: []
    };
  }

  componentDidMount() {
    this.getObjectsList();
  }

  getObjectsList() {
    setTimeout(() => {
      const basil = new Basil({namespace: 'etagi_com'});
      const subset = basil.get('objs2compare');
      const oids = {};
      const subsetData = {};
      let params = false;

      //grouping ids of objects by classes for separate requests
      //preparing subset data for merging with objects data
      for(const i in subset) {
        if(subset[i]) {
          if(oids[subset[i].class]) {
            oids[subset[i].class].push(subset[i].id);
            subsetData[subset[i].class][subset[i].id] = subset[i];
          } else {
            oids[subset[i].class] = [subset[i].id];
            subsetData[subset[i].class] = {};
            subsetData[subset[i].class][subset[i].id] = subset[i];
          }
        }
      }
      //clean old objects list and saving grouped subset data
      this.setState(() => ({
        objects: {},
        subsetData: subsetData,
        subset: subset
      }));
      //requests for objects separated by objects classes
      for(const i in oids) {
        if(oids[i]) {
          params = {
            limit: 100,
            order: 'object_id',
            class: i,
            city_id: 'all', // eslint-disable-line camelcase
            object_id: oids[i] // eslint-disable-line camelcase
          };
          this.getObjects(params);
        }
      }
    }, 0);
  }

  getObjects(params) {
    getObjects(params).then(response => {
      const objType = params.class;
      const {objects} = response;
      const newObjects = clone(this.state.objects);
      const existingObjs = map(
        response.objects, item => parseInt(item.object_id)
      );
      const basil = new Basil({namespace: 'etagi_com'});
      let objs = basil.get('objs2compare');

      objs = reject(objs, obj => {
        return (
          existingObjs.indexOf(parseInt(obj.id)) === -1 && obj.class === objType
        );
      });
      basil.set('objs2compare', objs);

      for(const i in objects) {
        if(objects[i]) {
          const obj = objType === 'nh_flats' ?
            values(objects[i].flats)[0][0] : objects[i];

          if(objType === 'nh_flats') {
            obj.jkSlugUrl = objects[i].slugUrl;
            obj.type_ru = 'квартира'; // eslint-disable-line camelcase
          }
          if(objType === 'rent') {
            obj.class = 'rent';
          }
          if(newObjects[objType]) {
            newObjects[objType][obj.object_id] = obj;
          } else {
            newObjects[objType] = {[obj.object_id]: obj};
          }
        }
      }

      this.setState(() => ({
        objects: newObjects
      }));
    }, error => {
      error;
    });
  }

  filterObjects(types) {
    const {objects, subset} = this.state;
    const filteredObjects = [];

    for(const i in subset) {
      if(subset[i]) {
        let obj = false;

        if((!types.length || includes(types, subset[i].class)) &&
          objects[subset[i].class] &&
          objects[subset[i].class][subset[i].id]) {
          obj = objects[subset[i].class][subset[i].id];
        }

        if(obj) {
          filteredObjects.push(obj);
        }
      }
    }

    return filteredObjects;
  }

  onTypeChange(e) {
    let newType = this.state.types;
    const type = e.target.dataset.type ? e.target.dataset.type :
      e.target.parentElement.dataset.type;

    e.target.blur();
    e.target.parentElement.blur();
    if(includes(newType, type)) {
      newType = without(newType, type);
    } else {
      newType.push(type);
    }

    this.setState(() => ({
      types: newType
    }));
  }

  toggleMode(e) {
    const {mode} = e.target.dataset;

    e.target.blur();
    this.setState(() => ({mode: mode}));
  }

  remove(e) {
    const oclass = e.target.dataset.class;
    const id = parseInt(e.target.dataset.id);
    const basil = new Basil({namespace: 'etagi_com'});
    let objs = basil.get('objs2compare');

    objs = reject(objs, obj => {
      return parseInt(obj.id) === parseInt(id) && obj.class === oclass;
    });
    basil.set('objs2compare', objs);
    this.getObjectsList();
  }

  paramsList(objs, mode) {
    const skipParams = this.state.skipParams.split(',');
    let mainParams = {
      city: [],
      district: [],
      street: [],
      'type_ru': [],
      rooms: [],
      price: [],
      'old_price': [],
      square: [],
      'area_land': [],
      'area_house': []
    };
    let params = {};

    if(!data.options.priceDeviationOptions.show &&
      !includes(skipParams, 'deviation')) {
      skipParams.push('deviation');
    }
    for(const i in objs) {
      if(objs[i]) {
        const obj = objs[i];

        //костыль конечно, но на самом деле он не здесь
        if(obj.tocenter) {
          obj.to_center = obj.tocenter;//eslint-disable-line camelcase
          obj.tocenter = null;
        }
        for(const pname in obj) {
          if(obj[pname] && !includes(skipParams, pname)) {
            let pval = obj[pname] && obj[pname] !== '0' && size(obj[pname]) ?
              obj[pname] : null;

            if(pval === 'f') {
              pval = 'нет';
            }
            if(pval === 't') {
              pval = 'да';
            }

            if(mainParams[pname] && pval) {
              mainParams[pname][i] = pval;
            } else if(params[pname] && pval) {
              params[pname][i] = pval;
            } else if(pval) {
              params[pname] = {[i]: pval};
            }
          }
        }
      }
    }

    if(mode === 'diff') {
      const diffParams = {}, mainDiffParams = {};

      for(const i in mainParams) {
        if(mainParams[i]) {
          const param = mainParams[i];
          const firstVal = head(param);

          for(const j in param) {
            if(param[j] !== firstVal || size(param) === 1) {
              mainDiffParams[i] = param;
              break;
            }
          }
        }
      }
      mainParams = mainDiffParams;

      for(const i in params) {
        if(params[i]) {
          const param = params[i];
          const firstVal = head(param);

          for(const j in param) {
            if(param[j] !== firstVal || size(param) === 1) {
              diffParams[i] = param;
              break;
            }
          }
        }
      }
      params = diffParams;
    }

    return {mainParams: mainParams, params: params};
  }

  mapParamsList(paramsList) {
    const fields = data.collections.fields;

    return map(paramsList, (item, key) => {
      const priceParam = includes([
        'price',
        'old_price',
        'mortgage_pay',
        'price_m2'
      ], key);
      const uunit = fields[key] && fields[key].ru[1] ?
        unicodeUnescape(fields[key].ru[1]) : '';
      const unit = fields[key] && (uunit || priceParam) ? (
        priceParam ?
          <PriceUnit>{uunit}</PriceUnit> : uunit
      ) : null;
      const title = fields[key] ? (
        <span>
          {unit ?
            <span>{unicodeUnescape(fields[key].ru[0])}, {unit}</span> :
            unicodeUnescape(fields[key].ru[0])
          }
        </span>
      ) : '';

      return size(item) && fields[key] ? (
        <div key={key} className='lkbody-compare-params-name'>
          {title}
        </div>
      ) : null;
    });
  }

  mapNoTraslate(paramsList) {
    const fields = data.collections.fields;
    const noTranslateArr = [];

    map(paramsList, (item, key) => {
      if (!fields[key]) {
        noTranslateArr.push(key);
      }

    });

    return noTranslateArr;
  }

  render() {
    const elem = document.getElementById(this.props.mountNode);
    const fields = data.collections.fields;
    const objBlockWidth = elem.clientWidth - 280;
    const {objects, types, mode} = this.state;
    const filteredObjects = this.filterObjects(types);
    const countTitle = declOfNum(size(filteredObjects), [
      ' объект недвижимости',
      ' объекта недвижимости',
      ' объектов недвижимости'
    ]);
    const paramsList = this.paramsList(filteredObjects, mode);
    const source = data.options.mediaSource;
    const typesArr = {
      flats: 'Вторичная',
      nh_flats: 'Новостройки', // eslint-disable-line camelcase
      cottages: 'Загородная',
      offices: 'Коммерческая',
      rent: 'Аренда'
    };
    let typeSelector = map(typesArr, (item, key) => {
      const count = objects[key] ? size(objects[key]) : 0;

      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': includes(types, key)})
          }
          data-type={key}
          onClick={this.onTypeChange.bind(this)}>
          <span>{item}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {`(${count})`}
          </span>
        </Button>
      );
    });
    const mainParamsTable = this.mapParamsList(paramsList.mainParams);
    let paramsTable = this.mapParamsList(paramsList.params);

    paramsTable = createFragment({
      paramsTable: mainParamsTable.concat(paramsTable)
    });

    let objectItems;

    if(filteredObjects) {
      objectItems = map(filteredObjects, (object, key) => {
        const oclass = object.class === 'newhousesflats' ||
          object.class === 'flats_secondary_no' ?
            'nh_flats' : object.class;
        const favButton =
          (<FavButton
            key={`fav${oclass}${object.object_id}`}
            className='btn-fav-incomparator'
            oclass={oclass}
            oid={object.object_id}
          />);
        const photo = object.main_photo && object.main_photo !== '0' ?
          mediaHelpers.getApiMediaUrl(
            '300267',
            object.visual === 'layout' ? 'layouts' : 'photos',
            object.main_photo,
            source) :
          mediaHelpers.getApiMediaUrl(
            'content',
            'no_photo',
            'photos.png',
            source);
        const mainParamsTable = map(paramsList.mainParams, (item, pkey) => {
          let value = size(item[key]) && item[key] !== '0' ? item[key] : '-';

          if(includes([
            'price',
            'old_price',
            'mortgage_pay',
            'price_m2'
          ], pkey)) {
            value = value !== '-' ? <Price price={Math.ceil(value)}/> : '-';
          }
          return size(item) ? (
            <div
              key={`${key}${pkey}`}
              className='lkbody-compare-objects-item-value'
              title={value}>
              {value}
            </div>
          ) : null;
        });
        let paramsTable = map(paramsList.params, (item, pkey) => {
          let value = size(item[key]) && item[key] !== '0' ?
            item[key].toString().replace(/{|}|\"/g, '').replace(/,/g, ', ') :
            '-';

          if(includes([
            'price',
            'old_price',
            'mortgage_pay',
            'price_m2'
          ], pkey)) {
            value = value !== '-' ? <Price price={Math.ceil(value)}/> : '-';
          }
          if(pkey === 'gp') {
            value = value.replace(/&quot;/g, '');
          }
          if((pkey === 'to_center' || pkey === 'rating') && value !== '-') {
            value = Math.round(value * 100) / 100;
          }
          if(value === '') {
            value = '-';
          }
          if(!fields[pkey]) {
            value = 'noTranslate';
          }

          if (value !== 'noTranslate') {
            return(
              <div
                key={`${key}${pkey}`}
                className='lkbody-compare-objects-item-value'
                title={value}>
                {value}
              </div>
            );
          }
        });

        paramsTable = createFragment({
          paramsTable: mainParamsTable.concat(paramsTable)
        });

        let location;

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
        case 'offices' :
          location = `/commerce/${object.object_id}`;
          break;
        case 'rent' :
          location = `/realty_rent/${object.object_id}`;
          break;
        default :
          location = `/realty/${object.object_id}`;
        }

        return (
          <div key={key} className='lkbody-compare-objects-item'>
            <div className='lkbody-compare-objects-item-img'>
              <a href={location} target='_blank'>
                <img src={photo}/>
              </a>
              <span
                className='remove'
                title='удалить из списка сравнения'
                data-class={oclass}
                data-id={object.object_id}
                onClick={this.remove.bind(this)}>
                &times;
              </span>
              {favButton}
            </div>
            <div className='lkbody-compare-objects-item-link'>
              <a href={location} target='_blank'>Узнать больше</a>
            </div>
            <div className='lkbody-compare-objects-item-params'>
              {paramsTable}
            </div>
          </div>
        );
      });
    }

    objectItems = size(objectItems) > 0 ?
      createFragment({objectItems: objectItems}) :
      createFragment({
        objectItems:
          <div className='notFound'>
            <p>Нет объектов для сравнения</p>
          </div>
      });
    typeSelector = createFragment({
      typeSelector: typeSelector
    });

    return (
      <Row className='lkbody'>
        <Col xs={12}>
          <div className='lkbody-compare'>
            <Row>
              <Col xs={12}>
                <div className='lkbody-pagetitle'>
                  Сравнение объектов
                  <HelpIcon
                    placement='top'
                    className='help-text-left'
                    helpText={(
                      <span>
                        Добавляйте понравившиеся объекты недвижимости и
                        сравнивайте их по определенным критериям!
                      </span>
                    )}/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className='lkbody-typeselector compact'>
                <ButtonGroup>
                  {typeSelector}
                </ButtonGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={2} className='lkbody-compare-params'>
                <div className='lkbody-compare-params-header'>
                  <span className='title'>Параметры сравнения</span>
                  <span>в сравнении:</span>
                  <span className='count'>
                    <span>{size(filteredObjects)}</span>
                    <span>{countTitle}</span>
                  </span>
                  <Button
                    bsStyle='primary'
                    active={mode === 'all'}
                    data-mode='all'
                    onClick={this.toggleMode.bind(this)}>
                    Все параметры
                  </Button>
                  <Button
                    bsStyle='primary'
                    active={mode === 'diff'}
                    data-mode='diff'
                    onClick={this.toggleMode.bind(this)}>
                    Различающиеся
                  </Button>
                </div>
                {paramsTable}
              </Col>
              <Col
                xs={10}
                className='lkbody-compare-objects'
                style={{width: `${objBlockWidth}px`}}>
                <GeminiScrollbar  className='lkbody-compare-objects-wrapper'>
                  {objectItems}
                </GeminiScrollbar>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Comparator;
