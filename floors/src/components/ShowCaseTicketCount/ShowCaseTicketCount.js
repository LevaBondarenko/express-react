/**
 * ShowCaseTicketCount widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import {declOfNum} from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import UAgregator from '../UAgregator';
import withCondition from '../../decorators/withCondition';
import s from './ShowCaseTicketCount.scss';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {massUpdateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class ShowCaseTicketCount extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    property: PropTypes.string,
    titleText: PropTypes.string,
    mainText: PropTypes.string,
    countProperty: PropTypes.string,
    gparams: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    params: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    functions: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    obj: PropTypes.object,
    actions: PropTypes.object
  };

  static defaultProps = {
    property: 'demandShowCase'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = this.processProps(props);
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

  processProps = (props) => {
    const obj = props.obj;

    return {
      count: obj[props.countProperty] || 0,
      show: obj.showStats === '1'
    };
  }

  showTicketsTable = (event) => {
    event.preventDefault();

    const obj = this.props.obj;
    const anglePos = $('.mainOpt').position().left + 140;

    if (!obj.showTicketsTable) {
      this.props.actions.massUpdateInObjectsState(
        [this.props.property], {
          showTicketsTable: true,
          itemsOption: null,
          anglePos: anglePos
        });
    } else {
      this.props.actions.massUpdateInObjectsState(
        [this.props.property], {
          itemsOption: null,
          anglePos: anglePos
        });
    }

    $('html, body').animate({
      scrollTop: $('.demandShowCaseBg').offset().top - 400
    }, 700);
  }

  render() {
    if (!this.state.show) {
      return null;
    }

    const obj = this.props.obj;
    const {count} = this.state;
    const {price_from: priceFrom} = obj;
    const {price_to: priceTo} = obj;
    const {price} = obj;
    const priceText = priceFrom && priceTo && priceFrom !== priceTo ? (
      <div className={s.bold}>
        <Price price={priceFrom}> <PriceUnit /></Price> -&nbsp;
        <Price price={priceTo}>&nbsp;
          <PriceUnit /></Price>
      </div>
    ) : priceFrom === priceTo ? (
      <div className={s.bold}>
        <Price price={priceFrom}>
          &nbsp;<PriceUnit />
        </Price>
      </div>) :
      price ? (
        <div className={s.bold}>
          <Price price={priceFrom}>
            &nbsp;<PriceUnit />
          </Price>
        </div>) : null;

    return (
      <div className={s.root}>
        <div className={s.title}>
        {this.state.show ? (
          <UAgregator
            text={this.props.titleText}
            gparams={this.props.gparams}
            params={this.props.params}
            functions={this.props.functions}
            context={this.props.context}
          />
        ) : null}
        </div>
        <div className={s.count}>
          <div className={s.countNum}>
            {count}
          </div>
          <div className={s.countText}>
            {declOfNum(count, ['покупатель', 'покупателя', 'покупателей'])}
          </div>
        </div>
        <div className={s.text}>
          <UAgregator
            text={this.props.mainText}
            gparams={this.props.gparams}
            params={this.props.params}
            functions={this.props.functions}
            context={this.props.context}
            selfUpdate={true}
          />
          {priceText}
        </div>
        {count > 0 ? (
          <div className={s.link}>
            <a href="#" id="showMainTable" onClick={this.showTicketsTable}>
              Показать покупателей
            </a>
          </div>
        ) : null}
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({massUpdateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state, ownProps) {
  return {
    obj: state.objects.get(ownProps.property).toJS() || null
  };
}

ShowCaseTicketCount =
  connect(mapStateToProps, mapDispatchToProps)(ShowCaseTicketCount);
ShowCaseTicketCount = withCondition()(ShowCaseTicketCount);

export default ShowCaseTicketCount;
