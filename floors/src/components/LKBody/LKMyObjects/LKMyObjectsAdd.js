/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, filter, merge, isEmpty, omit, clone, map, includes, find, sortBy}
  from 'lodash';
import {priceCleanup, switchLkObjectInput} from '../../../utils/Helpers';

import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import ReactDOM from 'react-dom';
import ga from '../../../utils/ga';

import LKMyObjectsPanel from './LKMyObjectsPanel';

import LKMyObjectsMap from './LKMyObjectsMap';
import LKMyObjectsPanelMain from './LKMyObjectsPanelMain';
import PanelBox from './PanelBox';
import SaveInfo from './SaveInfo';
import SavePhoto from './SavePhoto';
import BoxLiquid from './BoxLiquid';
import Fullpage from './Fullpage';
import LKMyObjectsPanelText from './LKMyObjectsPanelText';
import LKMyObjectsPanelAdditional from './LKMyObjectsPanelAdditional';

import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
import {sendOrder, getFromBack} from '../../../utils/requestHelpers';

import api from '../../../api/apiLK';

import {VelocityComponent} from 'velocity-react';

class LKMyObjectsAdd extends Component {
  static propTypes = {
    user: PropTypes.object,
    rieltorSale: PropTypes.string,
    rentBlock: PropTypes.string,
    types: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.liquidRequestDelay = null;
    this.state = {
      type: 'flat',
      types: [],
      fieldsParams: [],
      step: 1,
      item: {},
      newhouse: {},
      steps: [],
      paneHeight: 0,
      info: '',
      completePercent: 10,
      showSecondPanel: false,
      showThirdPanel: false,
      showAdditional: false,
      isLoading: true,
      objectLoading: false,
      liquid: {},
      liquidErrors: {},
      typeRealty: 'flat'
    };
  }

  componentDidMount() {
    const root = document.getElementsByClassName('lkbody--wrapper')[0];

    window.addEventListener('dragover', event => {
      event.preventDefault();
    }, false);
    window.addEventListener('drop', event => {
      event.preventDefault();
    }, false);

    this.setState({
      paneHeight: window.innerHeight - root.offsetTop
    });


    api.get('types').then(response => {
      let types;

      if(isEmpty(this.props.types)) {
        types = filter(response, type => type.id >= 1 && type.id <= 3);
      } else {
        types = filter(response, type => {
          return includes(this.props.types, type.id.toString()) ? type : false;
        });
      }

      this.setState({
        types: types
      });
      api.get('fields/0').then(response => {
        const fieldsParams = response;
        const typeId = find(this.state.types, {en: this.state.type}).id;
        const steps = sortBy(filter(fieldsParams, field => {
          if(!field.system_field &&
            field.enabled &&
            field.editable &&
            !field.extended &&
            includes(field.realty_types, typeId.toString())) { return field; };
        }), ['pos']);

        this.setState({
          fieldsParams: fieldsParams,
          steps: steps,
          isLoading: false
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
  }

  componentWillUnmount() {
    window.removeEventListener('dragover', event => {
      event.preventDefault();
    }, false);
    window.removeEventListener('drop', event => {
      event.preventDefault();
    }, false);
  }

  handleTypeChange = (event) => {
    const type = event.target.value;
    const {fieldsParams} = this.state;
    const typeId = find(this.state.types, {en: type}).id;
    const steps = sortBy(filter(fieldsParams, field => {
      if(!field.system_field &&
        field.enabled &&
        field.editable &&
        !field.extended &&
        includes(field.realty_types, typeId.toString())) { return field; }
    }), ['pos']);

    this.setState({
      item: {},
      type: type,
      steps: steps,
      showSecondPanel: false,
      showThirdPanel: false
    });
  };

  handleSelect = (step) => {
    this.setState({
      step: step
    });
  };

  handleStepChangeUp = () => {
    if(this.state.step < 4) {
      this.setState({
        step: this.state.step + 1
      });
    }
  };

  handleStepChangeDown = () => {
    this.setState({
      step: this.state.step > 1 ? this.state.step - 1 : 1
    });
  };

  handleChange = (event, data = false) => {
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
  };

  getLiquidPrice = () => {
    const {item, newhouse} = this.state;

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
        } :  {
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
          furniture: 'well'
        };

        api.getPrice(data).then(response => {
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
        }, error => {
          const err = JSON.parse(error.error);

          this.setState(() => ({
            liquidErrors: {sell: err.sell, rent: err.rent}
          }));
        });
      }
    }
  };

  clearItem = () => {
    const {fieldsParams, type} = this.state;
    const typeId = find(this.state.types, {en: type}).id;
    const steps = sortBy(filter(fieldsParams, field => {
      if(!field.system_field &&
        field.enabled &&
        field.editable &&
        !field.extended &&
        includes(field.realty_types, typeId.toString())) { return field; }
    }), ['pos']);

    this.setState({
      item: {},
      step: 1,
      steps: steps,
      completePercent: 10,
      showSecondPanel: false,
      showThirdPanel: false
    });
  };

  saveItem = (coords, metaAddress) => {
    const {steps} = this.state;

    this.setState({
      objectLoading: true,
      item: merge(this.state.item, {
        coords: `${coords[0]},${coords[1]}`,
        address_meta: metaAddress //eslint-disable-line camelcase
      })
    });
    if(includes(['room', 'halt', 'flat'], this.state.type)) {
      api.getHouse(`?action=user_get_house&la=${coords[0]}&lo=${coords[1]}`)
        .then(response => {
          const house = response.newhouse;
          let {completePercent} = this.state;

          if(house) {
            const filterFields = filter(steps, field => {
              const riesField =
                field.ries_name && field.ries_name.indexOf('.') !== -1 ?
                field.ries_name.split('.')[1] : field.ries_name;

              if(field.name !== 'house' &&
                field.name !== 'address_meta' &&
                (!riesField ||
                riesField === 'area_total' || riesField === 'keep' ||//так-то костыль, но фиг знает как переделать, в доме тоже есть area_total и keep
                !house[riesField] ||
                house[riesField] === '' ||
                house[riesField] === '0' ||
                house[riesField] === 0)) {
                return field;
              } else {
                completePercent = completePercent + 8;
              }
            });

            this.setState({
              item: merge(this.state.item, {
                'newhouse_id': house.id,
                newhouse: house
              }),
              steps: filterFields,
              completePercent: completePercent,
              newhouse: house ? house : {},
              objectLoading: false
            });
            if(house) {
              this.getLiquidPrice();
            }
          }

        }).catch(() => {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка сохранения объекта - обратитесь в службу поддержки', // eslint-disable-line max-len
            type: 'dang'
          }]);
        });
    } else {
      this.setState({
        objectLoading: false
      });
    }
  };

