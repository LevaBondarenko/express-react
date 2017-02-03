import React, {PropTypes} from 'react';
import Modal, {Header, Body, Footer} from 'react-bootstrap/lib/Modal';
import {last, size, dropRight, isArray} from 'lodash';
import s from './ModalWindow.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';

const ModalWindow = (props) => {
  const {show, onHide, children, className} = props;

  return (
    <Modal
      show={show}
      onHide={onHide}
      className={classNames(s.modal, className)}>
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

ModalWindow.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  children: PropTypes.any,
  className: PropTypes.string
};

export default withStyles(s)(ModalWindow);
