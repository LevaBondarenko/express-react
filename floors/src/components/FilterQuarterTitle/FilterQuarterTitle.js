/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars


/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';
import FilterQuarterRooms from './FilterQuarterRooms';
import FilterQuarterPrice from './FilterQuarterPrice';
import FilterQuarterSquare from './FilterQuarterSquare';
import PriceUnit from '../../shared/PriceUnit';
import withCondition from '../../decorators/withCondition';
import {filter} from 'lodash';

@withCondition()
class FilterQuarterTitle extends Component {

  static propTypes = {
    favorites: PropTypes.string,
    dataUrl: PropTypes.array
  };

  constructor(props) {
    super(props);

    /* global data */
    this.state = {
      object: data.object.info || {},
      flat: FilterQuarterStore.myFlat,
      model: FilterQuarterStore.getModel()
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    FilterQuarterStore.onChange(this.onChange);

    if(this.props.dataUrl) {
      const model = FilterQuarterStore.getModel();
      let priceMin, priceMax, squareMin, squareMax;

      filter(this.props.dataUrl, item => {
        const value = Object.values(item);
        const key = Object.keys(item).toString();

        switch (key) {
        case 'rooms':
          if (value[0] === '%3E4') {
            model.rooms.unshift('4');
          }else {
            model.rooms.unshift(value.toString());
          }

          break;
        case 'price_min':
          priceMin = parseInt(value);
          break;
        case 'price_max':
          priceMax = parseInt(value);
          break;
        case 'square_min':
          squareMin = parseInt(value);
          break;
        case 'square_max':
          squareMax = parseInt(value);
          break;
        default: null;
        }
      });


      this.setState(() => ({
        model: model,
        priceMin: priceMin,
        priceMax: priceMax,
        squareMin: squareMin,
        squareMax: squareMax
      }));
    }
  }

  onChange() {
    this.setState(() => ({
      flat: FilterQuarterStore.myFlat,
      model: FilterQuarterStore.getModel()
    }));
  }

  render() {
    const state = this.state;
    const quarterDate = FilterQuarterStore.myHouse.deadline_q;
    const yearDate = FilterQuarterStore.myHouse.deadline_y;
    const countFlats = state.model.count;
    let deadlineTitle;


    if (quarterDate && yearDate && quarterDate !== '0') {
      deadlineTitle = `Срок сдачи: ${quarterDate} кв. ${yearDate}`;
    } else if(!quarterDate || quarterDate === '0' && yearDate) {
      deadlineTitle = `Срок сдачи: ${yearDate} г.`;
    }

    return (
        <div className="nh-flat-title">
          <div className="nh-flat-header">Выбрать квартиру</div>
          <div className="nh-flat-title-items">
            <div className="nh-flat-title-item">
              <div className="nh-flat-title-itemtitle">
                <b>
                  {(state.object.info.deadline === '1' ?
                    'Дом сдан' : deadlineTitle)}
                </b>
              </div>
              <div className="nh-flat-title-count">
                Подходящих квартир:&nbsp;
                <span className="red">{countFlats}</span>
              </div>
            </div>
            <div className="nh-flat-title-item">
              <div className="nh-flat-title-itemtitle">
                <b>
                  Количество комнат
                </b>
              </div>
              <div className="nh-flat-title-roomsbuttons">
                <FilterQuarterRooms
                  dataModel={state.model.rooms}/>
              </div>
            </div>
            <div className="nh-flat-title-item">
              <div className="nh-flat-title-itemtitle">
                <b>
                  Площадь квартиры, м²
                </b>
              </div>
              <div className="nh-flat-title-price">
                {
                  state.model.squareInterval.length ? (
                    <FilterQuarterSquare dataModel={state.model}
                      squareMin={state.squareMin}
                      squareMax={state.squareMax}/>
                  ) : null
                }
              </div>
            </div>
            <div className="nh-flat-title-item">
              <div className="nh-flat-title-itemtitle">
                <b>
                  Стоимость, <PriceUnit />
                </b>
              </div>
              <div className="nh-flat-title-price">
                {
                  state.model.priceInterval.length ? (
                    <FilterQuarterPrice dataModel={state.model}
                      priceMin={state.priceMin}
                      priceMax={state.priceMax}/>
                  ) : null
                }
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default FilterQuarterTitle;
