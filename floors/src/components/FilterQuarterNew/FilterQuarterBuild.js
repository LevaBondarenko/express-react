/**
 * Created by tatarchuk on 22.05.15.
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';

import Helpers from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';

import FilterQuarterSquares from './FilterQuarterSquares';
import Flat from './Flat';
import {connect} from 'react-redux';

class FilterQuarterBuild extends Component {

  static propTypes = {
    typeBuild: React.PropTypes.string,
    count: React.PropTypes.number,
    handleScroll: React.PropTypes.func,
    autoLayoutSwitch: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string
    ]),
    chosenFlat: React.PropTypes.object,
    currency: React.PropTypes.object,
    sectionElement: React.PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  // экспериментально
  shouldComponentUpdate(nextProps) {
    if ((nextProps.typeBuild === this.props.typeBuild) &&
      (nextProps.count === this.props.count) &&
      // (nextState.currency.course === this.state.currency.course) &&
      (nextProps.currency.symbol === this.props.currency.symbol) &&
      (nextProps.chosenFlat.floor === this.props.chosenFlat.floor &&
      nextProps.chosenFlat.on_floor === this.props.chosenFlat.on_floor &&
      nextProps.chosenFlat.section === this.props.chosenFlat.section)) {
      return false;
    } else {
      return true;
    }
  }

  startScroll = (data) => {
     //скроллим до нужной квартиры, если нужно
    if (data) {
      const section = document.getElementById(`${data.getAttribute('id')}`);
      const viewPort =  document.getElementsByClassName('build-list')[0];

      section.scrollIntoView();
      window.scrollTo(0, viewPort.getBoundingClientRect().top);

      this.startScroll = () => {}; // используем только один раз
    }
  }

  render() {
    const dataBuild = FilterQuarterStore.myHouse;
    const dataBuildFilter = FilterQuarterStore.filterHouse;
    const {currency} = this.props;
    const course = currency.nominal / currency.value;
    const unit = currency.symbol;
    let chess1, chess2;
    const {autoLayoutSwitch,sectionElement} = this.props;

    this.startScroll(sectionElement);

    const chess = map(dataBuild.sections, (section, key) => {
      let maxFloor = dataBuild.floors;
      let maxFloorReal = 0;
      const arrFloors = [];
      const arrFlats = [];
      let maxFlat = 0;

      if (maxFloor > 30) {
        maxFloor = 30;
      }
      arrFloors[maxFloor] = 0;
      map(section.floors, (floor, keyFloor) => {
        arrFloors[keyFloor] = 1;
        map(floor.flats, (flat, keyFlat) => {
          arrFlats[keyFlat] = 1;
          if (maxFloorReal < parseInt(keyFloor)) {
            maxFloorReal = parseInt(keyFloor);
          }
        });
      });

      const lengthArrFlats = arrFlats.length - 1;
      const lengthArrFloors = arrFloors.length - 1;

      maxFlat = (maxFlat < lengthArrFlats) ? lengthArrFlats : maxFlat;
      maxFloor = (+maxFloor === 30) ? maxFloorReal : lengthArrFloors;

      chess2 = map(arrFloors, (floor, key2) => {
        const curFloor = maxFloor - key2;
        const arrFlat = [];

        arrFlat[maxFlat] = 0;

        if (arrFloors[curFloor] === 1) {

          map(section.floors[curFloor].flats, (flat, key3) => {
            arrFlat[key3] = 1;
          });

          chess1 = map(arrFlat, (num, keyArr) => {

            if (keyArr === 0) {
              const curFlatFloor = parseInt(FilterQuarterStore.myFlat.floor);
              const curSection = parseInt(FilterQuarterStore.myFlat.section);

              return (<th
                className={curFlatFloor === parseInt(curFloor) &&
                parseInt(key) === curSection ?
                  'active' : ''}
                key={keyArr}>{curFloor}
              </th>);
            }

            let classFlat = '';

            if (num === 1) {
              const {
                demo_description: flatDemo,
                rooms: flatRoom,
                dolshik: flatDolshik,
                square: flatSquare,
                price: flatPrice,
                'layout_floor': layout
                } = section.floors[curFloor].flats[keyArr];
              let flatPriceDiscount = section
                .floors[curFloor]
                .flats[keyArr]['price_discount'];
              let flatPriceMeter = section
                .floors[curFloor]
                .flats[keyArr]['price_metr'];
              const dateReservation = section
                .floors[curFloor]
                .flats[keyArr]['date_reservation'];

              let flatPriceDisc;
              let flatOldPrice;
              let flatNewPrice;
              const sale = flatPrice - flatPriceDiscount;

              const titleFlatTooltip =
                (+flatRoom === 1) ? 'Однокомнатная квартира' :
                  (+flatRoom === 2) ? 'Двухкомнатная квартира' :
                    (+flatRoom === 3) ? 'Трехкомнатная квартира' :
                      (flatRoom > 3) ? 'Многокомнатная квартира' :
                        'Квартира';

              if (dataBuildFilter.sections[key].floors[curFloor]
                  .flats[keyArr] !== undefined) {
                if (flatPrice > flatPriceDiscount) {
                  flatOldPrice = (
                    <p>Старая цена:&nbsp;
                      <Price price={flatPrice}> <PriceUnit/></Price>
                    </p>
                  );
                  flatPriceDisc = (
                    <p>Скидка:&nbsp;
                      <Price price={sale}> <PriceUnit/></Price>
                    </p>
                  );
                  flatNewPrice = (
                    <p>
                      <b>Стоимость:&nbsp;
                        <Price price={flatPriceDiscount}> <PriceUnit/></Price>
                      </b>
                    </p>
                  );
                  classFlat += ' sale2';
                } else {
                  flatPriceDisc = <span />;
                  flatOldPrice = (
                    <p><b>Стоимость:&nbsp;
                      <Price price={flatPrice}> <PriceUnit/></Price>
                    </b></p>
                  );
                  flatNewPrice = <span />;
                  classFlat += ' sale';
                }
              } else {
                if (flatPrice > flatPriceDiscount) {
                  flatOldPrice = (
                    <p>Старая цена:&nbsp;
                      <Price price={flatPrice}> <PriceUnit/></Price>
                    </p>
                  );
                  flatPriceDisc = (
                    <p>
                      Скидка:&nbsp;<Price price={sale}> <PriceUnit/></Price>
                    </p>
                  );
                  flatNewPrice = (
                    <p>
                      <b>Стоимость:&nbsp;
                        <Price price={flatPriceDiscount}> <PriceUnit/></Price>
                      </b>
                    </p>
                  );
                  classFlat += ' dole';
                } else {
                  flatPriceDisc = <span />;
                  flatOldPrice = (
                    <p><b>Стоимость:&nbsp;
                      <Price price={flatPrice}> <PriceUnit/></Price>
                    </b></p>
                  );
                  flatNewPrice = <span />;
                  classFlat += ' dole';
                }
              }

              let strTd;


              if (flatDemo) {
                classFlat += ' demo';
              } else if (+flatRoom === 1) {
                classFlat += ' firstRoom';
              } else if (+flatRoom === 2) {
                classFlat += ' secondRoom';
              } else if (+flatRoom === 3) {
                classFlat += ' thirdRoom';
              } else if (flatRoom > 3) {
                classFlat += ' pluralRooms';
              }
              if (flatDolshik === 1) {
                classFlat += ' dolshik';
              }
              if (FilterQuarterStore.typeBuild === '0') {
                strTd = `${flatRoom}к`;
              } else if (FilterQuarterStore.typeBuild === '1') {
                classFlat += ' widthAuto';
                let kilos = '';

                flatPriceDiscount = (flatPriceDiscount * course).toFixed(0);
                if(flatPriceDiscount >= 100000) {
                  flatPriceDiscount = flatPriceDiscount / 1000;
                  kilos = 'т.';
                }
                flatPriceDiscount = Math.round(flatPriceDiscount);
                strTd = `${Helpers.priceFormatter(flatPriceDiscount)} ${kilos}${unit}`; //eslint-disable-line max-len
              } else if (FilterQuarterStore.typeBuild === '2') {
                classFlat += ' widthAuto';
                let kilos = '';

                flatPriceMeter = flatPriceMeter * course;
                if(flatPriceMeter >= 100000) {
                  flatPriceMeter = flatPriceMeter / 1000;
                  kilos = 'т.';
                }
                flatPriceMeter = Math.round(flatPriceMeter);
                strTd = `${Helpers.priceFormatter(flatPriceMeter)} ${kilos}${unit}/м\u00B2`; //eslint-disable-line max-len
              }

              const flatCur = section
                .floors[curFloor]
                .flats[keyArr];

              return (
                <Flat
                  key={`cell_${keyArr}`}
                  keyArr={keyArr}
                  titleFlatTooltip={titleFlatTooltip}
                  flatSquare={flatSquare}
                  flatOldPrice={flatOldPrice}
                  flatPriceDisc={flatPriceDisc}
                  flatNewPrice={flatNewPrice}
                  classFlat={classFlat}
                  keySection={key}
                  flatCur={flatCur}
                  curFloor={curFloor}
                  layout={layout}
                  strTd={strTd}
                  dateReservation={dateReservation}
                  autoLayoutSwitch={autoLayoutSwitch}/>
              );
            } else if (parseInt(key) !== 0) {
              if (FilterQuarterStore.typeBuild > 0) {
                classFlat = ' sold sold2 widthAuto';
              } else {
                classFlat = ' sold';
              }
              return (
                <td key={keyArr}>
                  <div className={classFlat}></div>
                </td>
              );
            }
          });

          return (
            <tr key={key2}>
              {chess1}
            </tr>
          );
        } else if (key2 === +maxFloor || key2 < 0 || curFloor < 0) {
          return (false);
        } else {
          chess1 = map(arrFlat, (num, keyArr) => {
            if (keyArr === 0) {
              return (
                <th key={keyArr}>{curFloor}</th>
              );
            }
            let classFlat;

            if (FilterQuarterStore.typeBuild > 0) {
              classFlat = ' sold sold2 widthAuto';
            } else {
              classFlat = ' sold';
            }
            return (
              <td key={keyArr}>
                <div className={classFlat}></div>
              </td>
            );
          });

          return (
            <tr key={key2}>
              {chess1}
            </tr>
          );
        }

      });
      const classBuild = 'build';
      const podyezd = parseInt(key) !== 0 ?
        `${key.toString()} подъезд` : 'Подъезд не определен';

      return (
        <div className={classBuild} id={`section_${key}`} key={key}>
          <strong className="xxx">{podyezd}</strong>
          <table className="quarter-table">
            <FilterQuarterSquares section={section}
                                  maxFlat={maxFlat}
                                  key={key}
                                  typeBuild={FilterQuarterStore.typeBuild}
                                  sectionNum={key}
            />
            <tbody>{chess2}</tbody>
          </table>
        </div>
      );
    });

    return (
      <div className="build-list" role="toolbar"
           onScroll={this.props.handleScroll}>
        <div className="build-list-block">{chess}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current,
  };
}

export default connect(mapStateToProps)(FilterQuarterBuild);
