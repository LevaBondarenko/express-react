import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

import Helpers from '../../utils/Helpers';
import s from './Flat.scss';
/**
 * React/Flux entities
 */
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import FilterQuarterStore from '../../stores/FilterQuarterStore';
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';
import {setNhObjectPrice} from '../../utils/mortgageHelpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import request from 'superagent';
import ga from '../../utils/ga';

class Flat extends Component {

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      comission: {
        comission: null
      }
    };

  }

  componentDidMount() {
    this.removeCss = s._insertCss();
    FilterQuarterStore.onChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      comission: FilterQuarterStore.comission,
      thisHoverComission: NaN
    }));
  }

  componentWillUnmount() {
    this.removeCss();
  }



  handleSelectItem(event) {
    event.preventDefault();
    const {autoLayoutSwitch} = this.props;
    const {section, floor, flat, layout} = event.target.dataset,
      dataFlat = FilterQuarterStore
        .myHouse
        .sections[section]
        .floors[floor]
        .flats[flat];
    const el = document.getElementById(`c_${dataFlat.id}`).parentNode;

    clearTimeout(this.timeout);

    el.className = Helpers.addClass(el.className, 'active');
    this.getComission(dataFlat)
      .then(() => {
        FilterQuarterActions.setFlat(dataFlat, layout);
        autoLayoutSwitch && FilterQuarterActions.layoutClick('0');
        FilterQuarterActions.setComission(dataFlat);
        this.getHoverComission(dataFlat);
        // если на странице есть калькулятор ипотеки,
        // то при клике на квартиру в шахматке нужно менять значения в калькуляторе
        setNhObjectPrice(dataFlat, FilterQuarterStore, wss, WidgetsActions);
      });
  }

  trackHome = () => {
    ga('button', 'zastr_Vybor_kvartiry_v_dome');
  }

  async getComission(dataFlat) {
    return new Promise(resolve => {
      if (!dataFlat.comission && dataFlat.comission !== 0) {
        const dataArr = {
          'action': 'get_comission',
          'id': dataFlat.id,
          'class': dataFlat.class
        };
        const uri = Helpers.generateSearchUrl(dataArr, '/backend/?');

        request
          .get(uri)
          .set({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'public, max-age=21600'
          }).end((err, res) => {
            if (res.body) {
              dataFlat.comission = res.body[0] ? (
                res.body[0].comission ?
                  res.body[0].comission : 0
              ) : '';
              resolve();
            }
          });
      } else {
        resolve();
      }
    });
  }

  handleEnter = () => {
    const {section, floor, flat} = this.refs.flat.dataset;
    const  dataFlat = FilterQuarterStore
        .myHouse
        .sections[section]
        .floors[floor]
        .flats[flat];
    const {comission} = this.state;
    const self = this;
    const {id} = dataFlat;
    const comissionObj = comission.find(item => item.id === id);


    if (comissionObj) {
      this.setState(() => ({
        thisHoverComission: comissionObj.comission
      }));
    }else {
      this.timeout = setTimeout(() => {
        self.getComission(dataFlat).then(() => {
          FilterQuarterActions.setComission(dataFlat);
          self.getHoverComission(dataFlat);
        });
      }, 1000);
    }

  }

  getHoverComission = (dataFlat) => {
    const {comission} = this.state;
    const {id} = dataFlat;
    const comissionObj = comission.find(item => item.id === id);

    this.setState(() => ({
      thisHoverComission: comissionObj.comission
    }));
  }

  handleLeave = () => {
    clearTimeout(this.timeout);
  }

  render() {
    const {keyArr, titleFlatTooltip, flatSquare, flatOldPrice,
      flatPriceDisc, flatNewPrice, keySection, flatCur,
      strTd, curFloor, layout, dateReservation} = this.props;
    let classFlat = this.props.classFlat;
    const {thisHoverComission} = this.state;

    if (flatCur) {
      if (parseInt(FilterQuarterStore.myFlat.id) === parseInt(flatCur.id)) {
        classFlat += ' active';
      };
    }

    return (
      <td>
        <OverlayTrigger placement='top'
          overlay={
          <Popover title={titleFlatTooltip} id='titleTooltip'
            className="noticeBuilding">
            {dateReservation ? (
              <p className={s.reserved}>
                Забронировано до: {
                  (new Date(dateReservation)).toLocaleString('ru',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }
                  )
                }
              </p>
            ) : null}
            <p>Площадь: {flatSquare} м<sup>2</sup></p>
            {flatOldPrice}
            {flatPriceDisc}
            {flatNewPrice}
            <span className='nh-flat-link comission'>
              {!dateReservation ?
              thisHoverComission >= 0 ?
                (<span>
                    Стоимость услуг: <b>{
                    thisHoverComission > 0 ? (<Price
                      price={thisHoverComission}> <PriceUnit/></Price>) :
                      (<span> 0 <PriceUnit/></span>) }</b>
                  </span>
                ) : (<span>  Стоимость услуг:&nbsp;
                  <span style={{fontSize: '14px'}}
                     className='fa fa-spinner fa-spin fa-3x fa-fw'
                ></span>
            </span>) : null
              }
            </span>
          </Popover>
          }>
          {/*God forgive me*/}
          <div className={classFlat}>
            {dateReservation ? (
              <span className={s.reservedCell}>&nbsp;</span>
            ) : (
              <span
                id={flatCur ? `c_${flatCur.id}` : null}
                key={keyArr}
                onMouseOver={this.handleEnter}
                onMouseLeave={this.handleLeave}
                onClick={this.handleSelectItem.bind(this)}
                ref='flat'
                data-floor={curFloor}
                data-flat={keyArr}
                data-layout={layout}
                data-section={keySection}>{strTd}</span>
            )}
          </div>
      </OverlayTrigger>
    </td>
    );
  }

}

Flat.propTypes = {
  keyArr: React.PropTypes.number,
  titleFlatTooltip: React.PropTypes.string,
  flatSquare: React.PropTypes.number,
  flatOldPrice: React.PropTypes.object,
  flatPriceDisc: React.PropTypes.object,
  flatNewPrice: React.PropTypes.object,
  keySection: React.PropTypes.string,
  flatCur: React.PropTypes.object,
  strTd: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object
  ]),
  curFloor: React.PropTypes.number,
  layout: React.PropTypes.string,
  classFlat: React.PropTypes.string,
  dateReservation: React.PropTypes.string,
  autoLayoutSwitch: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.string
  ])
};

export default Flat;
