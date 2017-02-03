/**
 * Searchform house component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {cutText, distFromSeaFormat} from '../../utils/Helpers';
import {size} from 'lodash';
import createFragment from 'react-addons-create-fragment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import ReactDOM from 'react-dom';
import Popover from 'react-bootstrap/lib/Popover';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import ga from '../../utils/ga';
import classNames from 'classnames';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

/*global data*/

class ItemDescription extends Component {
  static propTypes = {
    house: PropTypes.object,
    location: PropTypes.string,
    layoutType: PropTypes.string,
    realtyType: PropTypes.string,
    collapse: PropTypes.bool,
    textCollapse: PropTypes.bool,
    priceFair: PropTypes.number,
    isSaleTrue: PropTypes.bool
  };

  static defaultProps = {
    collapse: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      collapse: props.collapse,
      collapseText: props.collapse,
      notesHeight: 0,
      randCol: this.deviationArr(+props.house.deviation),
      showDeviation: this.showDeviation(+props.house.deviation)
    };
  }

  deviationArr(deviation) {
    const randCol = [];
    const param = deviation <= 0 ? true : false;
    const min = param ? 45 : 5;
    const max = param ? 100 : 60;

    for(let i = 0; i < 5; i++) {
      randCol.push(
        {height: param && i == 2 ? '30%' :
          (!param && i == 3 ? '80%' :
            `${Math.floor(Math.random() * (max - min)) + min}%`)}
      );
    }

    return randCol;
  }

  showDeviation = (deviation) => {
    return data.options.priceDeviationOptions.show &&
      ((deviation > 0 && (deviation < data.options.priceDeviationOptions.max ||
      data.options.priceDeviationOptions.max < 0)) ||
      (deviation < 0 && (deviation > -data.options.priceDeviationOptions.min ||
      data.options.priceDeviationOptions.min < 0)));
  }

  componentWillReceiveProps = (nextProps) => {
    if(this.props.house.object_id !== nextProps.house.object_id) {
      this.setState(()=>({
        collapse: false,
        textCollapse: false,
        randCol: this.deviationArr(+nextProps.house.deviation),
        showDeviation: this.showDeviation(+nextProps.house.deviation)
      }));
    }
  }

  handleReadMore(event) {
    event.preventDefault();
    ga('button', 'site_description_search_card_show');

    if(this.state.collapse) {
      setTimeout(() => {
        this.setState(() => ({
          collapseText: false
        }));
      }, 500);
    } else {
      setTimeout(() => {
        const notesNode = ReactDOM.findDOMNode(this.refs.notes);
        const height = notesNode ? notesNode.offsetHeight : 0;

        this.setState(() => ({
          notesHeight: height
        }));
      }, 500);
    }


    this.setState(()=>({
      collapse: !this.state.collapse,
      collapseText: true
    }));
  }

  render() {
    const {house, location, layoutType, priceFair, isSaleTrue} = this.props;
    const {showDeviation, notesHeight, collapse, collapseText} = this.state;
    const priceM = priceFair && isSaleTrue ?
     priceFair / parseFloat(house.square) : Math.ceil(house.price_m2);
    const mortgagePay = house.mortgage_pay || '';
    const shortText = cutText(house.notes, 150);
    const notesStyle = collapse ?
     (notesHeight ? {height: notesHeight} : {height: 'auto'}) :
     {height: 60};
    const distanceFromSea = house.distance_from_sea ?
      distFromSeaFormat(house.distance_from_sea) : null;

    // считаем отклонение цены от рыночной
    const deviation = showDeviation ? parseInt(house.deviation) : null;
    const deviationDirection = deviation >= 0 ? 'up' : 'down';
    const deviationAbs = Math.abs(deviation);
    const deviationtext = (
      <p>Отклонение в процентах показывает разницу между
        средней стоимостью <strong>1&nbsp;квадратного метра &nbsp;</strong>
        аналогичных активных и проданных объектов и стоимостью
        &nbsp;<strong>1&nbsp;квадратного метра&nbsp;</strong> данного объекта.
        Показатель может меняться в течение периода нахождения объекта
        на продаже.</p>);

    let allowed;

    if (house.allowed) {
      allowed = house.allowed
        .replace('{', '')
        .replace('}', '')
        .split(',');
    } else {
      allowed = [];
    }

    const allowedAnimals  = allowed.indexOf('animals') !== -1 ?
      'Разрешено' : 'Не разрешено';
    const allowedChildren = allowed.indexOf('children') !== -1 ?
      'Разрешено' : 'Не разрешено';
    const shortDuration = ['day', 'week', 'month']
      .indexOf(house.duration) !== -1 ? 'Да' : 'Нет';

    return (
        <div>
          <Col xs={12}
            className='item--description realty__description clearfix'>
            <Row>
              <Col xs={4} >
                {(house.metro_station ?
                  <p><b>Метро</b>: {house.metro_station}</p> :
                  null)}

                {(house.square ?
                  <p><b>Площадь</b>: {house.square} м<sup>2</sup></p> : null)}

                {(house.square && priceM && layoutType !== 'rent' &&
                 house.type !== 'land' && parseInt(house.price) > 0 ?
                  <p><b>Цена за м<sup>2</sup></b>: <Price price={priceM}>&nbsp;
                  <PriceUnit/></Price></p> :
                    null)}

                {this.props.realtyType === 'rent' ? (
                  <p><b>Животные</b>: {allowedAnimals}</p>
                ) : null}

                {this.props.realtyType === 'rent' ? (
                  <p><b>Дети</b>: {allowedChildren}</p>
                ) : null}

                {house.type === 'land' && house.class !== 'offices' &&
                  parseInt(house.price) > 0 ? // для загородки
                  (<p>
                    <b>Цена за сотку:</b>&nbsp;
                    <Price
                      style={{display: 'block'}}
                      price={Math.round(house.price / house.area_land)}>
                        &nbsp;<PriceUnit/>
                    </Price>
                  </p>) :
                  null}

                {parseInt(house.area_house) !== 0 &&
                          house.class === 'cottages' &&
                          house.type !== 'land' ?
                  (<p><b>Площадь дома:</b>&nbsp;
                    <span dangerouslySetInnerHTML={
                        {__html: `${house.area_house} м<sup>2</sup>`}}>
                    </span>
                  </p>) :
                  null}

                {parseInt(house.area_house) !== 0 &&
                          house.class === 'cottages' &&
                          house.type !== 'land' && parseInt(house.price) > 0 ?
                  (<p><b>Цена за м<sup>2</sup>:</b>&nbsp;
                    <Price
                      price={Math.round(house.price / house.area_house)}>
                        &nbsp;<PriceUnit/>
                    </Price>
                  </p>) :
                  null}

                {parseInt(house.area_land) !== 0 &&
                          house.class === 'cottages' &&
                          house.type !== 'land' ?
                  (<p><b>Площадь участка:</b>&nbsp;
                    {`${house.area_land} сот.`}
                  </p>) :
                  null}

                {(house.survey === 't') && house.class === 'cottages'  ?
                  (<p><b>Межевание:</b>&nbsp;
                    выполнено
                  </p>) :
                  null}
                {(distanceFromSea ?
                  <p><b>Метров до моря</b>: {distanceFromSea}</p> :
                  null)}
              </Col>
              <Col xs={4} >
                {parseInt(house.area_land) && house.type === 'land' ? // для загородки
                  (<p><b>Площадь участка:</b>&nbsp;
                    <span style={{display: 'block'}}>
                      {`${house.area_land} сот.`}
                    </span>
                  </p>) :
                  null}
                {(parseInt(house.floors) !== 0 &&
                           house.class === 'cottages' &&
                           house.type !== 'land' ? // для загородки
                  <p><b>Этажность</b>:&nbsp;
                    {house.floors}
                  </p> :
                  null)}
                {this.props.realtyType === 'rent' ? (
                  <p><b>Короткие сроки аренды:</b> {shortDuration}</p>
                ) : null}
                {(parseInt(house.rooms) !== 0 &&
                           house.class === 'cottages' &&
                           house.type !== 'land' ? // для загородки
                  <p><b>Кол-во комнат</b>:&nbsp;
                    {house.rooms}
                  </p> :
                  null)}
                {(mortgagePay && layoutType !== 'rent' &&
                    house.class !== 'cottages' && parseInt(house.price) > 0 ?
                  <p className='mortgagePay'>
                    <b>В ипотеку:&nbsp;
                      <Price
                        price={mortgagePay}>
                          &nbsp;<PriceUnit/>/мес
                      </Price>
                    </b>
                  </p> : null)}
                {(house.floor && house.type !== 'land' ?
                  <p><b>Этаж/Этажность</b>: {house.floor}/{house.floors}</p> :
                  null)}
              </Col>
              <Col xs={4} >
                {(mortgagePay && house.class === 'cottages' &&
                  parseInt(house.price) > 0 ?
                  <p className='mortgagePay'>
                    <b>В ипотеку:&nbsp;
                      <Price
                        price={mortgagePay}>
                          &nbsp;<PriceUnit/>/мес
                      </Price>
                    </b>
                  </p> : null)}
                {deviation ? (
                  <div className="searchRealtyItem_objDeviation">
                    {deviationDirection === 'up' ? (
                      <span>
                <span>цена выше средней по рынку на</span>
                <span className="searchRealtyItem_deviationUp">
                  {`${deviationAbs}%`}
                </span>
              </span>
                    ) : (
                      <span>
                <span>цена ниже средней по рынку на</span>
                <span className="searchRealtyItem_deviationDown">
                  {`${deviationAbs}%`}
                </span>
              </span>
                    )}
                    <div className='liquidity_block_value'>
                      <OverlayTrigger placement='right'
                                      overlay={
                <Popover id='devcontent' className="noticeFlat">
                  {deviationtext}
                </Popover>
              }>
                        <span
                          onMouseOver={() => {
                            ga('help', 'site_liquidity_search_card', 'hover');
                          }}
                          className='tooltip_icon tooltip-icon__question' />
                      </OverlayTrigger>
                    </div>
                  </div>
                ) : null}
              </Col>
            </Row>
          </Col>
          <Col xs={12}
            className='item--description realty__description clearfix'>
            <Col xs={9} style={{padding: 0}}>
              {(house.notes ?
                <div>
                  <div style={notesStyle}  ref='notes'
                  className={classNames(
                 'objectNote',
                 {'uncollapsed': collapse || size(shortText[1] > 0)}
               )}>
               <span>{createFragment({__html: shortText[0]})} </span>
                {collapseText ? (
                  <span>
                    {createFragment({__html: shortText[1]})}
                  </span>
                ) : null}
                  </div>
                  {(size(shortText[1]) > 0 ?
                  <a href='#' className='readMoreBtn'
                    onClick={this.handleReadMore.bind(this)}>
                    {collapse ? 'Скрыть' : 'Читать полностью'}</a> : null)}
                </div> : null)}
            </Col>
            <Col xs={3} style={{marginTop: 40}}>
              <div className='item--controls'>
                <a
                  onClick={() => {
                    ga('button', 'site_search_card_detail');
                  }}
                  href={location} className='item--controls__more'
                target='_blank'>Подробнее</a>
              </div>
            </Col>
          </Col>
        </div>
    );
  }
}

export default ItemDescription;
