/**
 * OverpaymentCalc stateless component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OverpaymentCalc.scss';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import {priceFormatter} from 'etagi-helpers';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import PriceUnit from '../../../shared/PriceUnit';

const OverpaymentCalc = ({payments, increase, decrease,
  reset, handleChange}) => {
  let formattedValue;

  if(payments && payments.preferPayment > payments.payment) {
    formattedValue = priceFormatter(payments.preferPayment);
  } else if(payments && payments.payment) {
    formattedValue = priceFormatter(payments.payment);
  }

  const decreaseDisabled = payments && payments.preferPayment &&
    payments.preferPayment > payments.payment ? false : true;

  return (
    <div className={s.root}>
      <Row>
        <Col xs={4} xsOffset={4} className='text-center'>
          <Row className={s.calcWrap}>
            <Col xs={3}>
              <Button onClick={decrease} disabled={decreaseDisabled}>-</Button>
            </Col>
            <Col xs={6} className={s.calcInput}>
              <p>Ежемесячный платеж</p>
              <FormGroup controlId='overpaymentInput'>
                <FormControl
                  type='text'
                  value={formattedValue}
                  onChange={handleChange} />
                  <div className={s.priceUnit}>
                    <PriceUnit />
                  </div>
              </FormGroup>
            </Col>
            <Col xs={3}>
              <Button onClick={increase}>+</Button>
            </Col>
          </Row>
          <a href='#' onClick={reset} className={s.calcReset}>
            <i className='fa fa-repeat' aria-hidden='true' />
            {' Вернуться к условиям банка'}
          </a>
        </Col>
      </Row>
    </div>
  );
};

OverpaymentCalc.propTypes = {
  payments: PropTypes.object,
  increase: PropTypes.func,
  decrease: PropTypes.func,
  reset: PropTypes.func,
  handleChange: PropTypes.func,
};

export default withStyles(s)(OverpaymentCalc);
