/**
 * LK Booking help
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {phoneFormatter} from 'etagi-helpers';
import s from './LKBookingHelp.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/*global data*/

const LKBookingHelp = ({phone, ticketId = false}) => {
  const needFormat = phone.replace(/[^0-9+]*/g, '').substring(0, 4) !== '8800';

  return (
    <div className={s.root}>
      <Row>
        <Col xs={1} style={{padding: 0}}>
          <div className={s.consultWrap} />
        </Col>
        <Col xs={11}>
          <div className={s.quoteBlock}>
            <p>
              Если у вас возникли вопросы, звоните по номеру
              <b> {needFormat ?
                phoneFormatter(phone,
                data.options.countryCode.current,
                data.options.countryCode.avail
              ) : phone}</b>
              {ticketId ? (
                <span> и назовите номер бронирования <b>{ticketId}</b></span>
              ) : false}
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

LKBookingHelp.propTypes = {
  phone: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  ticketId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number
  ])
};

export default withStyles(s)(LKBookingHelp);
