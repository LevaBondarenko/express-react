/**
 * LK MyObjects edit page
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import LKMyObjectsPanel from './LKMyObjectsPanel';
import {size, filter, merge, differenceBy,
  isEmpty, omit, clone, map, sortBy, includes, find} from 'lodash';
import {sendOrder, getFromBack} from '../../../utils/requestHelpers';
import {priceCleanup, capitalizeString,
switchLkObjectInput} from '../../../utils/Helpers';
import classNames from 'classnames';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Button from 'react-bootstrap/lib/Button';
import Static from 'react-bootstrap/lib/FormControl';

import LKMyObjectsPanelAdditional from './LKMyObjectsPanelAdditional';
import PanelBox from './PanelBox';
import SaveInfo from './SaveInfo';
import SavePhoto from './SavePhoto';
import BoxLiquid from './BoxLiquid';
import BoxEdit from './BoxEdit';
import BoxRise from './BoxRise';
import BoxView from './BoxView';
import BoxBids from './BoxBids';
import BoxFavs from './BoxFavs';
import Sticky from 'react-stickynode';

import api from '../../../api/apiLK';

/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';

/**
 * Bootstrap 3 elements
 */


class LKMyObjectsEdit extends Component {
  static propTypes = {
    meta: PropTypes.object,
    rieltorSale: PropTypes.string,
    myobjects: PropTypes.array,
    objectId: PropTypes.string,
    rentBlock: PropTypes.string,
    mode: PropTypes.string,
    types: PropTypes.array
  };

  constructor(props) {
    super(props);
    const object = clone(this.selectedObject(props));

    object.price = object.price * 1000;
    this.liquidRequestDelay = null;
    this.state = {
      type: null,
      types: [],
      fieldsParams: [],
      item: merge(object, object.metadata),
      newhouse: object.newhouse,
      steps: [],
      paneHeight: 0,
      paneWidth: 0,
      completePercent: 10,
      info: '',
      liquid: {},
      liquidErrors: {},
      stats: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    const {item} = this.state;

    if(parseInt(nextProps.objectId) !== item.id) {
      const object = clone(this.selectedObject(nextProps));
      const item = merge(object, object.metadta);

      object.price = object.price * 1000;
      this.setState(() => ({
        item: item,
        newhouse: object.newhouse,
        liquid: {},
        stats: {}
      }));
      if(item.status === 2) {
        this.getLiquidPrice(item, object.newhouse);
        this.getStatData(item);
      }
    }
  }

  componentDidMount() {
    const root = document.getElementsByClassName('lkbody--wrapper')[0];

    this.setState({
      paneHeight: 0,
      paneWidth: root.offsetWidth
    });
    api.get('types').then(response => {
      const types = filter(response, type => type.id >= 1 && type.id <= 3);
      const type = filter(
        response,
        type => type.id === this.state.item.type_id
      );

      this.setState({
        types: types,
        type: type ? type[0].en : 'flat'
      });

      api.get('fields/0').then(response => {
        const fieldsParams = response;
        const typeId = this.state.item.type_id;
        const house = this.state.item.newhouse;
        const steps = sortBy(filter(fieldsParams, field => {
          const riesField =
            field.ries_name && field.ries_name.indexOf('.') !== -1 ?
            field.ries_name.split('.')[1] : field.ries_name;

          if(!field.system_field &&
            field.enabled &&
            field.editable &&
            !field.extended &&
            includes(field.realty_types, typeId.toString()) &&
            (!riesField ||
              riesField === 'area_total' || riesField === 'keep' ||//так-то костыль, но фиг знает как переделать, в доме тоже есть area_total и keep
              !house ||
              !house[riesField] ||
              house[riesField] === '' ||
              house[riesField] === '0' ||
              house[riesField] === 0)) { return field; };
        }), ['pos']);

        this.setState({
          fieldsParams: fieldsParams,
          steps: steps
        });
      }).catch(() => {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка загрузки - обратитесь в службу поддержки', // eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    }).catch(() => {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка загрузки - обратитесь в службу поддержки', // eslint-disable-line max-len
        type: 'dang'
      }]);
    });
    this.getLiquidPrice();
    this.getStatData();
  }

  selectedObject = (props) => {
    const {myobjects, objectId} = props;

    return find(myobjects, {id: parseInt(objectId)});
  };

