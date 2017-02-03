/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';

const ModalBody = Modal.Body;

/*global data*/

class OrderOpenCity extends Component {
  static propTypes = {
    id: PropTypes.string,
    fields: PropTypes.object,
    orderChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    validate: PropTypes.object,
    value: PropTypes.object,
    headerTitle: PropTypes.string,
    footerTitle: PropTypes.string,
    submitName: PropTypes.string,
    text: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  openModal() {
    const state = this.state;

    state.showModal = true;

    this.setState(state);
  }

  closeModal() {
    const state = this.state;

    state.showModal = false;

    this.setState(state);
  }

  render() {
    const {showModal} = this.state;
    const openModal = this.openModal.bind(this);
    const closeModal = this.closeModal.bind(this);
    const {
      orderChange,
      handleSubmit,
      validate,
      value,
      fields,
      headerTitle,
      text,
      submitName,
      id
      } = this.props;
    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const numImportant = parseInt(form.important);
        let style = numImportant ? validate[form.field].style : '';
        const error = numImportant ? validate[form.field].error : '';

        const importantHtml = numImportant ?
          <div className="input-group-addon orderImportant">*</div> :
          null;

        const notice = numImportant && style === 'error' ?
          <p className='errorText'>{error}</p> : null;

        const orderVal = form.field === 'phone' ?
          phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];

        style = `form-etagi col-md-10 form-bordered w100 ${style}`;

        return (
          <Row key={key}>
            <Col md={4}>
              <label className="orderLabel">{form.text}</label>
            </Col>
            <Col md={8} className="form-group">
              <div className="margin3 clearfix">
                <input
                  type="text"
                  onChange={orderChange}
                  value={orderVal}
                  data-name={form.field}
                  className={style}
                />
                {importantHtml}{notice}
              </div>
            </Col>
          </Row>
        );
      }
    });

    return (
      <div className="order--openCity">
        <Button
          ref='loginButton'
          bsStyle='link'
          className="btn-red"
          onClick={openModal}>
          {submitName ? submitName : 'Сообщить мне об открытии'}
        </Button>
        <Modal
          className='form-opencity'
          onHide={closeModal}
          show={showModal}
        >
          <ModalBody
            closeButton>
            <button className="etagi--closeBtn btn-lg"
                    type="button"
                    onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h2>{headerTitle}</h2>
            <form className="order-form clearfix" onSubmit={handleSubmit}>
                {forms}
                <button style={{width: '100%'}}
                        id={`submit_${id}`}
                        type="submit"
                        className="btn-red btn">
                  {submitName ? submitName : 'Присоединиться к нам'}
                </button>
                <div className="text-center notice--text">{text}</div>
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default OrderOpenCity;
