/**
 * MortgageConditions widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import ContextType from '../../utils/contextType';
import s from './MortgageConditions.scss';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {priceFormatter} from 'etagi-helpers';
import shallowCompare from 'react-addons-shallow-compare';
import mortgageHelpers from '../../utils/mortgageHelpers';
import Highcharts from 'react-highcharts';
import {isEmpty} from 'lodash';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {getMortgagePrograms} from '../../selectors/';

class MortgageConditions extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    mortgageStore: PropTypes.object
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
      },
      payments: {
        payment: '',
        economyPref: '',
        overallOverpayment: '',
      }
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.processProps(this.props);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {mortgageStore} = props;
    const {info, percents: currentProgram} = mortgageStore.program;

    if(mortgageStore) {
      const results = currentProgram &&
        mortgageHelpers.filterCurrentProgramm(
          currentProgram,
          mortgageStore.years,
          mortgageStore.avanse,
          mortgageStore.credit
        );

      if(isEmpty(results) ||
        (parseInt(info.min_sum) >= mortgageStore.credit &&
          mortgageStore.credit <= parseInt(info.max_sum))) {
        this.setState({
          error: true
        });
        const el = document.getElementsByClassName('overpaymentSwitch')[0];

        el.style = 'display:none;';
      } else {
        let payments = this.state.payments;

        if(results) {
          payments = mortgageHelpers.calculatePayment(
            results,
            mortgageStore.years,
            mortgageStore.avanse,
            mortgageStore.credit
          );
        }
        const el = document.getElementsByClassName('overpaymentSwitch')[0];

        el.style = 'display:block;';
        this.setState({
          mortgage: mortgageStore,
          payments: payments,
          error: false
        });
      }
    }
  };

  get chartConfig() {
    const {overallOverpayment} = this.state.payments;
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
        height: 200
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
    const {payment, economyPref, overallOverpayment} = this.state.payments;
    const {credit} = this.state.mortgage;

    return (
      <div className={s.root}>
        {this.state.error ? (
          <Row>
            <Col xs={9} className={s.errorWrap}>
              <Row>
                <Col xs={2}>
                  <span className={s.errorIcon}>!</span>
                </Col>
                <Col xs={10} className={s.errorText}>
                  <h3>Ошибка</h3>
                  <p>
                    Указанные в калькуляторе значения не соответствуют<br />
                    условиям выбранной ипотечной программы
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : (
          <div>
            <Col xs={8}>
              <Row>
                <Col xs={6} className={s.termItem}>
                  Ежемесячный платеж: <br/>
                  <span className={s.price}>
                    <Price price={priceFormatter(payment)} /> <PriceUnit />
                  </span>
                </Col>
                <Col xs={6} className={s.termItem}>
                  <span className={`${s.box} ${s.boxGrey}`}/> Основной долг:
                  <br/>
                  <span className={s.price}>
                    <Price price={priceFormatter(credit)} /> <PriceUnit />
                  </span>
                </Col>
              </Row>
              <Row>
                {economyPref && economyPref > 0 ? (
                  <Col xs={6} className={`${s.termItem} ${s.economyPref}`}>
                    Ваша экономия с Этажами: <br />
                    <span className={s.price}>
                      <Price price={priceFormatter(economyPref)} /> <PriceUnit/>
                    </span>
                  </Col>
                ) : <Col xs={6} />}
                <Col xs={6} className={s.termItem}>
                  <span className={`${s.box} ${s.boxRed}`}/> Переплата: <br />
                  <span className={s.price}>
                    <Price
                      price={priceFormatter(overallOverpayment)} /> <PriceUnit/>
                  </span>
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <div style={{position: 'relative', margin: '0 -1.5rem'}}>
                <p className={s.creditLabel}>Основной<br />долг</p>
                <p className={s.overpaymentLabel}>Переплата</p>
                <Highcharts config={this.chartConfig} />
              </div>
            </Col>
          </div>
        )}
      </div>
    );
  }

}

export default connect(
  state => {
    return {
      mortgageStore: getMortgagePrograms(state)
    };
  }
)(MortgageConditions);