  handleChange = (event, data = false, saveDraft = false) => {
    const {item} = this.state;
    let field, type, value;

    if(data) {
      field = data.field;
      type = data.type;
      value = data.value;
    } else {
      field = event.target.dataset.field;
      type = event.target.dataset.type;
      value = event.target.value;
    }



    if(item[field] && (field === 'photos' || field === 'layouts')) {
      let cloneItem = clone(item);

      cloneItem = omit(cloneItem, field);
      this.setState({
        item: merge(cloneItem, {[field]: value})
      });
    } else {
      this.setState({
        item: merge(
          item,
          {[field]: type === 'number' ? priceCleanup(value) : value}
        )
      });
    }
    if(field !== 'price' && field !== 'price_rent') {
      if(this.liquidRequestDelay) {
        clearTimeout(this.liquidRequestDelay);
      }
      this.liquidRequestDelay = setTimeout(() => {
        this.getLiquidPrice();
      }, 1000);
    }
    switchLkObjectInput(value, type);

    saveDraft === true && setTimeout(() => { this.saveObject(null, false); });
  };

  getStatData = (newItem = false) => {
    const item = newItem ? newItem : this.state.item;

    if(item.status === 2) {
      const data = {
        action: 'user_get_object_stats',
        object_id: item.ries_id //eslint-disable-line camelcase
      };

      api.getStats(data).then(response => {
        this.setState(() => ({
          stats: {
            views: response.views,
            favs: response.favs,
            bids: response.bids
          }
        }));
      });
    }
  };

  getLiquidPrice = (newItem = false, newNewhouse = false) => {
    const item = newItem ? newItem : this.state.item;
    const newhouse = newNewhouse ? newNewhouse : this.state.newhouse;
    const requestedForId = item.id;

    if(!isEmpty(newhouse) && !isEmpty(item)) {
      if (item.square && item.room && item.floor &&
        newhouse.city_id &&
        newhouse.district_id &&
        newhouse.walls_id &&
        newhouse.series_id &&
        newhouse.floors) {
        const data = item.status === 2 && item.ries_id ? {
          action: 'user_get_analitic_prices',
          type: 'flat',
          'object_id': item.ries_id
        } : {
          action: 'user_get_analitic_prices',
          type: 'flat',
          'area_total': item.square,
          'rooms_cnt': item.room,
          'city_id': newhouse.city_id,
          'district_id': newhouse.district_id,
          keep: 'good',
          'wall_id': newhouse.walls_id,
          'series_id': newhouse.series_id,
          'floor_num': item.floor,
          'floors_cnt': newhouse.floors,
          'furniture': 'well',
          'building_year': item.newhouse.deadline_y,
          'house_category': item.newhouse.house_category
        };

        api.getPrice(data).then(response => {
          const {item} = this.state;

          if(item.id === requestedForId) {
            if(!item.price && response.sell) {
              item.price = response.sell.analitic_price * 1000;
            }
            if(!item.price_rent && response.rent) {
              item.price_rent = response.rent.analitic_price * 1000; //eslint-disable-line camelcase
            }
            this.setState({
              liquid: response,
              item: item
            });
          }
        }, error => {
          const err = JSON.parse(error.error);

          this.setState(() => ({
            liquidErrors: {sell: err.sell, rent: err.rent}
          }));
        });
      }
    }
  };

  get donePercent() {
    const {steps, item, completePercent} = this.state;
    let percent = completePercent;

    if(steps) {
      steps.map(field => {
        if(item[field.name] &&
          (item[field.name] !== '' || item[field.name] > 0)) {
          percent = Math.floor(percent + Math.ceil(
            (65 - completePercent) / size(steps))
          );
        }
      });
    }
    if(item.info && item.info !== '') {
      percent = percent + 10;
    } else if(item.info && item.info === '') {
      percent = percent - 10;
    }

    if(item.photos && size(item.photos) > 0) {
      percent = percent + 15;
    }

    if(item.layouts && size(item.layouts) > 0) {
      percent = percent + 10;
    }

    if(percent > 10) {
      percent = percent - 1;
    }

    if(percent < 10) {
      percent = 10;
    }

    return percent > 100 ? 100 : percent;
  };

  saveDraft = (event) => {
    event.preventDefault();
    this.saveObject();
  };

