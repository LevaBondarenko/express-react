/**
 * ShowCaseTicketCount widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import {
  declOfNum, generateMortgageUrl, capitalizeString
} from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import s from './ShowCaseTicketCountOpt.scss';
import UAgregator from '../UAgregator';
import {size, omitBy} from 'lodash';
import request from 'superagent';
import shallowCompare from 'react-addons-shallow-compare';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {massUpdateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class ShowCaseTicketCountOpt extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    option: PropTypes.string,
    deviationHi: PropTypes.string,
    deviationLow: PropTypes.string,
    mainText: PropTypes.string,
    gparams: PropTypes.array,
    params: PropTypes.object,
    functions: PropTypes.array,
    showPrice: PropTypes.bool,
    actions: PropTypes.object,
    demandShowCase: PropTypes.object
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = this.processProps(props);

    this.updateKeys = [
      'city_id',
      'price_from',
      'price_to',
      'house',
      'street_id',
      'district_id',
      'rooms',
      'square',
      'floor',
      'hideDistricts'
    ];
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.processProps(nextProps));
  }

  processProps = (props) => {
    const obj = props.demandShowCase;
    const modelField = `alt${capitalizeString(this.props.option)}Count`;
    const {itemsOption} = obj;

    //если виджет отображается, то получаем для него данные
    if (obj.showStats && this.state.needUpdate !== obj.needAltUpdate) {
      this.getShowCaseData(
        this.props.option,
        this.props.deviationHi,
        this.props.deviationLow
      );
    }
    return {
      show: obj.showStats === '1',
      active: itemsOption && obj.showTicketsTable ?
        itemsOption.toLowerCase().indexOf(this.props.option) !== -1 : false,
      count: obj[modelField],
      needUpdate: obj.needAltUpdate
    };
  }

  componentWillUnmount() {
    this.removeCss();
  }

  getShowCaseData(option, deviationHi, deviationLow) {
    const model = this.props.demandShowCase;
    const modelField = `alt${capitalizeString(option)}Count`;
    const modelFieldItems = `alt${capitalizeString(option)}Items`;
    const params = omitBy(model, (item, key) => {
      return item === undefined || item === null ||
        this.updateKeys.indexOf(key) < 0;
    });

    switch(option) {
    case 'districts':
      params['district_id'] = model.nearby_districts || [];
      break;
    case 'price':
      const oldPriceFrom = params[`${option}_from`] ?
        parseInt(params[`${option}_from`]) : parseInt(params[`${option}`]);
      const oldPriceTo = params[`${option}_to`] ?
        parseInt(params[`${option}_to`]) : parseInt(params[`${option}_to`]);

      params[`${option}_from`] = oldPriceFrom +
        oldPriceFrom * deviationLow / 100;
      params[`${option}_to`] = oldPriceTo +
        oldPriceTo * deviationHi / 100;
      params['square_to'] = '';
      params['square_from'] = '';
      params.square = '';
      break;
    case 'square':
      const oldSquareFrom = params[`${option}_from`] ?
        parseInt(params[`${option}_from`]) : parseInt(params[`${option}`]);
      const oldSquareTo = params[`${option}_to`] ?
        parseInt(params[`${option}_to`]) : parseInt(params[`${option}`]);

      params[`${option}_from`] = oldSquareFrom +
        oldSquareFrom * deviationLow / 100;
      params[`${option}_to`] = oldSquareTo +
        oldSquareTo * deviationHi / 100;
      params['price_to'] = '';
      params['price_from'] = '';
      params.price = '';
      break;
    default:
    // nothing
      break;
    }

    if (model.doNotUseSquare) {
      params['square_from'] = '';
      params['square_to'] = '';
      params.square = '';
    }

    /* global data */
    params.city_id = params && size(params.city_id) ? // eslint-disable-line
      params.city_id : data.options.cityId; // eslint-disable-line
    params.action = 'demand_showcase';
    params.limit = '1000';

    // если пользователь уточняет район, то убираем из запроса улицу и номер дома
    if (params.district_id) {
      params.street_id = ''; // eslint-disable-line
      params.house = '';
    }

    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if (res.body.success) {
          const {count, house_found: houseFound, data} = res.body;
          const newModel = {};

          newModel[modelField] = houseFound || houseFound === undefined ?
            parseInt(count) : 0;
          newModel[
            `alt${capitalizeString(option)}Min`
          ] = params[`${option}_from`];
          newModel[
            `alt${capitalizeString(option)}Max`
          ] = params[`${option}_to`];
          newModel[modelFieldItems] = data;
          newModel.triggerCalc = false;

          this.props.actions.massUpdateInObjectsState(
            ['demandShowCase'], newModel);
        }
      });
  }

  showTicketsTable = (event) => {
    event.preventDefault();

    const wrapper = $(`.${this.props.option}Opt`);
    const paramsToSet = {};

    paramsToSet.itemsOption = `alt${capitalizeString(this.props.option)}Items`;
    paramsToSet.checked = [];
    paramsToSet.anglePos = wrapper.position().left + 100;
    paramsToSet.showTicketsTable = true;

    this.props.actions.massUpdateInObjectsState(
      ['demandShowCase'], paramsToSet);

    $('html, body').animate({
      scrollTop: $('.demandShowCaseBg').offset().top - 400
    }, 700);
  }

  render() {
    const obj = this.props.demandShowCase;

    if (!this.state.show || (this.state.count - obj.count) <= 0) {
      return null;
    }

    const priceFrom = obj.altPriceMin ? obj.altPriceMin : obj.price_from;
    const priceTo = obj.altPriceMax ? obj.altPriceMax : obj.price_to;
    const {price} = obj;

    const priceText = priceFrom && priceTo && priceFrom !== priceTo ? (
      <span className={s.bold}>
        <Price price={priceFrom}> <PriceUnit /></Price> -&nbsp;
        <Price price={priceTo}>&nbsp;
          <PriceUnit /></Price>
      </span>
    ) : priceFrom === priceTo ? (
      <span className={s.bold}>
        <Price price={priceFrom}>
          <PriceUnit />
        </Price>
      </span>) :
      price ? (
        <span className={s.bold}>
          <Price price={priceFrom}>
            <PriceUnit />
          </Price>
        </span>) : null;

    let diffCount;

    if (this.props.option !== 'districts') {
      diffCount = this.state.count - obj.count > 0 ?
              this.state.count - obj.count : '';
    } else {
      diffCount = this.state.count;
    }

    return (
      <div className={this.state.active ? `${s.root} ${s.active}` : s.root}>
        <div className={s.count}>
          <div className={s.countNum}>
            {diffCount}
          </div>
          <div className={s.countText}>
            {declOfNum(diffCount,
              ['наш клиент', 'наших клиента', 'наших клиентов'])}
          </div>
        </div>
        <div className={s.text}>
        {this.state.show ? (
            <UAgregator
              text={this.props.mainText}
              gparams={this.props.gparams}
              params={this.props.params}
              functions={this.props.functions}
              context={this.props.context}
            />
          ) : null}
          {this.props.showPrice ? priceText : null}
        </div>
        <div className={s.link}>
          <a href="#" onClick={this.showTicketsTable}>
            Показать покупателей
          </a>
        </div>
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({massUpdateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    demandShowCase: state.objects.get('demandShowCase').toJS() || null
  };
}

ShowCaseTicketCountOpt =
  connect(mapStateToProps, mapDispatchToProps)(ShowCaseTicketCountOpt);
ShowCaseTicketCountOpt = withCondition()(ShowCaseTicketCountOpt);

export default ShowCaseTicketCountOpt;
