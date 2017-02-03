/**
 * ShowCaseActionButton widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import request from 'superagent';
import api from '../../api/apiLK';
import s from './ShowCaseActionButton.scss';
import {omitBy, extend} from 'lodash';
import withCondition from '../../decorators/withCondition';
import {generateSearchUrl} from '../../utils/Helpers';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState, massUpdateInObjectsState, getShowCaseData}
  from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class ShowCaseActionButton extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    title: PropTypes.string,
    countProperty: PropTypes.string,
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
      'hideDistricts',
      'doNotUseSquare',
      'needAltUpdate'
    ];
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.processProps(nextProps));
  }

  processProps = props => {
    const obj = props.demandShowCase;

    return obj ? {
      disabled: !(obj.rooms &&
        (obj.price || (obj.price_from && obj.price_to)) &&
        (obj.square || (obj.square_from && obj.square_to)) &&
          obj.house && obj.street_id)
    } : {
      disabled: false
    };
  }

  onHover = () => {
    this.setState(() => ({
      showHint: true
    }));
  }

  showStats = (event) => {
    event.preventDefault();

    const obj = this.props.demandShowCase;
    const params = omitBy(obj, (item, key) => {
      return item === undefined || item === null ||
        this.updateKeys.indexOf(key) < 0;
    });

    this.props.actions.getShowCaseData(params, obj.collections, () => {
      // получаем расчет рыночной стоимости
      const data = this.props.demandShowCase;

      this.getPrice(data)
        .then(response => {
          const upBound = response.sell.up_bound ?
            (response.sell.up_bound * 1000).toString() :
            data.price_to.toString();
          const loBound = response.sell.low_bound ?
            (response.sell.low_bound * 1000).toString() :
            data.price_from.toString();

          this.props.actions.massUpdateInObjectsState(
            ['demandShowCase'], {
              sell: response.sell,
              avgPriceLoading: false,
              up: upBound,
              lo: loBound,
            });

          this.getObjCounts(loBound, upBound);

        }, () => {
          const upBound = data.price_to.toString();
          const loBound = data.price_from.toString();

          this.props.actions.massUpdateInObjectsState(
            ['demandShowCase'], {
              sell: `Извините, но система не может автоматически оценить Ваш
                объект, так как выборка аналогов слишком мала.`,
              avgPriceLoading: false,
              up: upBound,
              lo: loBound,
            });

          this.getObjCounts(loBound, upBound);
        });
    });
  }

  getPrice(obj) {
    const data = extend(obj.houseData, {
      'action': 'user_get_analitic_prices',
      'city_id': obj.city_id,
      'district_id': obj.district_id,
      'area_total': obj.square,
      'rooms_cnt': obj.rooms,
      'floor_num': obj.floor || 5,
      'type': 'flat',
      'keep': 'cosmetic',
      'furniture': 'well'
    });

    return api.getPrice(data);
  }

  getObjectCount(params = null) {
    return new Promise((resolve) => {
      params.action = 'modular_search';
      params.subAction = 'count';

      const uri = generateSearchUrl(params, '/msearcher_ajax.php?');

      request
        .get(uri)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        })
        .end((err, res) => {
          if (!err && res.body.ok) {
            resolve(res.body.count);
          }
        });
    });
  }

  getObjCounts(loBound, upBound) {
    const cityId = this.props.demandShowCase.city_id.toString();

    // получаем данные для слайдера
    this.getObjectCount({
      class: 'nh_flats',
      'price_min': loBound,
      'price_max': upBound,
      'city_id': cityId
    }).then(count => {
      this.props.actions.updateInObjectsState(
        ['demandShowCase', 'nhCount'], () => count);
    });

    this.getObjectCount({
      class: 'cottages',
      'price_min': loBound,
      'price_max': upBound,
      'city_id': cityId
    }).then(count => {
      this.props.actions.updateInObjectsState(
        ['demandShowCase', 'cottagesCount'], () => count);
    });

    this.getObjectCount({
      class: 'flats',
      'price_min': loBound,
      'price_max': upBound,
      'city_id': cityId
    }).then(count => {
      this.props.actions.updateInObjectsState(
        ['demandShowCase', 'realtyCount'], () => count);
    });

    const showMainTable = document.getElementById('showMainTable');

    if (showMainTable) {
      const style = window.getComputedStyle(showMainTable);

      if (style.display !== 'none') {
        showMainTable.click();
      }
    }
  }

  render() {
    const tooltip = 'Заполните параметры вашей квартиры';
    const {disabled} = this.state;

    return (
      <div className={s.root}>
        <button
          disabled={disabled}
          onMouseEnter={this.onHover}
          onClick={this.showStats}>
          {this.props.title}
        </button>
        {this.state.showHint && disabled ? (
          <div className={s.hint}>{tooltip}</div>
        ) : null}
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateInObjectsState, massUpdateInObjectsState,
      getShowCaseData},
      dispatch)
  };
}

function mapStateToProps(state) {
  return {
    demandShowCase: state.objects.get('demandShowCase').toJS() || null
  };
}

ShowCaseActionButton =
  connect(mapStateToProps, mapDispatchToProps)(ShowCaseActionButton);
ShowCaseActionButton = withCondition()(ShowCaseActionButton);

export default ShowCaseActionButton;
