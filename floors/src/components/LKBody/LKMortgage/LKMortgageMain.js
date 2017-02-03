/**
 * LK Mortgage Main component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import LKMortgageInOffice from './LKMortgageInOffice';
import s from './style.scss';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
//import Button from 'react-bootstrap/lib/Button';

const LKMortgageMain = ({selectedCity}) => {

  return (
    <div className={s.lkBodyMortgageMain}>
      <Row>
        <Col xs={12}>
          <div className='lkbody-favorites'>
            <Row>
              <Col xs={12}>
                <div className='lkbody-very-big-icon'>
                  <div className='main-icon'>
                    <img src='https://cdn-media.etagi.com/static/site/4/46/466282796e3bdfc7a93ecaee26ab5f3f3801fa10.png'/>
                  </div>
                </div>
                <div className='text-center'>
                  Мы запустили сервис "Ипотека онлайн", который позволит
                  оформить ипотеку не выходя из дома
                </div>
              </Col>
            </Row>
            <Row className='lkbody-advantages'>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-bank' />
                </div>
                <span>
                  Поможем сэкономить до 400 000 рублей! Скидки на ставки по
                  ипотеке до 0,5%
                </span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-comments-o'/>
                </div>
                <span>
                  Бесплатно подберем выгодную программу и оформим ипотеку
                </span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-file-text-o'/>
                </div>
                <span>
                  С нами одобряемость ипотеки выше на 20%
                </span>
              </Col>
            </Row>
          </div>
          <LKMortgageInOffice selectedCity={selectedCity} />
        </Col>
      </Row>
    </div>
  );
};

LKMortgageMain.propTypes = {
  selectedCity: PropTypes.object
};

export default withStyles(s)(LKMortgageMain);
