import React, {PropTypes} from 'react';
import Modal, {Header, Body, Footer} from 'react-bootstrap/lib/Modal';
import {last, size, dropRight, isArray} from 'lodash';
import s from './MortgageBrokerModal.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const MortgageBrokerModal = (props) => {
  const {show, onHide, children} = props;

  return (
    <Modal show={show} onHide={onHide} className={s.modal}>
      <Header className={s.header} closeButton />
      <Body className={s.body}>
        {isArray(children) && size(children) > 1 ?
            dropRight(children) : children}
      </Body>
      {isArray(children) && size(children) > 1 ? (
        <Footer className={s.footer}>
          {last(children)}
        </Footer>
      ) : false }
    </Modal>
  );
};

MortgageBrokerModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  children: PropTypes.any,
};

export default withStyles(s)(MortgageBrokerModal);
