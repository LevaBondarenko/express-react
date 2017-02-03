import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {declOfNum} from 'etagi-helpers';
import s from './ModalFlatMain.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const ModalFlatMain = ({flat}) => {
  const {
    rooms,
    square,
    mortgageMin,
    price,
    price_discount: discount,
    price_metr: priceSqrt
  } = flat;

  return (
    <div className={s.modalFlatMain}>
      {!isNaN(mortgageMin) && mortgageMin > 0 ? (
        <Row>
          <Col xs={2} style={{width: '12%'}}>
            {rooms}
            <p>{declOfNum(rooms, ['комната', 'комнаты', 'комнат'])}</p>
          </Col>
          <Col xs={2} style={{width: '18%'}}>
            {square} м<sup>2</sup>
            <p>общая площадь</p>
          </Col>
          <Col xs={2} style={{width: '21%'}}>
            <Price price={mortgageMin}>&nbsp;<PriceUnit/></Price>
            <p>в ипотеку за месяц</p>
          </Col>
          <Col xs={3} style={{width: '20%'}}>
            <Price price={priceSqrt}>&nbsp;<PriceUnit/></Price>
            <p>Стоимость за м<sup>2</sup></p>
          </Col>
          <Col xs={3} style={{width: '28%'}}>
            {parseInt(price) > parseInt(discount) ? (
              <span style={{position: 'relative'}}>
                <span className={s.oldPrice}>
                  <Price price={price}>&nbsp;<PriceUnit/></Price>
                </span>
                <Price price={discount}>&nbsp;<PriceUnit/></Price>

              </span>
            ) : (
              <Price price={discount}>&nbsp;<PriceUnit/></Price>
            )}
            <p>стоимость</p>
          </Col>
        </Row>
        ) : (
          <Row>
            <Col xs={2}>
              {rooms}
              <p>{declOfNum(rooms, ['комната', 'комнаты', 'комнат'])}</p>
            </Col>
            <Col xs={3}>
              {square} м<sup>2</sup>
              <p>общая площадь</p>
            </Col>
            <Col xs={3}>
              <Price price={priceSqrt}>&nbsp;<PriceUnit/></Price>
              <p>Стоимость за м<sup>2</sup></p>
            </Col>
            <Col xs={4}>
              {parseInt(price) > parseInt(discount) ? (
                <span style={{position: 'relative'}}>
                  <span className={s.oldPrice}>
                    <Price price={price}>&nbsp;<PriceUnit/></Price>
                  </span>
                  <Price price={discount}>&nbsp;<PriceUnit/></Price>

                </span>
              ) : (
                <Price price={discount}>&nbsp;<PriceUnit/></Price>
              )}
              <p>стоимость</p>
            </Col>
          </Row>
        )}
    </div>
  );
};

ModalFlatMain. propTypes = {
  className: PropTypes.string,
  flat: PropTypes.object
};

export default withStyles(s)(ModalFlatMain);
