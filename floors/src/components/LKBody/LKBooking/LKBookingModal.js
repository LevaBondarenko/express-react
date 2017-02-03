/**
 * LK Booking Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import {phoneFormatter} from 'etagi-helpers';
import {map, size} from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ga from '../../../utils/ga';
const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

import s from './style.scss';

/*global data*/

class LKBookingModal extends Component {
  static propTypes = {
    event: PropTypes.string,
    phone: PropTypes.string,
    onClear: PropTypes.func,
    trackPay: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  onOk = () => {
    this.props.onClear(this.props.event);
    const {event} = this.props;

    switch (event) {
    case 'delete' :
      ga('button',
      'rent_online_LK_step1_Udalit_iz_spiska_popup_da_ya_uveren');
      break;
    case  'cancel' :
      ga('button',
        'rent_online_LK_step1_Otmenit_bronirovanie_popup_da_ya_uveren');
      break;
    case 'not_settle':
      ga('button',
         'rent_online_LK_step3_problemy_s_zaseleniem_popup_net_ya_sluchayno');
    default : null;
    }
  }

  onCancel = () => {
    this.props.onClear('userCancel');
    const {event} = this.props;

    switch (event) {
    case 'delete' :
      ga('button',
        'rent_online_LK_step1_Udalit_iz_spiska_popup_net_ya_sluchayno');
      break;
    case  'cancel' :
      ga('button',
        'rent_online_LK_step1_Otmenit_bronirovanie_popup_net_ya_sluchayno');
      break;
    case 'not_settle':
      ga('button',
          'rent_online_LK_step3_problemy_s_zaseleniem_popup_net_ya_sluchayno');
    default : false;
    }
  };

  trackPayOk = () => {
    ga('pageview', '_virtual_rent_online_LK_step1_oplata_proshla_uspeshno');
    this.trackPayOk = function() {
    };
  };

  trackPayFail = () => {
    ga('pageview', '_virtual_rent_online_LK_step1_oplata_oshibka');
    this.trackPayFail = function() {
    };
  };

  onClose = () => {
    this.props.onClear('userCancel');
  };

  render() {
    const {event, phone} = this.props;
    const needFormat = phone ?
      (phone.replace(/[^0-9+]*/g, '').substring(0, 4) !== '8800') : false;
    let show = true;
    let text, title, controls, track;

    switch(event) {
    case 'paymentOk':
      title = 'Оплата прошла успешно';
      text = 'С этого момента можете созвонится с собственником и заселяться.';
      controls = ['ok'];
      track = this.trackPayOk();
      break;
    case 'paymentFail':
      title = 'В процессе оплаты произошла ошибка';
      text = (
        <span>
          Попробуйте повторить оплату позднее или обратитесь в
          поддержку по телефону<br/>
          <span className={s.phoneInModal}>
            {needFormat ? phoneFormatter(
              phone,
              data.options.countryCode.current,
              data.options.countryCode.avail
            ) : phone}
          </span>
        </span>
      );
      controls = ['ok'];
      track = this.trackPayFail();
      break;
    case 'cancel':
      title = 'Отмена бронирования';
      text = 'Вы уверены, что хотите отменить бронирование?';
      controls = ['no', 'yes'];
      //track = null;
      break;
    case 'delete':
      title = 'Удаление бронирования';
      text = 'Вы уверены, что хотите полностью удалить бронирование?';
      controls = ['no', 'yes'];
      //track = null;
      break;
    case 'not_settle':
      title = 'Проблемы с заселением';
      text = 'У вас проблемы с заселением?';
      controls = ['no', 'yes'];
      //track = null;
      break;
    case 'select':
      title = 'Выбор нового бронирования';
      text = 'Выбрать это бронирование?';
      controls = ['no', 'yes'];
      track = null;
      break;
    default:
      show = false;
    }

    let list = map(controls, item => {
      let res;

      switch(item) {
      case 'ok':
        res = (
          <Button
            bsStyle='default'
            onClick={this.onOk}>
            Ok
          </Button>
        );
        break;
      case 'cancel':
        res = (
          <Button
            bsStyle='danger'
            onClick={this.onCancel}>
            Отмена
          </Button>
        );
        break;
      case 'yes':
        res = (
          <Button
            bsStyle='default'
            onClick={this.onOk}>
            Да, я уверен
          </Button>
        );
        break;
      case 'no':
        res = (
          <Button
            bsStyle='danger'
            onClick={this.onCancel}>
            Нет, я случайно
          </Button>
        );
        break;
      default:
        res = null;
      }
      return res;
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: <div/>});

    return show ? (
      <Modal
        className='lkform'
        show={show}
        onHide={this.onClose}>
          <ModalHeader closeButton></ModalHeader>
          <ModalBody>
            <div className="auth-form form-horizontal lkform-compose">
              <Row>
                <Col xs={12}>
                  <Row className='lkform-header'>
                    <Col xs={12} className='lkform-header-title'>
                      <span>{title}</span>
                      {track}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col xs={12} className='lkform-description'>{text}</Col>
              </Row>
              <Row>
                <Col xs={12}>{list}</Col>
              </Row>
            </div>
          </ModalBody>
          <ModalFooter/>
      </Modal>
    ) : null;
  }
}

export default withStyles(s)(LKBookingModal);
