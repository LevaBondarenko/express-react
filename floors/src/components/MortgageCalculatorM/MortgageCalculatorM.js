/**
 * MortgageCalculatorM widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import ContextType from '../../utils/contextType';
import s from './MortgageCalculatorM.scss';
import extend from 'extend';
import {intRound} from '../../utils/Helpers';
import {
  filterCurrentProgramm, overallPayment, paymentMonth, monthPayment
} from '../../utils/mortgageHelpers';
import {minBy, round, isEmpty} from 'lodash';
import shallowEqual from 'fbjs/lib/shallowEqual';
import {priceCleanup, priceFormatter} from 'etagi-helpers';
import Button from 'react-bootstrap/lib/Button';
import Highcharts from 'react-highcharts';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMortgagePrograms} from '../../selectors/';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class MortgageCalculatorM extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    title: PropTypes.string,
    notice: PropTypes.string,
    noticeError: PropTypes.string,
    currency: PropTypes.object,
    mortgage: PropTypes.object
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      mortgage: {
        years: '',
        avanse: '',
        credit: '',
        overpayment: {
          preferPayment: '',
          payment: '',
          overallOverpayment: ''
        }
      },
      error: false,
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {mortgage: mortgageStore, currency} = props || this.props;
    const {info, percents} = mortgageStore.program;
    const {years, avanse, credit} = mortgageStore;
    const results = filterCurrentProgramm(
      percents, years, avanse, credit
    );

    if (isEmpty(results) ||
      (parseInt(info.min_sum) >= mortgageStore.credit &&
        mortgageStore.credit <= parseInt(info.max_sum))) {
      this.setState({
        error: true
      });
    } else {
      const overpayment = this.calculatePayment(
        results, years, avanse, credit, currency
      );
      const preferPayment = props.mortgage.overpayment &&
        props.mortgage.overpayment.preferPayment || overpayment.payment;
      const {percent, pref} = overpayment.currentTerms || '';
      const deltaPercent = round(percent - pref, 2);
      const pc = percent > deltaPercent ? deltaPercent : percent;
      const kp = paymentMonth(credit, parseFloat(pc), preferPayment);
      const newYears = round(kp / 12);

      overpayment.overallOverpayment = overallPayment(preferPayment,
        preferPayment > overpayment.payment ? kp / 12 : years) - credit;
      overpayment.newYears = newYears;
      overpayment.oldOverall = overallPayment(overpayment.payment, years) -
        credit;

      this.setState({
        mortgage: extend(true, {}, mortgageStore, {
          overpayment: overpayment
        }),
        error: false
      });
    }
  };

  handleChange = (event) => {
    const {currency} = this.props;
    const course = currency.nominal / currency.value;
    let value = priceCleanup(event.target.value) / course;

    if (value < this.state.mortgage.overpayment.payment) {
      value = this.state.mortgage.overpayment.payment;
    }
    if (value > this.state.mortgage.credit) {
      value = this.state.mortgage.credit;
    }
    this.props.actions.updateInObjectsState(
      ['mortgage', 'overpayment'],
      state => extend(true, {}, state, {preferPayment: value})
    );
    event && event.preventDefault();
  };

  calculatePayment = (results, years, avanse, credit, currency) => {
    let overpayment = {};

    if (results) {
      const maxPercent = minBy(results, p => p.percent);
      const course = currency.nominal / currency.value;
      const stepCurrency = intRound(1000 * course);
      const step = stepCurrency / course;
      const deltaPercent = maxPercent &&
        round(maxPercent.percent - maxPercent.pref, 2);
      const payment = monthPayment(
        deltaPercent, credit, years
      );

      const needUpdate = !shallowEqual({
        years: years,
        avanse: avanse,
        credit: credit,
      }, {
        years: this.state.mortgage.years,
        avanse: this.state.mortgage.avanse,
        credit: this.state.mortgage.credit,
      });

      if (needUpdate) {
        this.props.actions.updateInObjectsState(
          ['mortgage', 'overpayment'],
          state => extend(true, {}, state, {preferPayment: payment}));
      }

      overpayment = {
        payment: payment,
        currentTerms: maxPercent,
        step: step,
        stepCurrency: stepCurrency
      };
    }

    return overpayment;
  };

  increase = (event) => {
    const {payment, preferPayment, step} = this.state.mortgage.overpayment;
    let _payment;

    if (preferPayment && preferPayment > payment) {
      _payment = Math.ceil(preferPayment / step) * step + step;
    } else {
      _payment = Math.ceil(payment / step) * step;
    }

    this.props.actions.updateInObjectsState(
      ['mortgage', 'overpayment'],
      state => extend(true, {}, state, {preferPayment: _payment})
    );
    event && event.preventDefault();
  };

  decrease = (event) => {
    const {payment, preferPayment, step} = this.state.mortgage.overpayment;
    let _payment;
    const _preferPayment = parseInt(preferPayment) - step;

    if (_preferPayment < payment) {
      _payment = parseInt(payment);
    } else {
      _payment = Math.ceil(_preferPayment / step) * step;
    }

    this.props.actions.updateInObjectsState(
      ['mortgage', 'overpayment'],
      state => extend(true, {}, state, {preferPayment: _payment})
    );
    event && event.preventDefault();
  };

  get chartConfig() {
    const {overallOverpayment} = this.state.mortgage.overpayment;
    const {credit} = this.state.mortgage;

    return overallOverpayment && credit ? {
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        symbolPadding: 10,
        lineHeight: 40,
        itemMarginTop: 3,
        itemMarginBottom: 3
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        backgroundColor: 'transparent',
        plotShadow: false,
        height: 150
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          colors: [['#e57373', '#ef9a9a'], ['#e0e0e0', '#f5f5f5']].map(
            color => {
              return {
                radialGradient: {cx: 0.5, cy: 0.5, r: 0.7},
                stops: [[0.49, color[0]], [0.51, color[1]]]
              };
            }),
          allowPointSelect: true,
          cursor: 'pointer'
        }
      },
      credits: {
        enabled: false
      },
      tooltip: {
        backgroundColor: '#fff',
        borderWidth: 0,
        style: {
          color: '#333',
          zIndex: 60,
        },
        headerFormat: '<table>',
        pointFormat: '<tr><td style="text-align: right">' +
        '{point.name} <b>{point.percentage:.1f}%</b></td></tr>',
        footerFormat: '</table>'
      },
      series: [{
        type: 'pie',
        name: false,
        size: '100%',
        innerSize: '35%',
        dataLabels: false,
        data: [
          {name: 'Переплата', y: overallOverpayment},
          {name: 'Основной долг', y: credit},
        ]
      }],
    } : {};
  }

  render() {
    const {title, notice, currency, noticeError} = this.props;
    const {credit, overpayment} = this.state.mortgage;
    const {
      preferPayment, payment, overallOverpayment, newYears, oldOverall
    } = overpayment;
    const course = currency.nominal / currency.value;
    const payments = {
      preferPayment: Math.round(preferPayment * course),
      payment: Math.round(payment * course)
    };
    const formattedValue = priceFormatter(payments.preferPayment ?
      payments.preferPayment : payments.payment);
    const decreaseDisabled = payments && payments.preferPayment &&
      payments.preferPayment > payments.payment ? false : true;
    const economy = oldOverall - overallOverpayment;

    return (this.state.error ?
      (<div className={s.root}>
        <div className={s.calcTitle}>{title}</div>
        <div className={s.noticeError}>{noticeError}</div>
      </div>) :
      (<div className={s.root}>
        <div className={s.calcTitle}>{title}</div>
        <div className={s.calcNotice}>{notice}</div>
        <div className={s.calcWrap}>
          <Button onClick={this.decrease}
            disabled={decreaseDisabled}>-
          </Button>
          <div className={s.calcInput}>
            <input
              type="text"
              className={
                'form-control uinput-with-unit uinput-with-funny-placeholder'
              }
              value={formattedValue}
              onChange={this.handleChange}/>
            <span className='uinput-funny-placeholder'>
              {`Ежемесячный платеж, ${currency.symbol}`}
            </span>
          </div>
          <Button onClick={this.increase}>+</Button>
        </div>
        <div className={s.chartWrapper}>
          <div>
            <div>
              <div className={`${s.box} ${s.boxRed}`}/>
              <div className={s.boxTitle}>Переплата:</div>
              <div className={s.price}>
                <Price
                  price={priceFormatter(overallOverpayment)} /> <PriceUnit/>
              </div>
            </div>
            <div>
              <div className={`${s.box} ${s.boxGrey}`}/>
              <div className={s.boxTitle}>Основной долг:</div>
              <div className={s.price}>
                <Price price={priceFormatter(credit)} /> <PriceUnit />
              </div>
            </div>
          </div>
          <div><Highcharts config={this.chartConfig} /></div>
        </div>
        <div className={s.economyWrapper}>
          <div>
            <div>Срок кредита, лет</div>
            <div>{newYears}</div>
          </div>
          {economy > 0 ? (<div>
            <div>Ваша экономия, {currency.symbol}</div>
            <div className={s.economy}>
              <Price price={priceFormatter(economy)} />
            </div>
          </div>) : null}
        </div>
      </div>)
    );
  }
}

export default connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state),
      cityId: state.settings.get('cityId'),
      currency: state.ui.get('currency').toJS().current
    };
  },
  dispatch => {
    return {actions: bindActionCreators(
      {updateInObjectsState},
      dispatch
    )};
  }
)(MortgageCalculatorM);
