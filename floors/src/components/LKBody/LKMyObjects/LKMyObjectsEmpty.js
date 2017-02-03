/**
 * LK MyObjects empty page
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import HelpIcon from '../../../shared/HelpIcon';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ga from '../../../utils/ga';

class LKMyObjectsEmpty extends Component {
  constructor(props) {
    super(props);
  }

  trackEvent = () => {
    ga('click', 'lk_myobjects_dobavit_nedvizhimost');
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <div className='lkbody-favorites'>
            <Row>
              <Col xs={12}>
                <div className='lkbody-pagetitle'>
                  Мои Объекты
                  <HelpIcon
                    placement='top'
                    helpText='Это хелп для Моих объектов'/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className='lkbody-very-big-icon'>
                  <div className='main-icon'>
                    <img src='https://cdn-media.etagi.com/static/site/7/7b/7bb9554d3307e526d344a7d32849e0554e1db8f4.png'/>
                  </div>
                </div>
                <div className='text-center'>
                  Вы пока не опубликовали ни одного объявления о продаже или
                  аренде.
                </div>
              </Col>
            </Row>
            <Row className='lkbody-advantages'>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-ruble'>
                    <i className='fa fa-calculator back'/>
                  </i><br/>
                  <span>Получите оценку</span>
                </div>
                <span>Рыночной стоимости своей недвижимости - бесплатно</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-bar-chart'/><br/>
                  <span>Управляйте</span>
                </div>
                <span>процессом продажи или аренды</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-gavel'/><br/>
                  <span>Следите за спросом</span>
                </div>
                <span>на Вашу недвижимость и участвуйте в торгах!</span>
              </Col>
              <Col xs={12} className='text-center'>
                <Button
                  bsStyle='default'
                  href='#/myobjects/add'
                  onClick={this.trackEvent}>
                  Добавить свою недвижимость
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default LKMyObjectsEmpty;