  saveObject = (actionType, closeEditBox = true) => {
    const {item} = this.state;

    if(actionType === 'rent') {
      item.price = item.price_rent;
    }

    if(isEmpty(item)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка сохранения. Вы ничего не выбрали', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      const originalClone = clone(this.selectedObject(this.props));
      const original = merge(originalClone, originalClone.metadata);
      const newValues = {};
      let someSaved = false;

      for(const i in original) {
        if(original[i] !== undefined && item[i] &&
          Object.prototype.toString.call(item[i]) !== '[object Object]' &&
          Object.prototype.toString.call(item[i]) !== '[object Array]') {
          const newValue = i === 'price' ? item[i] / 1000 | 0 : item[i];

          if(original[i] !== newValue) {
            newValues[i] = newValue;
          }
        }
      }

      if(actionType) {
        newValues.status = 1;
      }

      if(size(newValues)) {
        this.setState(() => ({objectLoading: true}));
        someSaved = true;
        api.update(newValues, `myobjects/${item.id}`).then(response => {
          const {myobjects} = response.data;

          if(actionType) {
            //prepare order data
            let orderData = {
              action: 'user_send_object',
              id: item.id,
              for: actionType
            };

            orderData = item.rieltor_sale === '1' ?
              merge(orderData, {'no_realtor': 1}) : orderData;

            sendOrder(orderData).then(response => {
              if(response.ajax.ok) {
                getFromBack({
                  action: 'user_get_all'
                }).then(response => {
                  if(response.ok) {
                    UserActions.fill(response.data);
                    this.setState(() => ({objectLoading: false}));
                    closeEditBox &&
                      (window.location = `#/myobjects/${item.id}`);
                  } else {
                    WidgetsActions.set('notify',[{
                      msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                      type: 'warn'
                    }]);
                  }
                });
              }
            });
            WidgetsActions.set('notify',[{
              msg: 'Ваш объект выставлен на проверку',
              type: 'info'
            }]);
          } else {
            this.setState(() => ({objectLoading: false}));
            closeEditBox && (window.location = `#/myobjects/${item.id}`);
          }

          WidgetsActions.set('notify',[{
            msg: 'Объект успешно сохранен',
            type: 'info'
          }]);
          UserActions.set(null, {myobjects: myobjects});
        });
      }
      const deletedPhotos = differenceBy(original.photos, item.photos, 'id');
      const deletedLayouts = differenceBy(original.layouts, item.layouts, 'id');

      if (size(deletedPhotos) > 0) {
        someSaved = true;
        WidgetsActions.set('notify',[{
          msg: 'Фотографии удалены',
          type: 'info'
        }]);
        this.deleteMedia(
          item.id, 'photos', deletedPhotos
        );
      }

      if (size(deletedLayouts) > 0) {
        someSaved = true;
        WidgetsActions.set('notify',[{
          msg: 'Планировки удалены',
          type: 'info'
        }]);
        this.deleteMedia(
          item.id, 'layouts', deletedLayouts
        );
      }

      const addedPhotos = differenceBy(item.photos, original.photos, 'id');
      const addedLayouts = differenceBy(item.layouts, original.layouts, 'id');

      if(size(addedPhotos) > 0) {
        someSaved = true;
        WidgetsActions.set('notify',[{
          msg: 'Сохранены фотографии',
          type: 'info'
        }]);
        this.uploadMedia(
          item.id, 'photos', addedPhotos
        );
      }

      if(size(addedLayouts) > 0) {
        someSaved = true;
        WidgetsActions.set('notify',[{
          msg: 'Сохранены планировки',
          type: 'info'
        }]);
        this.uploadMedia(
          item.id, 'layouts', addedLayouts
        );
      }

      if(!someSaved) {
        WidgetsActions.set('notify',[{
          msg: 'Изменений не обнаружено',
          type: 'warn'
        }]);
      }

    }
  };

  sendRequestSale = (event) => {
    event.preventDefault();
    this.saveObject('sale');
  };

  sendRequestRent = (event) => {
    event.preventDefault();
    this.saveObject('rent');
  };

  uploadMedia = (objectId, type, media) => {
    const tasks = [];

    map(media, file => {
      if(file.status) {
        tasks.push(api.saveMedia({
          action: 'user_create',
          type: type,
          file: file.filename,
          what: `myobjects/${objectId}/media`
        }));
      }
    });

    size(tasks) && Promise.all(tasks).then(response => {
      UserActions.set(null, {myobjects: response[0].objects});
    });

  }

  deleteMedia = (objectId, type, media) => {
    const tasks = [];

    map(media, file => {
      tasks.push(api.saveMedia({
        action: 'user_delete',
        type: type,
        id: file.id,
        what: `myobjects/${objectId}/media`
      }));
    });

    size(tasks) && Promise.all(tasks).then(response => {
      UserActions.set(null, {myobjects: response[0].objects});
    });

  }

  get objectAddress() {
    const {item} = this.state;
    let address;

    if(item.address_meta) {
      address = this.state.item.address_meta;
      if(item.flat) {
        address = `${address}, ${item.flat}`;
      }
    } else {
      const addrData = [];

      item.city && addrData.push(capitalizeString(item.city));
      item.district && addrData.push(capitalizeString(item.district));
      item.street && addrData.push(capitalizeString(item.street));
      item.house && addrData.push(item.house);
      item.flat && addrData.push(item.flat);

      address = size(addrData) ? addrData.join(', ') : '';
      item.address_meta = address; //eslint-disable-line camelcase
    }

    return address;
  }

