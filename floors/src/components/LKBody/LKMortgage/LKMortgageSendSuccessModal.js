/**
 * LK Mortgage State Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './LKMortgageSendSuccessModal.scss';
import MortgageBroker from '../../MortgageBroker';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

const LKMortgageSendSuccessModal = ({
  ticketId, processingTime, onDismiss, context
}) => {

  return (
    <Modal
      className={s.root}
      show={true}
      onHide={onDismiss}>
      <ModalHeader closeButton className={s.header}>
        <span>
          Статус - <strong>Анкета отправлена на обработку.</strong>
        </span>
      </ModalHeader>
      <ModalBody>
        <div className={s.modalBody}>
          <div className={s.info}>
            <div className={s.content}>
              <span className={s.contentHeader}>
                Благодарим за уделенное время.
              </span>
              <span className={s.contentContent}>
                Ваш номер заявки:&nbsp;
                <span className={s.green}>{ticketId}</span>
                <br/>
                Примерное время обработки:&nbsp;
                <span className={s.green}>{processingTime}</span>
              </span>
            </div>
            <div className={s.footer}>
              <Button
                onClick={onDismiss}
                href='#/mortgage/'
                bsStyle='success'
                className='form-control'>
                <i className='fa fa-angle-left'/>&nbsp;
                Вернуться к списку программ
              </Button>
            </div>
          </div>
          <div className={s.broker}>
            <MortgageBroker
              context={context}
              template='inLKModal'/>
          </div>
        </div>
      </ModalBody>
      <ModalFooter/>
    </Modal>
  );
};

LKMortgageSendSuccessModal.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func,
  }),
  onDismiss: PropTypes.func.isRequired,
  ticketId: PropTypes.number.isRequired,
  processingTime: PropTypes.string.isRequired
};

export default withStyles(s)(LKMortgageSendSuccessModal);
