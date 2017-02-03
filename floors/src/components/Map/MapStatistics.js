/**
 * Map widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, head, filter, each, min, isArray} from 'lodash';

import {generateSearchUrl, priceFormatter} from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import shallowCompare from 'react-addons-shallow-compare';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';

class MapStatistics extends Component {
  static propTypes = {
    districtsStat: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      data: props.districtsStat,
      selectedData: [],
      collection: [],
      model: ''
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    const modelCitiesIds = mss.get('city_id');
    const modelCityId = isArray(modelCitiesIds) ? modelCitiesIds :
      [modelCitiesIds];
    const citiesIds = modelCitiesIds ? modelCityId :
      [wss.get('selectedCity').city_id];
    const args = {
      'action': 'get_districts_stat',
      'city': citiesIds
    };

    $.ajax({
      url: '/backend/?cache=true',
      type: 'POST',
      data: args,
      dataType: 'json'
    })
    .done((data) => {
      this.setState(() => ({
        collection: mss.get('collections').district_id,
        selectedData: mss.get('district_id'),
        model: mss.get(),
        data: data
      }));
    });
  }

  handleSubmit = () => {
    window.location = generateSearchUrl(this.state.model, '/zastr/search?');
  }

  render() {
    const {selectedData, collection, data} = this.state;
    const props = this.props;
    let stats = {
      flatsCount: 0,
      minPrice: '',
      midPriceSqrt: 0
    };
    let component, name;

    if (size(selectedData) > 0) {
      name = `Выбранные районы (${size(selectedData)})`;
      if (size(selectedData) === 1) {
        const itemId = parseInt(head(selectedData));
        const itemObject = head(filter(collection, {id: itemId}));

        name = itemObject.name;
        stats = data[itemId];
      } else {
        each(selectedData, district => {
          let flatsCount = data[district] ?
            parseInt(data[district].flatsCount) : 0;
          let midPriceSqrt = data[district] ?
            parseInt(data[district].midPriceSqrt) : 0;
          const minPriceDistr = data[district] ?
            parseInt(data[district].minPrice) : 0;
          const minPrice = data[district] ?
            parseInt(stats.minPrice) : 0;

          flatsCount = flatsCount + stats.flatsCount;
          midPriceSqrt = midPriceSqrt + stats.midPriceSqrt;

          stats = {
            minPrice: stats.minPrice,
            flatsCount: flatsCount,
            midPriceSqrt: midPriceSqrt
          };

          if(minPrice > 0 && minPriceDistr > 0) {
            stats.minPrice = min([minPrice, minPriceDistr]);
          } else {
            stats.minPrice = minPriceDistr;
          }

        });
        stats.midPriceSqrt =
          (parseInt(stats.midPriceSqrt) / size(selectedData));
      }

      const midPriceSqrtFormat =
        <Price price={Math.round(stats.midPriceSqrt)}> <PriceUnit/></Price>;

      component = (
          <div className="mainMapWidget--statistics">
            <div>
                <div className="mainMapWidget--statistics__head">
                  <h3>{name}</h3>
                </div>
                <div className="mainMapWidget--statistics__content">
                    <p>Квартир:
                      <b> {priceFormatter(stats.flatsCount)}</b>
                    </p>
                    <p>Стоимость от:
                      <b> <Price price={stats.minPrice}>
                        &nbsp;<PriceUnit/>
                      </Price></b>
                    </p>
                    <p>Средняя цена за м<sup>2</sup>:
                      <b> {midPriceSqrtFormat}</b>
                    </p>

                    <a href="#"
                       className="mainMapWidget--statistics__content--green"
                       onClick={this.handleSubmit}>
                      Посмотреть все ЖК в {(size(selectedData) === 1 ?
                      'этом районе' : 'этих районах')}
                    </a>
                </div>
              </div>
            </div>
        );
    } else {
      name = `Новостройки в г. ${props.cityName}`;
      each(collection, district => {

        const flatsCount = data[district.id] ?
          data[district.id].flatsCount : 0;
        const midPriceSqrt = data[district.id] ?
          data[district.id].midPriceSqrt : 0;

        stats = {
          minPrice: stats.minPrice,
          flatsCount: stats.flatsCount + parseInt(flatsCount),
          midPriceSqrt: stats.midPriceSqrt + parseInt(midPriceSqrt)
        };
        const minPrice = parseInt(stats.minPrice);
        const minPriceDistr = data[district.id] ?
          parseInt(data[district.id].minPrice) : 0;

        if(minPrice > 0 && minPriceDistr > 0) {
          stats.minPrice = min([minPrice, minPriceDistr]);
        } else {
          stats.minPrice = minPriceDistr;
        }

      });
      stats.midPriceSqrt =
        (parseInt(stats.midPriceSqrt) / size(collection));

      const midPriceSqrtFormat =
        <Price price={Math.round(stats.midPriceSqrt)}> <PriceUnit/></Price>;

      component = (
          <div className="mainMapWidget--statistics">
            <div>
                <div className="mainMapWidget--statistics__head">
                  <h3>{name}</h3>
                </div>
                <div className="mainMapWidget--statistics__content">
                    <p> Квартир:
                      <b> {priceFormatter(stats.flatsCount)}</b>
                    </p>
                    <p> Стоимость от:
                      <b> <Price price={stats.minPrice}>
                        &nbsp;<PriceUnit/>
                      </Price></b>
                    </p>
                    <p> Средняя цена за м<sup>2</sup>:
                      <b> {midPriceSqrtFormat}</b>
                    </p>
                    <a href="#"
                       className="mainMapWidget--statistics__content--green"
                       onClick={this.handleSubmit}> Посмотреть все ЖК </a>
                    <p className="mainMapWidget--statistics__content--help">
                      <span>
                        Выберите районы на карте или в списке для просмотра
                        аналитической информации
                      </span>
                    </p>
                </div>
              </div>
            </div>
        );
    }
    return (
      <div>{component}</div>
    );
  }
}

export default MapStatistics;
