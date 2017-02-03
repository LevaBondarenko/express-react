import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {each, map} from 'lodash';
import {priceFormatter} from '../../utils/Helpers';
import {connect} from 'react-redux';
/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';

class FilterQuarterSquares extends Component {

  static propTypes = {
    section: React.PropTypes.object,
    sectionNum: React.PropTypes.string,
    maxFlat: React.PropTypes.number,
    currency: React.PropTypes.object,
    typeBuild: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  getFlatsOnLine(coords) {
    const dataBuildFilter = FilterQuarterStore.filterHouse;
    const floors = dataBuildFilter.sections[coords.sectionNum].floors;
    const flatsOnLine = [];

    each(floors, floor => {
      if (floor.flats[coords.onFloor]) {

        const price = floor.flats[coords.onFloor].price_discount ?
          floor.flats[coords.onFloor].price_discount :
          floor.flats[coords.onFloor].price;

        flatsOnLine.push({
          id: floor.flats[coords.onFloor].id,
          square: floor.flats[coords.onFloor].square,
          price: price,
          priceM2: floor.flats[coords.onFloor].price_metr
        });
      }
    });

    return flatsOnLine;
  }

  onHover() {
    const coords = arguments[0];
    const flatsOnline = this.getFlatsOnLine(coords);

    each(flatsOnline, item => {
      const el = document.getElementById(`c_${item.id}`);

      if(el) {
        const width = el.parentNode.offsetWidth;

        el.innerHTML = `${item.square} м<sup>2</sup>`;
        el.parentNode.className += ' outlined';
        el.parentNode.style.width = `${width}px`;
      }
    });

  }

  onHoverOut() {
    const coords = arguments[0];
    const flatsOnline = this.getFlatsOnLine(coords);
    const {currency} = this.props;
    const course = currency ? (currency.nominal / currency.value) : 1;
    const unit = currency.symbol;
    const typeBuild = parseInt(this.props.typeBuild);

    each(flatsOnline, item => {
      const price = typeBuild === 1 ? item.price : item.priceM2;
      const m2 = typeBuild === 1 ? '' : '/м\u00B2';

      const el = document.getElementById(`c_${item.id}`);

      if(el) {
        let priceInCurrency = price * course;
        let kilos = '';

        if(priceInCurrency >= 100000) {
          priceInCurrency = priceInCurrency / 1000;
          kilos = 'т.';
        }
        const formattedPrice = priceFormatter(Math.round(priceInCurrency));

        el.innerHTML = `${formattedPrice} ${kilos}${unit}${m2}`;
        el.parentNode.className = el.parentNode.className
          .replace(/\outlined\b/,'');

        el.parentNode.removeAttribute('style');
      }
    });

  }

  render() {
    const section = this.props.section;
    const sectionNum = this.props.sectionNum;
    const maxFlat = this.props.maxFlat;
    let squaresOnLine = {};
    const typeBuild = parseInt(this.props.typeBuild);
    const m2 = typeBuild === 0 ? {__html: 'м<sup>2</sup>'} : {__html: 'Этаж'};

    const step = {};

    each(section.floors, floor => {
      each(floor.flats, flat => {
        const flatSquare = parseFloat(flat.square);
        const squareOnLine = parseFloat(squaresOnLine[flat.on_floor]);

        if (!squaresOnLine[flat.on_floor]) {
          squaresOnLine[flat.on_floor] = flat.square;
          step[flat.on_floor] = false;
        } else if (flatSquare < squareOnLine) {
          squaresOnLine[flat.on_floor] = flat.square;
          step[flat.on_floor] = true;
        } else if (flatSquare !== squareOnLine) {
          step[flat.on_floor] = true;
        }
      });
    });

    for (let i = 1; i <= maxFlat; i++) {
      squaresOnLine[i] = squaresOnLine[i];
    }

    squaresOnLine = map(squaresOnLine, (line, onFloor) => {

      let tdClassName;
      let divClassName;
      let imgClassName;
      let mouseIn;
      let mouseOut;
      const coords = {
        onFloor: onFloor,
        sectionNum: sectionNum,
      };

      if (typeBuild !== 0) {
        line = line === undefined ? {__html: ''} :
          {__html: `${line.toString().replace('.', ',')} м<sup>2</sup>`};
        tdClassName = 'td-square-min';
        divClassName = 'square-min';
        mouseIn = this.onHover.bind(this, coords);
        mouseOut = this.onHoverOut.bind(this, coords);

        if (step[onFloor]) {
          tdClassName += ' hasMany';
          line.__html = `от ${line.__html}`;
        }

      } else {
        line = line === undefined ? {__html: ''} :
          {__html: Math.round(parseFloat(line))};
        tdClassName = 'td-square-min td-square-min-rooms';
        divClassName = 'square-min square-min-rooms';
      }
      if (line.__html === '') {
        imgClassName = '__hidden';
        divClassName = '__hidden';
      } else {
        imgClassName = 'td-square-min-corner';
      }

      return (
        <td className={tdClassName} key={line + onFloor}>
            <img className={imgClassName} src='https://cdn-media.etagi.com/content/media/site/6/62/62fe8c6d2851fc556899ca072bf2092a83244173.gif' />
            <div className={divClassName}
              dangerouslySetInnerHTML={line}
              onMouseOver={mouseIn}
              onMouseOut={mouseOut}
            />
        </td>
      );
    });

    return (
      <thead>
        <tr className='jk-square'>
          <td className='bgc-white' dangerouslySetInnerHTML={m2} />
          {squaresOnLine}
        </tr>
      </thead>
    );
  }

}

function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current,
  };
}

export default connect(mapStateToProps)(FilterQuarterSquares);
