/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {toCamel, coolJoin} from '../../utils/Helpers';
import {map, each, size, isFinite} from 'lodash';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import withCondition from '../../decorators/withCondition';
import FlatInfoOldPrice from './FlatInfoOldPrice';
import FlatInfoEconomy from './FlatInfoEconomy';
import FlatInfoPriceM2 from './FlatInfoPriceM2';
import FlatInfoSignForReview from './FlatInfoSignForReview';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import moment from 'moment';

@withCondition()
class FlatInfo extends Component {
  static propTypes = {
    comission: PropTypes.string,
    enroll: PropTypes.string,
    reducedComission: PropTypes.string,
    saleBackground: PropTypes.string,
    saleDate: PropTypes.string,
    saleHTML: PropTypes.string,
    saleWhatIt: PropTypes.string,
    walls: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  //электричество

  get electricityFlat() {
    let electricity = data.object.info.electricity ?
      data.object.info.electricity_ru : null;

    switch (electricity) {
    case 'insector':
      electricity = 'Столб около участка';
      break;
    case 'no':
      electricity = 'Отсутствует ';
      break;
    case 'inlocality':
      electricity = 'Есть в нас. пункте';
      break;
    case 'instreet':
      electricity = 'Заведено';
      break;
    case 'inhome':
      electricity = 'Разведен по дому';
      break;
    default:

    }
    return electricity ? (
      <tr className='object_house_params'>
        <td>Электричество</td>
        <td className='object_params_value'>{electricity}</td>
      </tr>
    ) : null;
  };

  render() {
    // верстка по yandex БЭМ. Оттого и длинные классы
    /* global data */
    const flat = data.object.info;
    const props = this.props;
    let fields;

    switch (props.action) {
    case 'sale':
      fields = props.fields[flat.class];
      // если не задано конфигурации полей для конкретного типа, то берем набор полей по умолчанию
      if (!fields) {
        fields = props.fields.default;
      }
      break;
    case 'lease':
      fields = props.fields[flat.type];
      // если не задано конфигурации полей для конкретного типа, то берем набор полей по умолчанию
      if (!fields) {
        fields = props.fields.default;
      }
      break;
    case 'both':
      fields = flat.type === 'land' ? props.fields[flat.action_sl].land :
       props.fields[flat.action_sl].default;
      break;
    default:
      //do nothing
      break;
    }
    const {saleDate, saleWhatIt, saleHTML, saleBackground} = this.props;
    const mainParams = fields.main_params;
    const houseParams = fields.house_params;
    const priceParams = fields.price_params;
    const objectCode = fields.code;
    const deviation = parseFloat(flat.deviation);
    const showDeviation = data.options.priceDeviationOptions.show &&
      ((deviation > 0 && (deviation < data.options.priceDeviationOptions.max ||
      data.options.priceDeviationOptions.max < 0)) ||
      (deviation < 0 && (deviation > -data.options.priceDeviationOptions.min ||
      data.options.priceDeviationOptions.min < 0)));

    // считаем отклонение цены
    let liquidity = '';

    if (showDeviation && deviation && deviation !== 0) {
      const valueClass = deviation > 0 ? 'red_percent' : 'green_percent';
      const deviationtext = (
        <p>Отклонение в процентах показывает разницу между
          средней стоимостью <strong>1&nbsp;квадратного метра &nbsp;</strong>
          аналогичных активных и проданных объектов и стоимостью
          <strong>&nbsp;1&nbsp;квадратного метра</strong> данного объекта.
          Показатель может меняться в течение периода нахождения объекта
          на продаже.</p>);
      const deviationText2 = deviation > 0 ?
        'Дороже похожих' :
        'Дешевле похожих';

      liquidity = props.action === 'sale' ? (
        <div className='liquidity_block'>
          <div className='liquidity_block_text'>
            {deviationText2}:
          </div>
          <div className='liquidity_block_value'>
            <span className={valueClass}>{Math.abs(deviation)}%</span>
            <OverlayTrigger placement='right' overlay={
                <Popover id='devcontent' className="noticeFlat">
                  {deviationtext}
                </Popover>
              }>
              <span className='tooltip_icon tooltip-icon__question'></span>
            </OverlayTrigger>
          </div>
        </div>
      ) : null;

    }

    // собираем виджет

    // основные хар-ки объекта
    const mainParamsComponent = map(mainParams, (param, key) => {

      const paramName = toCamel(param['name']);
      const suffix = param['suffix'];
      const text = flat[param['name']] + suffix;

      return flat[param['name']] && parseInt(flat[param['name']]) !== 0 ? (
        <div key={key} className='object_mainParam'>
          <OverlayTrigger placement='right' overlay={
            <Popover id='notflat' className="noticeFlat">
              {param['rus']}
            </Popover>
            }>
            <div className={`object_mainParam_ico
                object_mainParam_ico__${toCamel(paramName)}`}>
            </div>
          </OverlayTrigger>
          <div className={`object_mainParam_text
                object_mainParam_text__${toCamel(paramName)}`}
            dangerouslySetInnerHTML={{__html: text}}>
          </div>
        </div>
      ) : null;
    });

    // прочие хар-ки объекта/дома
    const houseParamsComponent = map(houseParams, (param, key) => {

      let paramName = Array.isArray(param['rus']) ?
        coolJoin('/', param['rus'], toCamel) :
        toCamel(param['rus']);
      let exists = true;
      let val;

      if (Array.isArray(param['name'])) {
        val = flat[param['name'][0]] ? (isFinite(flat[param['name'][0]]) ?
          flat[param['name'][0]] :
          flat[param['name'][0]].replace(/([{}"])/g, '')) : '';
        exists = parseInt(val) !== 0 && val;
      } else {
        val = flat[param['name']] ? (isFinite(flat[param['name']]) ?
            flat[param['name']] :
            flat[param['name']].replace(/([{}"])/g, '')) : '';

        if (param['type'] === 'bool') {
          val = param['values'][val];
        }

        exists = parseInt(val) !== 0 && val;
      }

      let value;
      const styleObj = {};

      each(param['styles'], (style, key) => {
        styleObj[style] = param['styleVal'][key];
      });

      if (Array.isArray(param['name'])) {
        value = map(param['name'], par => {
          return flat[par];
        });
        value = value.join('/');
      } else {
        value = flat[param['name']] ? (isFinite(flat[param['name']]) ?
            flat[param['name']] :
            flat[param['name']].replace(/([{}"])/g, '')) : '';

        if (param['type'] === 'bool') {
          value = param['values'][value];
        }
      }

      // если параметр находится в поле типа json
      if (param['name'].indexOf('.') !== -1) {
        const paramNameArr = param['name'].split('.');
        const meta = paramNameArr[0];
        const metaName = paramNameArr[1];
        const metaFields = JSON.parse(flat[meta]);

        paramName = param['rus'];
        value = metaFields[metaName];
        exists = !!value;
      }

      return exists ? (
        <tr key={key} className='object_house_params' style={styleObj}>
          <td>{paramName}</td>
          <td
            className='object_params_value'>{value + (param['suffix'] ?
            param['suffix'] : '')}
          </td>
        </tr>
      ) : null;
    });

    // ценовые хар-ки объекта

    const reducedComission =
      this.props.reducedComission && size(this.props.reducedComission) &&
      (flat.contract_type === 'vozmezdnuy' ||
      flat.contract_type === 'exclusive') ? this.props.reducedComission : null;
    const {comission} = this.props;
    const priceParamsComponent = map(priceParams, (param, key) => {
      if(param['name'] === 'comission' && parseInt(comission) < 1) {
        return false;
      }
      const paramName = Array.isArray(param['rus']) ?
        coolJoin('/', param['rus'], toCamel) :
        toCamel(param['rus']);
      const exists = Array.isArray(param['name']) ?
        parseInt(flat[param['name'][0]]) !== 0 :
        flat[param['name']] && parseInt(flat[param['name']]) !== 0;
      let value;
      const styleObj = {};

      each(param['styles'], (style, key) => {
        styleObj[style] = param['styleVal'][key];
      });

      if (Array.isArray(param['name'])) {
        value = map(param['name'], (par) => {
          return flat[par];
        });
        value = value.join('/');
      } else {
        value = flat[param['name']];
      }

      const valueIsNumeric = value && (isFinite(value) ||
        value.replace(/\s/g, '').match(/^\d+\.?\d*$/));

      return exists && parseInt(flat.price) > 0 ? (
        <tr key={key} className='object_price_params' style={styleObj}>
          <td dangerouslySetInnerHTML={{__html: paramName}}></td>
          <td	className='object_params_value'>
            {param['name'] === 'comission' && reducedComission ? (
                <span className='object_price_params--reducedComission'>
                  {` ${reducedComission}`}&nbsp;
                </span>
            ) : null}
            <span
              className={param['name'] === 'comission' && reducedComission ?
                'object_price_params--oldComission' : null}>
                {valueIsNumeric ? <Price price={value}/> : value}
                &nbsp;
              </span>
            {valueIsNumeric ? (
              <PriceUnit>
                {param['name'] === 'mortgage_pay' ? '/мес' : null}
              </PriceUnit>
            ) : null}
          </td>
        </tr>
      ) : null;
    });
    const walls = flat.walls && this.props.walls === '1' ? (
      <tr className='object_house_params'>
        <td>Стены</td>
        <td className='object_params_value'>{flat.walls}</td>
      </tr>
    ) : null;

    // код объекта
    const objectCodeComponent = map(objectCode, (param, key) => {

      const paramName = Array.isArray(param['rus']) ?
        coolJoin('/', param['rus'], toCamel) :
        toCamel(param['rus']);
      const exists = Array.isArray(param['name']) ?
        parseInt(flat[param['name'][0]]) !== 0 :
        parseInt(flat[param['name']]) !== 0;
      let value;
      const styleObj = {};

      each(param['styles'], (style, key) => {
        styleObj[style] = param['styleVal'][key];
      });

      if (Array.isArray(param['name'])) {
        value = map(param['name'], par => {
          return flat[par];
        });
        value = value.join('/');
      } else {
        value = flat[param['name']];
      }
      return exists ? (
        <tr key={key} className='object_code'>
          <td dangerouslySetInnerHTML={{__html: paramName}}></td>
          <td className='object_params_value'>{value}</td>
        </tr>
      ) : null;
    });
    const saleDateArr = saleDate ? saleDate.split('-') : false;
    const priceFair = flat.price_fair &&
     +flat.price_fair < +flat.price ? flat.price_fair : false;
    let isSaleTrue, saleText, saleOverlay;

    if (saleDateArr.length > 0 && priceFair) {
      const saleMinDay = moment(saleDateArr[0], 'DD-MM-YYYY').isValid() ?
       moment(saleDateArr[0], 'DD-MM-YYYY').format().substr(0,10) : null;
      const saleMaxDay = saleDateArr[1] &&
       moment(saleDateArr[1], 'DD-MM-YYYY').isValid() ?
       moment(saleDateArr[1], 'DD-MM-YYYY').format().substr(0,10) : null;
      const now = moment().format().substr(0,10);

      // немного второпях
      if(saleDateArr.length === 1) {
        isSaleTrue = now === saleMinDay ?
         true : false;
      }else if(saleDateArr.length === 2) {
        isSaleTrue = now >= saleMinDay &&
          now <= saleMaxDay ? true : false;
      }
      saleText = {__html: saleHTML};
      saleOverlay = saleWhatIt !== '' && saleWhatIt != null ? (
        <div className='liquidity_block_value'>
          <OverlayTrigger
            placement='right'
            overlay={
              <Popover id='devcontent'
                 className="noticeFlat">
                {saleWhatIt}
              </Popover>
            }>
            <span className='tooltip_icon tooltip-icon__question' />
          </OverlayTrigger>
        </div>
      ) : null;
    }


    const period = props.action === 'lease' ||
     (flat.action_sl && flat.action_sl === 'lease') ? (
        flat.period === 'day' ? <PriceUnit>/день</PriceUnit> :
          <PriceUnit>/мес.</PriceUnit>
      ) : <PriceUnit/>; // переписать, в таблицах rent и office существуют значения '0', 'day', 'month', 'quarter', 'half_year', 'year'

    const priceM2Only = flat.price_m2_only ?
                        <span> / м<sup>2</sup></span> : null;

    return (
      <div className='object-block'>
        {isSaleTrue && saleDateArr && priceFair ?
          (<div className='objects--item-object__sale'
            style={{
              background: `url(${saleBackground})`}}>
            <span className='objects--item-object__sale__sale_html'
              dangerouslySetInnerHTML={saleText}>
            </span>
            {saleOverlay}
          </div>) : null}
        <FlatInfoOldPrice
          priceFair={parseInt(priceFair)}
          isSaleTrue={isSaleTrue}
          oldPrice={parseInt(flat.old_price)}
          price={parseInt(flat.price)}/>
        <div className='object_newPrice'>
          <span className='object_newPrice_text'>
            Стоимость, {period}
          </span>
          <Price className='object_newPrice_sum'
            price={data.object.info.price_m2_only ?
            flat.price_m2 : (priceFair && isSaleTrue ?
               priceFair : flat.price)}>
              {priceM2Only}
            </Price>
        </div>
        <FlatInfoEconomy
          priceFair={priceFair}
          isSaleTrue={isSaleTrue}
          oldPrice={parseInt(flat.old_price)}
          price={parseInt(flat.price)} />
        <FlatInfoPriceM2
          priceFair={priceFair}
          isSaleTrue={isSaleTrue}
          price={parseInt(flat.price)}
          priceM2={flat.price_m2}
          square={flat.square}
          actionSL={flat.action_sl}
          action={props.action}
          type={flat.class}
          area={flat.area_land} />
        {flat.class !== 'cottages' ? liquidity : ''}
        {(this.props.enroll === '1' ?
          <FlatInfoSignForReview oid={flat.object_id} oclass={flat.class}/> :
          null
        )}
        <div className='object_mainParams'>
          {mainParamsComponent}
          <div style={{clear: 'both'}}></div>
        </div>
        <table className='object_params'><tbody>
          {houseParamsComponent}
          {walls}
          {this.electricityFlat}
          <tr>
            <td className='object_price_params_first'></td>
            <td className='object_price_params_first'></td>
          </tr>
          {priceParamsComponent}
          {objectCodeComponent}
        </tbody></table>
      </div>
    );
  }
}

export default FlatInfo;
