import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import s from './FormHeader.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';

const FormHeader = props => {
  const {booking} = props;

  return (
    <Row>
      <Col xs={12}>
        <Row className={classNames({
          [s.steps]: true,
          [s.stepsBooking]: booking
        })}>
          <Col xs={4}>
            {booking ? (
              <span className={s.bookingText}>
                <h3><span className={s.letter}>1.</span>
                Оставьте<br/> заявку</h3>
                <p>Теперь для резервирования жилья не
                надо ехать в центр продаж застройщика,
                достаточно просто оставить заявку</p>
              </span>
            ) : (
              <span>
                <i className={`${s.icon} ${s.order}`} />
                Выбираете нужное<br />
                для вас время и оставляете<br />
                ваш номер телефона
              </span>
            )}
          </Col>
          {!booking ? (
            <i className={`${s.iconAdditional} ${s.arrowUp}`} />
          ) : false}
          <Col xs={4}>
            {booking ? (
              <span className={s.bookingText}>
                <h3><span className={s.letter}>2.</span>
                Наш специалист<br/> свяжется с вами</h3>
                <p>Проверит информацию о бронировании
                и проконсультирует по всем вопросам.</p>
              </span>
            ) : (
              <span>
                <i className={`${s.icon} ${s.call}`} />
                Наш сотрудник<br />
                связывается<br />
                с вами
              </span>
            )}
          </Col>
          {!booking ? (
            <i className={`${s.iconAdditional} ${s.arrowDown}`} />
          ) : false}
          <Col xs={4}>
            {booking ? (
              <span className={s.bookingText}>
                <h3><span className={s.letter}>3.</span>
                Мы забронируем квартиру у застройщика</h3>
                <p>Проверим наличие свободной квартиры
                у застройщика и забронируем её для
                вас в течение получаса.</p>
              </span>
            ) : (
              <span>
                <i className={`${s.icon} ${s.preview}`} />
                Бесплатный просмотр<br />
                квартиры
              </span>
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

FormHeader.propTypes = {
  booking: PropTypes.bool
};

export default withStyles(s)(FormHeader);
