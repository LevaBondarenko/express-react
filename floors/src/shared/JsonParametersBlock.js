/**
 * Construction stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import {sortBy, filter, map, each, size} from 'lodash';
import {connect} from 'react-redux';
import {priceFormatter} from '../utils/Helpers';
/**
 * components
 */
import Price from './Price';
import PriceUnit from './PriceUnit';
/**
 * styles
 */
import s from './JsonParametersBlock.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

class JsonParametersBlock extends Component {
  static propTypes = {
    source: PropTypes.object,
    parameters: PropTypes.array,
    location: PropTypes.string,
    curUnit: PropTypes.string,
    course: PropTypes.number
  };

  constructor(props) {
    super(props);
  }

  getflatsData(data, location) {
    const flats = {};

    each(data, (flatsByRooms, room) => {
      const places = [];

      flats[room] = filter(flatsByRooms, (flat) => {
        const idx = `${flat.floor}${flat.section}${flat.rooms}
          ${flat.floors}${flat.on_floor}`;

        if (places.indexOf(idx) === -1) {
          places.push(idx);
          return true;
        }
        return false;
      });
    });

    const dataTable = map(flats, (flat, roomsCnt) => {
      flat = filter(flat, item => parseInt(item.price) !== 0);

      if (flat.length > 0) {
        flat = sortBy(flat, f => parseInt(f.price));

        const minPrice = flat[0].price,
          maxPrice = flat[flat.length - 1].price;

        flat = sortBy(flat, f => parseInt(f.square));

        const minArea = flat[0].square,
          maxArea = flat[flat.length - 1].square;
        const href = location.indexOf('?') > -1 ?
          `${location}&rooms=${roomsCnt}` :
          `${location}?rooms=${roomsCnt}`;

        return (
          <a key={roomsCnt} className={s.flatsWrapper} href={href}>
            <div>{roomsCnt}-к</div>
            {(minArea === maxArea ? <div>{maxArea} м<sup>2</sup></div> :
              <div>от {minArea} м<sup>2</sup></div>)}
            <div>
              {(minPrice === maxPrice ?
                <div className={s.fixPrice}>
                  <Price price={maxPrice}/>&nbsp;<PriceUnit />
                </div> :
                (<div>
                  от <Price price={minPrice}/>&nbsp;<PriceUnit />
                </div>))}
                <div className={s.flatsCount}>
                  в продаже: {size(flat)}
                </div>
            </div>
          </a>
        );
      }
    });

    return dataTable;
  }

  processValue(key) {
    let result;

    switch(key) {
    case 't':
    case 'yes':
      result = 'Да';
      break;
    case 'f':
    case 'no':
      result = 'Нет';
      break;
    default:
      result = key.toString().search(/^{.*}/i) > -1 ?
        key.replace(/([{}"])/g, '').replace(/([,])/g, ' • ') :
        (Array.isArray(key) ?
          key.join(' • ') :
          key);
      break;
    }

    return result;
  }

  render() {
    const {parameters, source, location, course, curUnit} = this.props;

    return (<div>
      {parameters.map((param, idx) => {
        const isFlats = param.value.indexOf('{flats}') > -1;
        let resultValue = param.value;
        let ref = param.ref;
        let regexp = new RegExp('\\${([^${]*)#([\\w-_]+)#([^}]*)}', 'ig'); //eslint-disable-line
        let match;

        while (match = regexp.exec(param.value)) {
          const price = source[match[2]] ?
            priceFormatter(Math.round(course * source[match[2]])) :
            '';

          resultValue = price ? resultValue.replace(match[0],
            `<span>${price}&nbsp;${curUnit}</span>`) :
            '';

        }
        regexp = new RegExp('{([^${]*)#([\\w-_]+)#([^}]*)}', 'ig');
        while (match = regexp.exec(param.value)) {
          resultValue = resultValue.replace(match[0],
            source[match[2]] ?
            `${match[1]}${this.processValue(source[match[2]])}${match[3]}` :
            '');
        }

        regexp = new RegExp('{([^{]*)}', 'ig');
        while (match = regexp.exec(param.ref)) {
          ref = ref.replace(regexp[0],
            source[regexp[1]] ?
            source[regexp[1]] :
            '');
        }

        return resultValue ? (<div key={`param_${idx}`}>
          <div className={s.prop}>
            {param.title && <div
              className={s.propTitle}
              dangerouslySetInnerHTML={{__html: param.title}}
            />}
            {!isFlats &&
            (<div className={param.title && s.propValue}>
              {param.ref ?
                <a href={ref}>
                  <div dangerouslySetInnerHTML={{__html: resultValue}} />
                </a> :
                <div dangerouslySetInnerHTML={{__html: resultValue}} />}
            </div>)}
          </div>
          {isFlats && this.getflatsData(source.flats, location)}
        </div>) : null;
      })}
    </div>);
  }
}

JsonParametersBlock = connect(
  (state) => {
    const currency = state.ui.get('currency').toJS().current;

    return {
      course: currency ? (currency.nominal / currency.value) : 1,
      curUnit: currency ? (currency.symbol) : 'руб'
    };
  }
)(JsonParametersBlock);

export default withStyles(s)(JsonParametersBlock);