  get objectState() {
    const {item} = this.state;
    const states = [
      'Черновик',
      'На проверке',
      'Активен',
      'Приостановлен'
    ];

    return states[item.status];
  }

  get liquidBlock() {
    const {item} = this.state;
    const {rentBlock} = this.props;
    const {objectLoading} = this.state;
    const objectClassRu = {
      1: 'квартиру',
      3: 'комнату',
      2: 'квартиру',
      8: 'участок',
      6: 'дачу',
      4: 'дом',
      5: 'коттедж',
      7: 'таунхаус'
    };
    const otitle = objectClassRu[item.type_id];
    const liquidBlock = parseInt(rentBlock) === 1 ? (
      <div>
        <Col xs={this.state.item.status === 2 ? 4 : 2}>&nbsp;</Col>
        <BoxLiquid
          title='Продажа'
          type='sell'
          handleChange={this.handleChange}
          item={this.state.item}
          liquid={this.state.liquid}>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              disabled={objectLoading}
              className='getContine'
              onClick={this.state.item.status === 2 ?
                this.saveDraft : this.sendRequestSale}
              bsStyle='success'>
              {objectLoading ?
                <i className='fa fa-spin fa-spinner'/> : (
                this.state.item.status === 2 ?
                'Изменить цену' : `Продать ${otitle}`)}
            </Button>
          </Col>
        </BoxLiquid>
        {this.state.item.status !== 2 ? (
          <BoxLiquid
            title='Аренда'
            type='rent'
            handleChange={this.handleChange}
            item={this.state.item}
            liquid={this.state.liquid}>
            <Col xs={12} className='lkobjects--btn-wrap'>
              <Button
                disabled={objectLoading}
                className='getContine'
                onClick={this.sendRequestRent}
                bsStyle='success'>
                {objectLoading ?
                <i className='fa fa-spin fa-spinner'/> : (
                  this.state.item.status === 2 ?
                  'Изменить цену' : `Сдать ${otitle}`)}
              </Button>
            </Col>
          </BoxLiquid>
        ) : null}
      </div>
    ) : (
      <div>
        <Col xs={4}>&nbsp;</Col>
        <BoxLiquid
          title='Продажа'
          type='sell'
          handleChange={this.handleChange}
          item={this.state.item}
          liquid={this.state.liquid}>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              className='getContine'
              onClick={this.state.item.status === 2 ?
                this.saveDraft : this.sendRequestSale}
              bsStyle='success'>
              {this.state.item.status === 2 ?
                'Изменить цену' : `Продать ${otitle}`}
            </Button>
          </Col>
        </BoxLiquid>
      </div>
    );

    return liquidBlock;
  }

  get widgets() {
    const {item, stats} = this.state;

    return (
      <Row
        className='lkbody-myobjects-group lkbody-myObjects lkobjects--widgets'>
        <BoxEdit className='widget' percent={this.donePercent} id={item.id} />
        <BoxRise className='widget' id={item.id} userMeta={this.props.meta} />
        <BoxLiquid
          className='widget'
          title='Продажа'
          type='sell'
          handleChange={this.handleChange}
          item={this.state.item}
          liquid={this.state.liquid}>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              className='getContine'
              onClick={this.saveDraft}
              bsStyle='success'>
              Изменить цену
            </Button>
          </Col>
        </BoxLiquid>
        <BoxView
          className='widget'
          views={stats.views}
          oid={item.ries_id}
          type={item.type_id} />
        <BoxBids
          className='widget'
          bids={stats.bids}
          oid={item.id} />
        <BoxFavs
          className='widget'
          favs={stats.favs} />
      </Row>
    );
  }

