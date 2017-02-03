/**
 * OverpaymenTable stateless component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OverpaymentTable.scss';
import Table from 'react-bootstrap/lib/Table';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {priceFormatter, declOfNum} from 'etagi-helpers';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import {overallPayment, paymentMonth} from '../../../utils/mortgageHelpers';
import {round} from 'lodash';

const OverpaymentTable = (props) => {
  const {credit, years} = props.mortgage;
  const {preferPayment, payment, currentTerms} = props.payments;
  const {percent, pref} = currentTerms;
  const oldOverall = overallPayment(payment, years);
  const deltaPercent = round(percent - pref, 2);
  const pc = percent > deltaPercent ? deltaPercent : percent;

  const kp = paymentMonth(credit, parseFloat(pc), preferPayment);

  const newYears = round(kp / 12);
  const newOverallPayment = overallPayment(preferPayment, kp / 12);
  const lessYears = years - newYears;

  return (
    <div className={s.root}>
      <Row>
        <Col xs={8} xsOffset={2}>
        {preferPayment && preferPayment > payment ? (
          <Table bordered condensed className={s.table}>
            <thead>
              <tr>
                <th colSpan={2}>Срок кредита</th>
                <th colSpan={2}>Переплата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {lessYears > 0 ? (
                  <td>
                    Всего:<br />
                    <b>
                      {newYears} {declOfNum(newYears, ['год', 'года', 'лет'])}
                    </b>
                  </td>
                ) : (
                  <td colSpan={2}>
                    Всего:<br />
                    <b>
                      {newYears} {declOfNum(newYears, ['год', 'года', 'лет'])}
                    </b>
                  </td>
                )}
                {lessYears > 0 ? (
                  <td className={s.greenCell}>
                    Меньше на:<br />
                    <b>
                      {lessYears} {declOfNum(lessYears, ['год', 'года', 'лет'])}
                    </b>
                  </td>
                ) : false}
                <td>
                  Всего:<br />
                  <b>
                    <Price price={priceFormatter(newOverallPayment - credit)}
                    /> <PriceUnit/>
                  </b>
                </td>
                <td className={s.greenCell}>
                  Экономия:<br />
                  <b>
                    <Price
                      price={priceFormatter(
                        (oldOverall - credit) - (newOverallPayment - credit)
                      )}
                      /> <PriceUnit/>
                  </b>
                </td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <Table bordered condensed className={s.table}>
            <thead>
              <tr>
                <th>Срок кредита</th>
                <th>Переплата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    {years} {declOfNum(years, ['год', 'года', 'лет'])}
                  </b>
                </td>
                <td>
                  <b>
                    <Price
                      price={priceFormatter(oldOverall - credit)}/> <PriceUnit/>
                  </b>
                </td>
              </tr>
            </tbody>
          </Table>
        )}
        </Col>
      </Row>
    </div>
  );
};

OverpaymentTable.propTypes = {
  payments: PropTypes.object,
  mortgage: PropTypes.object,
};

export default withStyles(s)(OverpaymentTable);
