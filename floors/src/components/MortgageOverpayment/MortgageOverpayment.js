/**
 * MortgageOverpayment widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './MortgageOverpayment.scss';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import OverpaymentBanner from './OverpaymentBanner/';
import OverpaymentCalc from './OverpaymentCalc/';
import OverpaymentTable from './OverpaymentTable/';
import Button from 'react-bootstrap/lib/Button';
import Modal, {Header, Body, Footer} from 'react-bootstrap/lib/Modal';
import OverpaymentOrder from './OverpaymentOrder/';
import WidgetsActions from '../../actions/WidgetsActions'; //@todo: remove after Notify refactoring
import {
  priceCleanup, phoneCleanup, testPhone, priceFormatter
} from 'etagi-helpers';
import {intRound} from '../../utils/Helpers';
import mortgageHelpers from '../../utils/mortgageHelpers';
import extend from 'extend';
import {minBy, round, size, take, last, isEmpty} from 'lodash';
import userStore from '../../stores/UserStore';
import {postOrder} from '../../utils/requestHelpers';
import shallowEqual from 'fbjs/lib/shallowEqual';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMortgagePrograms} from '../../selectors/';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import {updateInUiState} from '../../actionCreators/UiActions';
import ContextType from '../../utils/contextType';

class MortgageOverpayment extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    path: PropTypes.string,
    actions: PropTypes.object,
    mortgage: PropTypes.object,
    overpaymentModal: PropTypes.bool,
    orderOverpayment: PropTypes.bool,
    cityId: PropTypes.number,
    currency: PropTypes.object
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      isAuthorized: false,
      userPhone: '',
      userName: '',
      error: false,
      mortgage: {
        overpayment: {}
      },
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    userStore.onChange(this.processProps);
  }

  componentDidMount() {
    this.props.actions.updateInUiState(['overpaymentModal'], () => (false));
  }

  componentWillUnmount() {
    userStore.offChange(this.processProps);
  }

  componentWillReceiveProps(nextProps) {
    this.onChange(nextProps.currency);
  }

  toggleOverpayment = () => {
    this.props.actions.updateInUiState(['overpaymentModal'], state => (!state));
  };

  calculatePayment = (results, years, avanse, credit, currency) => {
    let overpayment = {};

    if(results) {
      const maxPercent = minBy(results, p => p.percent);
      const course = currency.nominal / currency.value;
      const stepCurrency = intRound(1000 * course);
      const step = stepCurrency / course;

      const percent = maxPercent && round(maxPercent.percent, 2);
      const deltaPercent = maxPercent &&
        round(maxPercent.percent - maxPercent.pref, 2);
      const payment = mortgageHelpers.monthPayment(percent, credit, years);
      const paymentPref = mortgageHelpers.monthPayment(
        deltaPercent, credit, years
      );
      const betterPayment = paymentPref && payment > paymentPref ?
        paymentPref : payment;

      const needUpdate = !shallowEqual({
        years: years,
        avanse: avanse,
        credit: credit,
      }, {
        years: this.state.mortgage.years,
        avanse: this.state.mortgage.avanse,
        credit: this.state.mortgage.credit,
      });

      overpayment = {
        payment: betterPayment,
        currentTerms: maxPercent,
        step: step,
        stepCurrency: stepCurrency
      };

      if (needUpdate) {
        overpayment.preferPayment = betterPayment;
      }
    }

    return overpayment;
  };

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {isAuthorized} = this.state;
    const {mortgage: mortgageStore, currency} = props || this.props;
    const {info, percents} = mortgageStore.program;
    const {years, avanse, credit} = mortgageStore;
    const results = mortgageHelpers.filterCurrentProgramm(
      percents, years, avanse, credit
    );

    if(isEmpty(results) ||
      (parseInt(info.min_sum) >= mortgageStore.credit &&
        mortgageStore.credit <= parseInt(info.max_sum))) {
      this.setState({
        error: true
      });
    } else {
      const overpayment = this.calculatePayment(
        results, years, avanse, credit, currency
      );

      this.setState(() => isAuthorized ? {
        mortgage: extend(true, {}, mortgageStore, {
          overpayment: overpayment
        }),
        isAuthorized: userStore.get()['isAuthorized'],
        userPhone: userStore.get()['userInfo'].phone,
        userName: userStore.get()['userInfo'].i,
        error: false
      } : {
        mortgage: extend(true, {}, mortgageStore, {
          overpayment: overpayment
        }),
        isAuthorized: userStore.get()['isAuthorized'],
        error: false
      });
    }
  };

  increase = (event) => {
    const {payment, preferPayment, step} = this.state.mortgage.overpayment;

    let _payment;

    if(preferPayment && preferPayment > payment) {
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

    if(_preferPayment < payment) {
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

  handleChange = (event) => {
    const {currency} = this.props;
    const course = currency.nominal / currency.value;
    const value = priceCleanup(event.target.value) / course;

    this.props.actions.updateInObjectsState(
      ['mortgage', 'overpayment'],
      state => extend(true, {}, state, {preferPayment: value})
    );
    event && event.preventDefault();
  };

  reset = (event) => {
    const {payment} = this.state.mortgage.overpayment;

    this.props.actions.updateInObjectsState(
      ['mortgage', 'overpayment'],
      state => extend(true, {}, state, {preferPayment: payment})
    );
    event && event.preventDefault();
  };

  handleChangeOrder = (event) => {
    let value;

    if(event.target.dataset.name === 'userPhone') {
      value = phoneCleanup(event.target.value);
      value = size(value) > 12 ? take(value.split(''), 12).join('') : value;
    } else {
      value = event.target.value;
    }

    this.setState({
      [event.target.dataset.name]: value
    });
  };

  handleOrderSubmit = () => {
    const {userPhone, userName, mortgage} = this.state;
    const {payment, preferPayment} = mortgage.overpayment;
    const bankName = mortgage.overpayment.currentTerms.bank_name;
    const orderpayment = preferPayment && preferPayment > payment ?
      preferPayment : payment;
    const {currency} = this.props;
    const course = currency.nominal / currency.value;
    const paymentText =
      `${priceFormatter(Math.round(orderpayment * course))} ${currency.symbol}`;
    let programmId = this.props.path.split('/');

    programmId = last(programmId.filter(item => item !== ''));
    const orderData = {
      action: 'create_ticket',
      phone: userPhone,
      name: userName || 'не указано',
      message: `Заявка на ипотеку, клиент - имя: ${userName || 'не указано'}, телефон: ${userPhone}; Банк - ${bankName}, id программы - ${programmId}, желаемый платеж - ${paymentText}`, //eslint-disable-line
      source: 'Web',
      advanced_source: 'Program Page Mortgage Economy Calc', //eslint-disable-line
      type_id: 6,  //eslint-disable-line camelcase
      city_id: this.props.cityId,  //eslint-disable-line camelcase
    };
    const cleanedPhone = userPhone.replace(/[^0-9+]*/g, '')
      .replace('+8', '8')
      .replace('+7', '8');

    if((!cleanedPhone || !cleanedPhone.length) ||
      !testPhone(cleanedPhone, true)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      postOrder(orderData).then(response => {
        if (response.ok) {
          this.props.actions.updateInObjectsState(
            ['orderOverpayment'], () => (true));
        } else {
          this.errorNotify();
        }
      }).catch(() => {
        this.errorNotify();
      });
    }
  };

  errorNotify = () => {
    WidgetsActions.set('notify',[{
      msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
      type: 'dang'
    }]);
  };

  render() {
    const {currency} = this.props;
    const {step, preferPayment, payment} = this.state.mortgage.overpayment;
    const stepBlock = <Price price={step}> <PriceUnit/></Price>;
    const course = currency.nominal / currency.value;
    const overpaymentForCalc = {
      preferPayment: Math.round(preferPayment * course),
      payment: Math.round(payment * course)
    };

    return (
      <div className={s.root}>
        <OverpaymentBanner
          error={this.state.error}
          step={stepBlock}>
          <div className='clearfix'>
            <Button
              className='pull-right'
              onClick={this.toggleOverpayment}>
              Пересчитать
            </Button>
          </div>
        </OverpaymentBanner>
        {!this.state.error ? (
          <Modal
            show={this.props.overpaymentModal}
            onHide={this.toggleOverpayment}
            className={s.modal}>
            <Header className={s.header} closeButton />
            <Body className={s.body}>
              <h3>Калькулятор экономии</h3>
              <p>
                Прибавляйте к своему ежемесячному платежу по <b>{stepBlock}</b>
                <br />
                и смотрите, как изменятся условия погашения кредита.
              </p>
              <OverpaymentCalc
                payments={overpaymentForCalc}
                increase={this.increase}
                decrease={this.decrease}
                reset={this.reset}
                handleChange={this.handleChange}/>
              <OverpaymentTable
                payments={this.state.mortgage.overpayment}
                mortgage={this.state.mortgage} />
            </Body>
            <Footer className={s.footer}>
              <OverpaymentOrder
                isAuthorized={this.state.isAuthorized}
                payments={this.state.mortgage.overpayment}
                mortgage={this.state.mortgage}
                userPhone={this.state.userPhone}
                userName={this.state.userName}
                handleChange={this.handleChangeOrder}
                handleOrderSubmit={this.handleOrderSubmit}
                orderStatus={this.props.orderOverpayment} />
            </Footer>
          </Modal>
        ) : false}
      </div>
    );
  }

}

export default connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state),
      orderOverpayment: state.objects.get('orderOverpayment'),
      overpaymentModal: state.ui.get('overpaymentModal'),
      cityId: state.settings.get('cityId'),
      currency: state.ui.get('currency').toJS().current
    };
  },
  dispatch => {
    return {actions: bindActionCreators(
      {updateInUiState, updateInObjectsState},
      dispatch
    )};
  }
)(MortgageOverpayment);
