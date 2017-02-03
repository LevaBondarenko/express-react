/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import OrderInput from './OrderInput';
import OrderTitle from './OrderTitle';
import OrderNotice from './OrderNotice';

/*global data*/

class OrderFieldsInRow extends Component {
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
    colorButton: PropTypes.string,
    bgColor: PropTypes.string
  }

  render() {
    const {
      fields,
      orderChange,
      handleSubmit,
      validate,
      value,
      headerTitle,
      footerTitle,
      submitName,
      bgColor,
      colorButton,
      id
    } = this.props;

    const styleBgColor = {background: `${bgColor}`};
    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const numImportant = parseInt(form.important);
        const style = numImportant ? validate[form.field].style : '';
        const error = numImportant ? validate[form.field].error : '';

        const importantHtml = numImportant ?
          <div className="input-group-addon orderImportant">*</div> :
          null;

        const notice = numImportant && style === 'error' ?
          <p className='errorText'>{error}</p> : null;
        const styleHtml = numImportant ? style : '';

        const orderVal = form.field === 'phone' ?
          phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];


        const fieldClass = form.fieldClass ? form.fieldClass : '';
        const options = form.options || {};
        const input = (
          <div className="margin3 clearfix">
            <OrderInput type={form.type}
                        orderChange={orderChange}
                        options={options}
                        data-name={form.field}
                        data-error={styleHtml}
                        orderVal={orderVal}
                        placeholder={form.text}
                        fieldClass={fieldClass}
                        text={form.text} />
            {importantHtml}
          </div>);

        return fieldClass ? (
        {input}
        ) :
          (
            <div className='form-group' key={key}>
              {input}
              {notice}
            </div>
          );
      }
    });

    return (
      <div className="order-fieldsInRow" style={styleBgColor}>
        <OrderTitle widgetTitle = {headerTitle} />
        <OrderNotice notice_text={footerTitle} />
        <div className="widget--body">
          <form className="order-form clearfix"
                onSubmit={handleSubmit}>
            {forms}
            <div className="submitBtn">
              <button id={`submit_${id}`}
                      type="submit"
                      className={`btn margin--fix ${colorButton}`}>
                {submitName}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default OrderFieldsInRow;