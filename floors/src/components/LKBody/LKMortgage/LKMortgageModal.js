/**
 * LK Mortgage Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map, size} from 'lodash';

import s from './style.scss';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

const LKMortgageModal = (props) => {
  const {action, onClear, onOk} = props;
  let title = null, text = null, controls = null, show = true;

  switch(action) {
  case 'refuse':
    title = 'Отказ';
    text = 'Хотите отказаться от отправки заявки в этот банк?';
    controls = ['no', 'yes'];
    break;
  case 'delete':
    title = 'Удаление';
    text = (
      <span>
        Хотите удалить программу из списка<br/>
        (данные этой программы будут потеряны)?
      </span>
    );
    controls = ['no', 'yes'];
    break;
  case 'profileError':
    title = 'Отправка анкеты';
    text = (
      <span>
        Анкета заполнена с ошибками, перейдите к шагам, помеченным красными
        точками, и устраните ошибки заполнения анкеты.
      </span>
    );
    controls = ['ok'];
    break;
  default:
    show = false;
  }

  let controlsBlock = map(controls, item => {
    let res;

    switch(item) {
    case 'ok':
      res = (
        <Button
          bsStyle='default'
          onClick={onOk}>
          Ok
        </Button>
      );
      break;
    case 'cancel':
      res = (
        <Button
          bsStyle='danger'
          onClick={onClear}>
          Отмена
        </Button>
      );
      break;
    case 'yes':
      res = (
        <Button
          bsStyle='default'
          onClick={onOk}>
          Да, я уверен
        </Button>
      );
      break;
    case 'no':
      res = (
        <Button
          bsStyle='danger'
          onClick={onClear}>
          Нет, я случайно
        </Button>
      );
      break;
    default:
      res = null;
    }
    return res;
  });

  controlsBlock = size(controlsBlock) > 0 ?
    createFragment({controlsBlock: controlsBlock}) :
    createFragment({controlsBlock: <div/>});

  return (
    <Modal
      className='lkform'
      show={show}
      onHide={onClear}>
        <ModalHeader closeButton></ModalHeader>
        <ModalBody>
          <div className="auth-form form-horizontal lkform-compose">
            <Row>
              <Col xs={12}>
                <Row className='lkform-header'>
                  <Col xs={12} className='lkform-header-title'>
                    <span>{title}</span>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className='lkform-description'>{text}</Col>
            </Row>
            <Row>
              <Col xs={12}>{controlsBlock}</Col>
            </Row>
          </div>
        </ModalBody>
        <ModalFooter/>
    </Modal>
  );
};

LKMortgageModal.propTypes = {
  onClear: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired
};

export default withStyles(s)(LKMortgageModal);