  //make one func instead of next two
  scrollTonext = () => {
    this.handleStepChangeUp();

    const secondStep = ReactDOM.findDOMNode(this.refs['step_2']);

    this.setState({
      showSecondPanel: true
    });

    $('html, body').animate({
      scrollTop: secondStep.offsetTop + 108
    }, 1000);
  };

  scrollTothird = () => {
    this.handleStepChangeUp();

    const thirdStep = ReactDOM.findDOMNode(this.refs['step_3']);

    this.setState({
      showThirdPanel: true
    });

    $('html, body').animate({
      scrollTop: thirdStep.offsetTop + 108
    }, 1000);
  };

  getSize = (object) => {
    object = filter(object, (value) => value !== '');

    return size(object);
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

  get liquidBlock() {
    const {rentBlock} = this.props;
    const {objectLoading, type} = this.state;
    const objectClassRu = {
      flat: 'квартиру',
      room: 'комнату',
      halt: 'квартиру',
      land: 'участок',
      garden: 'дачу',
      house: 'дом',
      cottage: 'коттедж',
      townhouse: 'таунхаус'
    };
    const otitle = objectClassRu[type];
    const liquidBlock = rentBlock === '1' ? (
      <div>
        <Col xs={4}>
          <ul className='liquidBlock--steps clearfix'>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>1</span>
              Укажите стоимость своей недвижимости
              и нажмите "Продать {otitle}" или "Сдать {otitle}"
            </li>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>2</span>
              Специалист компании свяжется с вами, чтобы проверить
              достоверность информации и ответить на вопросы
            </li>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>3</span>
              <span className='stepFix'>
                После проверки ваш объект появится на etagi.com бесплатно
              </span>
            </li>
          </ul>
        </Col>
        <BoxLiquid
          title='Продажа'
          type='sell'
          handleChange={this.handleChange}
          item={this.state.item}
          liquid={this.state.liquid}
          googleEvent='buyAdd'>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              disabled={objectLoading}
              className='getContine'
              onClick={this.sendRequestSale}
              bsStyle='success'>
              {objectLoading ?
                <i className='fa fa-spin fa-spinner'/> :
                `Продать ${otitle}`}
            </Button>
          </Col>
        </BoxLiquid>
        <BoxLiquid
          title='Аренда'
          type='rent'
          handleChange={this.handleChange}
          item={this.state.item}
          liquid={this.state.liquid}
          googleEvent='rentAdd'>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              disabled={objectLoading}
              className='getContine'
              onClick={this.sendRequestRent}
              bsStyle='success'>
              {objectLoading ?
                <i className='fa fa-spin fa-spinner'/> :
                `Сдать ${otitle}`}
            </Button>
          </Col>
        </BoxLiquid>
        <Col xs={12}>
          <p className='licenseText text-center'>
            Нажимая кнопку "Продать {otitle}" или "Сдать {otitle}",
            Вы соглашаетесь с <a href='/rules/'
            title='Условия размещения' target='_blank'>
            Условиями размещения объявлений на Сайте</a>
          </p>
        </Col>
      </div>
    ) : (
      <div>
        <Col xs={4}>
          <ul className='liquidBlock--steps clearfix'>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>1</span>
              Укажите стоимость своей недвижимости
              и нажмите "Продать {otitle}"
            </li>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>2</span>
              Специалист компании свяжется с вами, чтобы проверить
              достоверность информации и ответить на вопросы
            </li>
            <li className='liquid-step clearfix'>
              <span className='stepWrap'>3</span>
              <span className='stepFix'>
                После проверки ваш объект появится на etagi.com бесплатно
              </span>
            </li>
          </ul>
        </Col>
        <BoxLiquid
          title='Продажа'
          type='sell'
          handleChange={this.handleChange}
          googleEvent='buyAdd'
          item={this.state.item}
          liquid={this.state.liquid}>
          <Col xs={12} className='lkobjects--btn-wrap'>
            <Button
              disabled={objectLoading}
              className='getContine'
              googleEvent='buyAdd'
              onClick={this.sendRequestSale}
              bsStyle='success'>
              {objectLoading ?
                <i className='fa fa-spin fa-spinner'/> :
                `Продать ${otitle}`}
            </Button>
          </Col>
        </BoxLiquid>
        <Col xs={12}>
          <p className='licenseText text-center'>
            Нажимая кнопку "Продать {otitle}" или "Сдать {otitle}",
            Вы соглашаетесь с <a href='/rules/'
            title='Условиями размещения' target='_blank'>
            Условия размещения объявлений на Сайте</a>
          </p>
        </Col>
      </div>
    );

    return liquidBlock;
  }

  handleShowFields = () => {
    this.setState({
      showAdditional: true
    });
    ga('button',  'lk_myobjects_add_kvartira_zapolnit_100');
  };

  trackEvent = () => {
    ga('pageview', '/virtual/lk/myobjects/add');

    this.trackEvent = () => {};
  }

  saveDraft = (event) => {
    event.preventDefault();
    this.saveObject();
  };

  saveObject = (actionType) => {
    const {item, types, type} = this.state;

    if(actionType === 'rent') {
      item.price = item.price_rent;
    }

    let typeId = filter(types, typeitem => typeitem.en === type ?
      typeitem : false)[0];

    if(isEmpty(item)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка сохранения. Вы ничего не выбрали', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      this.setState(() => ({objectLoading: true}));
      typeId = merge(item, {
        'type_id': typeId.id,
        'house_id': item.id,
        status: actionType ? 1 : 0,
        price: item.price / 1000 | 0
      });
      api.create(typeId, 'myobjects').then(response => {
        const {myobjects} = response.data;
        const redirect = actionType ? false : true;

        if(actionType) {
          //prepare order data
          let orderData = {
            action: 'user_send_object',
            id: myobjects[0].id,
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
                  window.location = `#/myobjects/${myobjects[0].id}`;
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
            msg: 'Объект успешно сохранен',
            type: 'info'
          }]);
          WidgetsActions.set('notify',[{
            msg: 'Ваш объект выставлен на проверку',
            type: 'info'
          }]);
        }

        if(this.state.item.photos && size(this.state.item.photos) > 0) {
          this.uploadMedia(
            myobjects[0].id, 'photos', this.state.item.photos
          );
        }

        if(this.state.item.layouts && size(this.state.item.layouts) > 0) {
          this.uploadMedia(
            myobjects[0].id, 'layouts', this.state.item.layouts
          );
        }

        UserActions.set(null, {myobjects: myobjects});
        if(redirect) {
          this.setState(() => ({objectLoading: false}));
          window.location = `#/myobjects/${myobjects[0].id}`;
        }
      });

    }
  };

  uploadMedia = (objectId, type, media) => {
    const tasks = [];

    map(media, file => {
      tasks.push(api.saveMedia({
        action: 'user_create',
        type: type,
        file: file.filename,
        what: `myobjects/${objectId}/media`
      }));
    });

    Promise.all(tasks).then(response => {
      UserActions.set(null, {myobjects: response[0].objects});
    });

  }

  sendRequestSale = (event) => {
    event.preventDefault();
    this.saveObject('sale');

    ga('button', 'lk_myobjects_add_prodat_kvartiry');
  };

  sendRequestRent = (event) => {
    event.preventDefault();
    this.saveObject('rent');

    ga('button', 'k_myobjects_add_sdat_kvartiry');
  };

  /*
  <PanelBox
    percent={5}
    title='Укажите дополнительные параметры'
    decription={`У вас осталось 5 незаполненных параметров. %
    заполненности влияет на рейтинг и частоту показа вашей
    недвижимости вверху выдачи поиска.`}>
    collapsible
  </PanelBox>

  <a href='#'
    className='btn-draft'
    onClick={this.saveDraft}>
    Сохранить и продолжить позже
  </a>

  */

  render() {
    const {steps, type} = this.state;
    const percent = this.donePercent;

    this.trackEvent();

    return (
      <Row>
        <Col xs={12}>
          <h1 className='lkobjects--title'>
            Мои объекты
          </h1>
        </Col>

        <Row className='lkbody-myobjects-group lkbody-myObjects'>
          <Fullpage
            step={this.state.step}
            handleStepChangeUp={this.handleStepChangeUp}
            handleStepChangeDown={this.handleStepChangeDown}>
            <LKMyObjectsPanel {...this.state}
              show={true}
              ref='step_1' >
              <div>
                <h3 className='lkobjects--subtitle'>
                  Укажите тип недвижимости и расположение
                </h3>
                <p className='lkobjects--description'> </p>
              </div>
              <Col xs={12}>
                <ProgressBar striped
                  bsStyle='info'
                  className='lkobjects--progress'
                  now={percent}
                  label={`${percent}%`}/>
              </Col>
              <VelocityComponent
                animation={{opacity: this.state.isLoading ? .3 : 1}}
                duration={300}>
                <div>
                  <LKMyObjectsPanelMain {...this.state} user={this.props.user}
                    handleTypeChange={this.handleTypeChange}/>
                  <LKMyObjectsMap className='clearfix'
                    realtyType={type}
                    saveItem={this.saveItem}
                    scrollTonext={this.scrollTonext}
                    clearItem={this.clearItem}/>
                </div>
              </VelocityComponent>
            </LKMyObjectsPanel>
            <LKMyObjectsPanel {...this.state}
              rieltorSale={this.props.rieltorSale}
              handleChange={this.handleChange}
              show={this.state.showSecondPanel}
              donePercent={this.donePercent}
              scrollTothird={this.scrollTothird}
              noPhone={this.props.user.phone === null ||
                this.props.user.phone === ''}
              ref='step_2'
              fields={steps}>
              <div>
                <h3 className='lkobjects--subtitle'>
                  Укажите основные параметры
                </h3>
                <p className='lkobjects--description'>
                  Заполните все поля, пожалуйста, чтобы перейти
                  на следующий этап
                </p>
              </div>
              <Col xs={12}>
                <ProgressBar striped
                  bsStyle='info'
                  className='lkobjects--progress'
                  now={percent}
                  label={`${percent}%`}/>
              </Col>
            </LKMyObjectsPanel>
          <LKMyObjectsPanel {...this.state}
            show={this.state.showThirdPanel}
            ref='step_3'>
            <div>
              <h3 className='lkobjects--subtitle'>
                Укажите дополнительные параметры и стоимость
              </h3>
              <p className='lkobjects--description' />
            </div>
            <Col xs={12}>
              <ProgressBar striped
                bsStyle='info'
                className='lkobjects--progress'
                now={percent}
                label={`${percent}%`}/>
            </Col>
            <LKMyObjectsPanelText
                handleShowFields={this.handleShowFields}
                percent={percent}/>
            <VelocityComponent
              animation={{opacity: this.state.showAdditional ? 1 : 0}}
              duration={300}>
              <LKMyObjectsPanelAdditional show={this.state.showAdditional}>
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
                    item={this.state.item}/>
                </PanelBox>
                <PanelBox
                  percent={10}
                  title='Добавьте описание'
                  decription={`35.08% пользователей полностью читают описания
                    объекта недвижимости на сайте etagi.com`}>
                    <SaveInfo handleChange={this.handleChange}/>
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
                    item={this.state.item}/>
                </PanelBox>
              </LKMyObjectsPanelAdditional>
            </VelocityComponent>
            {this.liquidBlock}
            <Col xs={12} className='lkobjects--btn-wrap'>
              <a href='#'
                className='btn-draft'
                onClick={this.saveDraft}>
                Сохранить и продолжить позже
              </a>
            </Col>
          </LKMyObjectsPanel>
          </Fullpage>
        </Row>
      </Row>
    );
  }
}

export default LKMyObjectsAdd;
