/**
 * OverpaymentOrder stateless component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import s from './OverpaymentOrder.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Button from 'react-bootstrap/lib/Button';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import {priceFormatter} from 'etagi-helpers';
import {overallPayment, paymentMonth} from '../../../utils/mortgageHelpers';
import {round} from 'lodash';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import {phoneFormatter} from '../../../utils/Helpers';
/* global data*/

const OverpaymentOrder = (props) => {
  const {
    isAuthorized,
    userPhone,
    userName,
    handleChange,
    orderStatus,
    handleOrderSubmit
  } = props;
  const {credit, years} = props.mortgage;
  const {preferPayment, payment, currentTerms} = props.payments;
  const {percent, pref} = currentTerms;
  const oldOverall = overallPayment(payment, years);
  const deltaPercent = round(percent - pref, 2);
  const pc = percent > deltaPercent ? deltaPercent : percent;

  const kp = paymentMonth(credit, parseFloat(pc), preferPayment);

  const newOverallPayment = overallPayment(preferPayment, kp / 12);

  return (
    <div className={s.root}>
      <Row>
        <Col xs={8} xsOffset={2}>
        {orderStatus ? (
          <p className={s.succesText}>
            Ваша заявка на ипотеку успешно отправлена
            <span className={s.succesCheck}>
              <i className='fa fa-check' aria-hidden='true' />
            </span>
          </p>
        ) : (
          <div>
            <span className={s.orderText}>
              {preferPayment && preferPayment > payment ?
                (<span>
                  Сэкономить на ипотеке <span style={{color: '#43a047'}}>
                  <Price price={priceFormatter(
                      (oldOverall - credit) - (newOverallPayment - credit)
                    )}/> <PriceUnit/>
                  </span>
                </span>)  :
                'Отправить заявку на условия, предложенные банком.'}
            </span>
            <Row>
              <Col xs={12}>
              {isAuthorized ? (
                <Button
                  className={s.orderBtnAutorized}
                  onClick={handleOrderSubmit}>
                  Отправить заявку
                </Button>
              ) : (
                <div>
                  <FormGroup
                    className={s.formGroup}
                    controlId='userName'>
                    <ControlLabel className={s.label}>
                      <i className='fa fa-user' aria-hidden='true' />
                    </ControlLabel>
                    <FormControl type='text'
                      data-name='userName'
                      value={userName}
                      onChange={handleChange}
                      placeholder='Имя' />
                    <HelpBlock />
                  </FormGroup>
                  <FormGroup
                    className={s.formGroup}
                    controlId='userPhone'>
                    <ControlLabel className={s.label}>
                      <i className='fa fa-phone' aria-hidden='true' />
                    </ControlLabel>
                    <FormControl type='text'
                      data-name='userPhone'
                      value={phoneFormatter(
                        userPhone,
                        data.options.countryCode.current,
                        data.options.countryCode.avail
                      )}
                      onChange={handleChange}
                      placeholder='Телефон'/>
                  </FormGroup>
                  <Button
                    className={s.orderBtn}
                    onClick={handleOrderSubmit}>
                    Отправить заявку
                  </Button>
                </div>
              )}
              </Col>
            </Row>
          </div>
        )}
        </Col>
      </Row>
    </div>
  );
};

OverpaymentOrder.propTypes = {
  payments: PropTypes.object,
  mortgage: PropTypes.object,
  isAuthorized: PropTypes.bool,
  userPhone: PropTypes.string,
  userName: PropTypes.string,
  handleChange: PropTypes.func,
  orderStatus: PropTypes.bool,
  handleOrderSubmit: PropTypes.func,
};

export default withStyles(s)(OverpaymentOrder);
