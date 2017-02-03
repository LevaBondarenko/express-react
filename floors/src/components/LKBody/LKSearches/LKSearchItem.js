/**
 * LK Searche Item component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, clone, size, isEqual} from 'lodash';
import {generateSearchUrl, getFilterDesc, declOfNum}
  from '../../../utils/Helpers';
import {getObjects} from '../../../utils/requestHelpers';
import LKSearchItemObject from './LKSearchItemObject';
import classNames from 'classnames';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import wss from '../../../stores/WidgetsStateStore';

class LKSearchItem extends Component {
  static propTypes = {
    search: React.PropTypes.object,
    period: React.PropTypes.string,
    colls: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.closeClick = this.closeClick.bind(this);
    this.getCounts = this.getCounts.bind(this);
    this.getObjects = this.getObjects.bind(this);
    this.state = {
      currency: null,
      show: false,
      dispMode: 'all',
      all: -1,
      updated: -1,
      created: -1,
      priceMin: -1,
      priceMax: -1,
      priceM2Avg: -1,
      objects: [],
      colls: props.colls,
      searchUrls: {
        flats: '/realty/search/',
        nh_flats: '/zastr/search/', // eslint-disable-line camelcase
        cottages: '/realty_out/search/',
        offices: '/commerce/search/',
        rent: '/realty_rent/search/'
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.period !== this.props.period ||
      nextProps.search !== this.props.search) {
      this.getCounts();
      this.getObjects();
      this.setState(() => ({
        dispMode: 'all'
      }));
    }
    if(!isEqual(nextProps.colls, this.props.colls)) {
      this.setState(() => ({
        colls: nextProps.colls
      }));
    }
    this.closeClick();
  }

  componentWillUnmount() {
    wss.offChange(this.wssChange);
    document.removeEventListener('click', this.close);
  }

  toggleShow() {
    if(!this.state.show) {
      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
    }
    this.setState(() => ({show: !this.state.show}));
  }

  close(e) {
    let ancestor = e.target;

    while((ancestor = ancestor.parentElement) &&
          !ancestor.classList.contains('lk-popup')) {};
    if(!ancestor) {
      this.setState(() => ({show: false}));
      document.removeEventListener('click', this.close);
    }
  }

  closeClick() {
    this.setState(() => ({show: false}));
    document.removeEventListener('click', this.close);
  }

  onDispModeChange(e) {
    let ancestor = e.target;

    while(!ancestor.classList.contains('btn') &&
      (ancestor = ancestor.parentElement)) {};
    this.setState(() => ({dispMode: ancestor.dataset.display}));
    this.getObjects();
  }

  componentDidMount() {
    const {currency} = wss.get();

    if(currency) {
      this.setState(() => ({
        currency: {
          course: currency.nominal / currency.value,
          unit: currency.symbol
        }
      }));
    }
    wss.onChange(this.wssChange);
    this.getCounts();
    this.getObjects();
  }

  wssChange = () => {
    const {currency} = wss.get();

    if(currency) {
      this.setState(() => ({
        currency: {
          course: currency.nominal / currency.value,
          unit: currency.symbol
        }
      }));
    }
  }

  getCounts() {
    setTimeout(() => {
      const objClass = this.props.search.class;
      const filter = this.props.search.filter;
      const model = clone(filter);

      model.class = objClass;
      getObjects(model, ['price']).then(response => {
        const {count, price_min, price_max, price_m2_avg} =
          response.aggregates[0];

        this.setState(() => ({
          all: count ? count : 0,
          priceMin: price_min ? price_min : 0, // eslint-disable-line camelcase
          priceMax: price_max ? price_max : 0, // eslint-disable-line camelcase
          priceM2Avg: price_m2_avg ? price_m2_avg | 0 : 0 // eslint-disable-line camelcase
        }));
      });
      model.date_create_min = this.props.period;
      getObjects(model, ['price']).then(response => {
        const {count} = response.aggregates[0];

        this.setState(() => ({created: count ? count : 0}));
      });
      model.date_create_min = null;
      model.date_update_min = this.props.period;
      getObjects(model, ['price']).then(response => {
        const {count} = response.aggregates[0];

        this.setState(() => ({updated: count ? count : 0}));
      });
    }, 0);
  }

  getObjects() {
    setTimeout(() => {
      const objClass = this.props.search.class;
      const filter = this.props.search.filter;
      const {dispMode} = this.state;
      const model = clone(filter);

      model.class = objClass;
      model.limit = 2;
      model.order = objClass !== 'flats' ?
        'date_update desc' : 'date_rise desc';
      if(dispMode === 'created') {
        model.date_create_min = this.props.period;
        model.order = 'date_create desc';
      }
      if(dispMode === 'updated') {
        model.date_update_min = this.props.period;
        model.order = 'date_update desc';
      }
      getObjects(model).then(response => {
        const {objects} = response;

        this.setState(() => ({
          objects: objects ? objects : []
        }));
      });
    }, 0);
  }

  deleteSearch(e) {
    let elm = e.target, sid = elm.dataset.id;

    while(!sid) {elm = elm.parentNode; sid = elm.dataset.id;}
    UserActions.del(`searches/${sid}`);
  }

  toggleNotify(e) {
    const {notifications} = this.props.search;
    let elm = e.target, sid = elm.dataset.id;

    while(!sid) {elm = elm.parentNode; sid = elm.dataset.id;}
    UserActions.update(
      {notifications: notifications ? 0 : 1},
      `searches/${sid}`
    );
  }

  toggleNotifyEmail(e) {
    const {notifications_email} = this.props.search;
    let elm = e.target, sid = elm.dataset.id;

    while(!sid) {elm = elm.parentNode; sid = elm.dataset.id;}
    UserActions.update(
      {notifications_email: notifications_email ? 0 : 1}, // eslint-disable-line camelcase
      `searches/${sid}`
    );
  }

  render() {
    const {name, filter, notifications, id, notifications_email} =
      this.props.search;
    const {show, dispMode, objects, colls, currency} = this.state;
    const objClass = this.props.search.class;
    const model = clone(filter);
    const display = {all: 'все', created: 'новые', updated: 'измененные'};

    model.class = objClass;
    if(dispMode === 'created') {
      model.date_create_min = this.props.period;
    }
    if(dispMode === 'updated') {
      model.date_update_min = this.props.period;
    }
    const searchUrl = generateSearchUrl(
      model,
      `${this.state.searchUrls[objClass]}?`,
      true
    );

    const filterDesc = getFilterDesc(model, colls, currency);
    const filterDescShort =
      `${filterDesc.slice(0, 120)}${filterDesc.length > 120 ? '...' : ''}`;
    const filterTooltip = (
      <Tooltip id='filter-description'>
        <div>{filterDesc}</div>
      </Tooltip>
    );

    const dispModeSelector = map(display, (item, key) => {
      const count = this.state[key] > -1 ? `(${this.state[key]})` : '';

      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': dispMode === key})
          }
          data-display={key}
          onClick={this.onDispModeChange.bind(this)}>
          <span>{item}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {count}
          </span>
        </Button>
      );
    });
    const curCount = this.state[dispMode];
    let allOfferDecl;

    switch(dispMode) {
    case 'created' :
      allOfferDecl = declOfNum(
        curCount,
        ['новый объект', 'новых объекта', 'новых объектов']
      );
      break;
    case 'updated' :
      allOfferDecl = declOfNum(
        curCount,
        ['измененный объект', 'измененных объекта', 'измененных объектов']
      );
      break;
    default :
      allOfferDecl = declOfNum(
        curCount,
        ['объект', 'объекта', 'объектов']
      );
      break;
    }
    const allOffers = curCount > 2 ?
      <span>Показать все <b>{curCount} {allOfferDecl} недвижимости</b></span> :
      false;

    let objBlock = map(objects, (item, key) => {
      return (
        <LKSearchItemObject
          key={key}
          object={item}
          class={this.props.search.class} />
      );
    });

    objBlock = size(objBlock) > 0 ?
      createFragment({objBlock: objBlock}) :
      createFragment({
        objBlock:
          <div className='notFound'>
            <p>Объектов не найдено</p>
          </div>
      });

    return(
      <div className='lkbody-searches-item'>
        <div className='lkbody-searches-item-title'>
          <i className='fa fa-search'/>
          <Button
            onClick={this.toggleShow.bind(this)}>
              <span>{name}</span>&nbsp;
              <i className='fa fa-caret-down' />
          </Button>
          {show ?
            <div className='lk-popup'>
              <Row>
                <Button
                  active={notifications_email ? true : null} // eslint-disable-line camelcase
                  onClick={this.toggleNotifyEmail.bind(this)}
                  data-id={id}>
                  <i
                    className={classNames(
                      'fa',
                      notifications_email ? 'fa-check-square-o' : 'fa-square-o' // eslint-disable-line camelcase
                    )}
                  />
                  <span>&nbsp;Подписка на E-Mail</span>
                </Button>
                <Button
                  active={notifications ? true : null}
                  onClick={this.toggleNotify.bind(this)}
                  data-id={id}>
                  <i
                    className={classNames(
                      'fa',
                      notifications ? 'fa-check-square-o' : 'fa-square-o' // eslint-disable-line camelcase
                    )}
                  />
                  <span>&nbsp;Уведомления</span>
                </Button>
                <Button onClick={this.deleteSearch.bind(this)} data-id={id}>
                  <i className = 'fa fa-trash' />
                  <span>&nbsp;Удалить</span>
                </Button>
              </Row>
            </div> : null
          }
        </div>
        <div className='lkbody-searches-item-descr'>
          <OverlayTrigger
            overlay={filterTooltip}
            placement='bottom'
            delayShow={300}
            delayHide={1000}>
            <span>{filterDescShort}</span>
          </OverlayTrigger>
        </div>
        <Row>
          <Col xs={12} className='lkbody-typeselector compact'>
            <ButtonGroup>
              {dispModeSelector}
            </ButtonGroup>
          </Col>
        </Row>
        <Row className='lkbody-searches-item-obj-container'>
          {objBlock}
        </Row>
        {allOffers ?
          (<div className='show-link'>
            <div>+</div>
            <a href={searchUrl} target='_blank'>{allOffers}</a>
          </div>) : <div className='show-link' />}
      </div>
    );
  }
}

export default LKSearchItem;
