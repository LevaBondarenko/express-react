/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import OrderInput from './OrderInput';

/*global data*/

class OrderYarmarka extends Component {
  static propTypes = {
    id: PropTypes.string,
    fields: PropTypes.object,
    text: PropTypes.string,
    orderChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    validate: PropTypes.object,
    value: PropTypes.object,
    headerTitle: PropTypes.string.isRequired,
    footerTitle: PropTypes.string,
    colorButton: PropTypes.string,
    bgColor: PropTypes.string,
    bgUrlColor: PropTypes.string,
    descColor: PropTypes.string,
    submitName: PropTypes.string,
    titleColor: PropTypes.string
  }

  render() {
    const {
      orderChange,
      handleSubmit,
      validate,
      value,
      fields,
      headerTitle,
      footerTitle,
      text,
      colorButton,
      bgColor,
      bgUrlColor,
      descColor,
      titleColor,
      submitName,
      id
    } = this.props;

    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const numImportant = parseInt(form.important);
        const style = numImportant ? validate[form.field].style : '';
        const styleHtml = numImportant ? style : '';

        const orderVal = form.field === 'phone' ?
          phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];

        return (
          <Col key={key} md={4} className="form-group">
            <div className="margin3 clearfix">
              <OrderInput type={form.type}
                          orderChange={orderChange}
                          data-name={form.field}
                          data-error={styleHtml}
                          ref='input'
                          className='form-etagi col-md-10 form-bordered'
                          orderVal={orderVal}
                          placeholder={form.text}
                          text={form.text}/>
            </div>
          </Col>
        );
      }
    });

    const bgUrl = bgUrlColor ? `url("${bgUrlColor}") no-repeat center top` : '';
    const styleBgColor = {'background': `${bgColor} ${bgUrl}`};
    const styleTitleColor = {'color': titleColor};
    const styleDescColor = {'color': descColor};
    const colorBtn = `col-md-10 btn margin--fix ${colorButton}`;
    const imageTag = <img src='//cdn-media.etagi.com/static/site/b/b8/b8b39ca09a3fd9df0b9513df3d58e82ecfab3dee.png'/>; //eslint-disable-line max-len

    return (
      <div className="order_call" style={styleBgColor}>
        <div className="container-wide">
          <form className="order-form clearfix" onSubmit={handleSubmit}>
            <Row>
              <div className="col-md-1">
                {imageTag}
              </div>
              <Col md={10}>
                <Row>
                  <Col md={4}>
                    <h2 style={styleTitleColor}>{headerTitle}</h2>
                  </Col>
                  <Col md={8}>
                    <p  style={styleDescColor}>{footerTitle}</p>
                  </Col>
                </Row>
                <Row>
                  {forms}
                  <Col md={4} className="form-group">
                    <button id={`submit_${id}`}
                            type='submit'
                            className={colorBtn}>
                      {submitName ? submitName : 'Отправить'}
                    </button>
                  </Col>
                </Row>
              </Col>
            </Row>
            <div className="text-center notice--text">{text}</div>
          </form>
        </div>
      </div>
    );
  }
}

export default OrderYarmarka;
