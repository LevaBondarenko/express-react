/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {phoneFormatter} from '../../utils/Helpers';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Modal from 'react-bootstrap/lib/Modal';
import classNames from 'classnames';

const ModalBody = Modal.Body;

/*global data*/

class OrderModal extends Component {
  static propTypes = {
    id: React.PropTypes.string,
    fields: React.PropTypes.object,
    orderChange: React.PropTypes.func,
    handleSubmit: React.PropTypes.func,
    validate: React.PropTypes.object,
    value: React.PropTypes.object,
    headerTitle: React.PropTypes.string,
    footerTitle: React.PropTypes.string,
    colorButton: React.PropTypes.string,
    submitName: React.PropTypes.string,
    text: React.PropTypes.string,
    url: React.PropTypes.string,
    showBtn: React.PropTypes.string
  };

  static defaultProps = {
    url: 'register'
  }

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showButton: true
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.onHashChange);
    this.onHashChange();
  }

  hideButton =() => {
    this.setState(
        () => ({showButton: false})
    );
  }

  openModal = () => {
    this.setState(
      () => ({showModal: true})
    );
  }

  closeModal = () => {
    this.setState(
      () => ({showModal: false})
    );
  }

  onHashChange = () => {
    const hash = canUseDOM && window.location.hash ?
        window.location.hash.replace('#', '') : null;
    const {url} = this.props;

    if(hash === (url ? url : 'showorder')) {
      window.location.hash = '';
      this.openModal();
      this.hideButton();
    }
  }

  render() {
    const {showModal} = this.state;

    const openModal = this.openModal.bind(this);
    const closeModal = this.closeModal.bind(this);
    const {
      handleSubmit,
      orderChange,
      colorButton,
      submitName,
      headerTitle,
      text, validate, value, fields, id
    } = this.props;

    const forms =  map(fields, (form, key) => {
      const {field, text} = form;

      const numImportant = parseInt(form.important);
      const error = numImportant ? validate[field].error : '';
      const importantHtml = numImportant ?
          <div className="input-group-addon orderImportant">*</div> :
          null;
      const notice = numImportant &&
        validate[field].style === 'error' ?
          <p className='errorText'>{error}</p> : null;
      const orderVal = field === 'phone' ?
          phoneFormatter(
            value[field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[field];

      return (
        <Row key={key}>
          <Col md={4}>
            <label className="orderLabel">{text}</label>
          </Col>
          <Col md={8} className="form-group">
            <div className="margin3 clearfix">
              <input
                  type="text"
                  onChange={orderChange}
                  value={orderVal}
                  data-name={field}
                  className='form-etagi form-bordered w100'
              />
              {importantHtml}{notice}
            </div>
          </Col>
        </Row>
      );
    });
    const btnClass = classNames(
      'order-text-modal btn',
      {[colorButton]: colorButton ? true : false}
    );

    return (
      <div className="order--modal">
        {this.props.showBtn !== '1' ?
        <div className="col-md-12" style={{paddingRight: '0'}}>
          <button className={btnClass}
                  onClick={openModal}>
            {submitName}
          </button>
        </div> : null}
        <Modal
          className='form-opencity form-opencity-modal'
          onHide={closeModal}
          show={showModal}
        >
          <ModalBody>
            <button className="etagi--closeBtn btn-lg"
                    type="button"
                    onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h2>{headerTitle}</h2>
            <form className="order-modal-form clearfix" onSubmit={handleSubmit}>
              {forms}
              <button id={`submit_${id}`}
                      type="submit"
                      className={btnClass}>{submitName}</button>
              <div className="text-center notice--text">{text}</div>
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default OrderModal;