  get editPage() {
    const {steps, paneWidth} = this.state;
    const percent = this.donePercent;

    return(
      <div>
        <Row>
          <Col xs={12}>
            &nbsp;
          </Col>
          <Sticky className='lkbody-sticky clearfix'
            innerZ={1000}
            style={{width: `${paneWidth - 3}px`}}>
            <div>
              <h3 className='lkobjects--subtitle'>
                Редактирование объекта
              </h3>
              <p className='lkobjects--description'>
                Вы успешно создали объект. Вы можете проверить правильность
                заполнения данных и, при необходимости, изменить их.<br/>
                Для того, чтобы выставить объект на сайте etagi.com,
                нажмите "Продать" или "Сдать" внизу страницы.
              </p>
            </div>
            <div/>
            <Col xs={12}>
              <ProgressBar striped
                bsStyle='info'
                className='lkobjects--progress'
                now={percent}
                label={`${percent}%`}/>
            </Col>
          </Sticky>
        </Row>
        <Row className='lkbody-myobjects-group lkbody-myObjects'>
          <Col xs={12}>
            <div>
              <Row className='clearfix'>
                <FormGroup>
                  <Col xs={6} xsOffset={2} >
                      <label className='control-label col-xs-6'>
                        Адрес
                      </label>
                      <Col xs={6}>
                        <Static
                          readOnly
                          value={this.objectAddress}/>
                      </Col>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col xs={6} xsOffset={2} className='col-xs-6 static-nowrap'>
                        <label className='control-label col-xs-6'>
                          Состояние
                        </label>
                        <Col xs={6}>
                          <Static
                            readOnly
                            value={this.objectState}/>
                        </Col>
                  </Col>
              </FormGroup>
              </Row>
            </div>
          </Col>
          <LKMyObjectsPanel {...this.state}
            rieltorSale={this.props.rieltorSale}
            handleChange={this.handleChange}
            action={this.props.mode}
            show={true}
            ref='step_2'
            fields={steps}>
          </LKMyObjectsPanel>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              className={classNames('getContine', {
                'container-width-auto': this.state.item.status !== 2
              })}
              onClick={this.saveDraft}
              bsStyle='success'>
              {this.state.item.status === 2 ?
                'Сохранить' : 'Сохранить и продолжить позже'}
            </Button>
          </Col>
          <LKMyObjectsPanel {...this.state}
            show={true}
            ref='step_3'>
            <div className='panelBox clearfix'>
              <Col xs={4}>
                <Row>
                  <Col xs={3} className='value-completePercent'>
                    {`${percent}%`}
                  </Col>
                  <Col xs={9}>
                    Вы заполнили на {percent}%.
                    Заполните больше информации об объекте
                  </Col>
                </Row>
              </Col>
              <Col xs={5}>
                <Row>
                  <Col xs={3}>
                    <i className='icon-morePercent' />
                  </Col>
                  <Col xs={9}>
                    Заполненность объекта более 90%
                    увеличивает скорость продажи в 2,4 раза
                  </Col>
                </Row>
              </Col>
              <Col xs={3}>
                <Row>
                  <Col xs={3}>
                    <i className='icon-housePercent' />
                  </Col>
                  <Col xs={9}>
                    Расскажите больше о вашем объекте
                  </Col>
                </Row>
              </Col>
            </div>
            <LKMyObjectsPanelAdditional show={true}>
              <PanelBox
                percent={15}
                boxtype='upload'
                title='Добавьте фотографии'
                type='photos'
                decription={`Добавьте свои фотографии и закажите
                  у нас бесплатное фотографирование`}>
                <SavePhoto
                  handleChange={this.handleChange}
                  type='photos'
                  item={this.state.item} />
              </PanelBox>
              <PanelBox
                percent={10}
                title='Добавьте описание'
                decription={`35.08% пользователей полностью читают описания
                  объекта недвижимости на сайте etagi.com`}>
                  <SaveInfo
                    handleChange={this.handleChange}
                    item={this.state.item} />
              </PanelBox>
              <PanelBox
                percent={10}
                title='Добавьте планировку'
                boxtype='upload'
                type='layouts'
                decription={`Бесплатно отрисуем красивую планировку.
                  Прикрепите свою или закажите у нас`}>
                <SavePhoto
                  handleChange={this.handleChange}
                  type='layouts'
                  item={this.state.item} />
              </PanelBox>
            </LKMyObjectsPanelAdditional>
            {this.liquidBlock}
            {this.state.item.status !== 2 ? (
              <Col xs={12} className='lkobjects--btn-wrap'>
                <a href='#'
                  className='btn-draft'
                  onClick={this.saveDraft}>
                  Сохранить и продолжить позже
                </a>
              </Col>
            ) : null}
          </LKMyObjectsPanel>
        </Row>
      </div>
    );
  }

  render() {
    const {type} = this.state;
    const {mode} = this.props;

    return type ?
      (mode === 'edit' ? this.editPage : this.widgets) :
      (
        <div className='lkobjects'>
          <div className='lkobjects--loader'>
            <i className='fa fa-refresh fa-spin fa-4x'/>
          </div>
        </div>
      );
  }
}

export default LKMyObjectsEdit;

/*
            <Col xs={12} className='lkobjects--btn-wrap'>
              {this.getConitious()}
            </Col>
 */
