/**
 * ShowCaseActionButton widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './ShowCasePriceCalc.scss';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class ShowCasePriceCalc extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    'text_before': PropTypes.string,
    'text_after': PropTypes.string,
    actions: PropTypes.object,
    sell: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    showAvgPrice: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    avgPriceLoading: PropTypes.bool,
    square: PropTypes.number
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  closeWidget = (e) => {
    e.preventDefault();

    this.props.actions.updateInObjectsState(
      ['demandShowCase', 'showAvgPrice'], () => (!this.props.showAvgPrice));
  }

  render() {
    if (!this.props.showAvgPrice) {
      return null;
    }

    let text;

    if (this.props.avgPriceLoading) {
      text = (
        <div className='loader-inner ball-clip-rotate avgPrice-preloader'>
          <div></div>
        </div>
      );
    } else {
      if (this.props.sell.analitic_price) {
        const price = this.props.sell.analitic_price * 1000;
        const priceM2 = Math.round(price / this.props.square);
        const priceBlock = (
          <span>
            <b className={s.price}>
              <Price price={price}>
                &nbsp;<PriceUnit />
              </Price>
            </b>
                &nbsp;(<Price price={priceM2}>
              &nbsp;<PriceUnit /> за м²
            </Price>)
          </span>
        );

        text = (
          <span>
            <span
              dangerouslySetInnerHTML={{__html: this.props['text_before']}}/>
              {priceBlock}
              <span
                dangerouslySetInnerHTML={{__html: this.props['text_after']}}/>
          </span>
        );
      } else {
        // если расчитать рыночную стоимость не удалось,
        // то запрос отдает в sell текст ошибки
        text = (
          <span>
            {this.props.sell}
          </span>
        );
      }
    }

    return (
      <div className={s.root}>
        <div className={s.close}>
          <a href="#" onClick={this.closeWidget}>
            <span className={s.closeItem}>
              ЗАКРЫТЬ
            </span>
            <span className={`${s.closeItem} ${s.bigTimes}`}>&times;</span>
          </a>
        </div>
        <div className={s.text}>
          {text}
        </div>
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state) {
  const obj = state.objects.get('demandShowCase').toJS() || {};

  return {
    showAvgPrice: obj.showAvgPrice,
    square: obj.square,
    sell: obj.sell || '',
    avgPriceLoading: obj.avgPriceLoading
  };
}

ShowCasePriceCalc =
  connect(mapStateToProps, mapDispatchToProps)(ShowCasePriceCalc);
ShowCasePriceCalc = withCondition()(ShowCasePriceCalc);

export default ShowCasePriceCalc;
