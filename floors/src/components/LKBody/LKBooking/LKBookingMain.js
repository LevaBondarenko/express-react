/**
 * LK Booking Main component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './style.scss';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
//import Button from 'react-bootstrap/lib/Button';

class LKBookingMain extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: 'rent'
    };
  }

  render() {

    return (
      <div className={s.lkBodyBookingMain}>
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
                    Мы запустили сервис "Аренда онлайн", который поможет снять
                    недвижимость дешевле, чем обычно!
                  </div>
                </Col>
              </Row>
              <Row className='lkbody-advantages'>
                <Col xs={3} className='lkbody-advantages-item'>
                  <div className='lkbody-advantages-item-title'>
                    <i className='fa fa-bookmark' />
                  </div>
                  <span>Бронируйте понравившиеся варианты</span>
                </Col>
                <Col xs={3} className='lkbody-advantages-item'>
                  <div className='lkbody-advantages-item-title'>
                    <i className='fa fa-credit-card'/>
                  </div>
                  <span>Оплачивайте комиссию онлайн</span>
                </Col>
                <Col xs={3} className='lkbody-advantages-item'>
                  <div className='lkbody-advantages-item-title'>
                    <i className='fa fa-phone'/>
                  </div>
                  <span>Связывайтесь с собственником и заселяйтесь</span>
                </Col>
                {/* <Col xs={12} className='text-center'>
                  <Button
                    bsStyle='default'
                    href='#/myobjects/add'>
                    Подробнее об "Аренде онлайн"
                  </Button>
                </Col> */}
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withStyles(s)(LKBookingMain);
