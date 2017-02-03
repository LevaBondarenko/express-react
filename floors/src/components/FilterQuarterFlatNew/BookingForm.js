import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import s from './BookingForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {phoneFormatter} from '../../utils/Helpers';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import FormHeader from './FormHeader';
import wss from '../../stores/WidgetsStateStore';

/*global data*/

const BookingForm = ({flat, handleBookingSubmit, handleChange, ...state}) => {

  return (
    <div className={s.root}>
      <FormHeader booking={true} />
      <Row>
        <Col xs={12}>
          <h3>Забронируйте эту квартиру</h3>
          <Row className={s.summary}>
            <Col xs={12}>
              <p>Тип: {flat.rooms}-комнатная</p>
              <p>Общая площадь: {flat.square} м<sup>2</sup></p>
              <p>Этаж: {flat.floor} / Подъезд: {flat.section}</p>
            </Col>
          </Row>
          <Row className={s.orderForm}>
            <Col xs={6} xsOffset={3}>
              <div className={s.orderWrap}>
                <form onSubmit={handleBookingSubmit}>
                  <FormGroup controlId='formName' >
                    <FormControl
                      type='text'
                      value={state.name}
                      data-name='name'
                      placeholder='Ваше имя'
                      onChange={handleChange} />
                  </FormGroup>
                  <FormGroup controlId='formPhone' >
                    <FormControl
                      type='text'
                      value={phoneFormatter(
                        state.phone,
                        data.options.countryCode.current,
                        data.options.countryCode.avail
                      )}
                      data-name='phone'
                      placeholder='Введите номер телефона'
                      onChange={handleChange} />
                  </FormGroup>
                  <FormGroup>
                    <Button type='submit'
                      className='btn btn-green-mono'>
                      Забронировать квартиру
                    </Button>
                  </FormGroup>
                </form>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <p className={s.bookingNotice}>
                Если у вас возникли вопросы, звоните по номеру <b>
                  {wss.get('selectedCity').office_phone}
                </b>
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

BookingForm.propTypes = {
  flat: PropTypes.object.isRequired,
  handleBookingSubmit: PropTypes.func,
  handleChange: PropTypes.func,
};

export default withStyles(s)(BookingForm);
