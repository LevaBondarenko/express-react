/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import OrderInput from './OrderInput';
import OrderNotice from './OrderNotice';

/*global data*/

class OrderMainPageOneField extends Component {
  static propTypes = {
    id: React.PropTypes.string,
    fields: React.PropTypes.object,
    orderChange: React.PropTypes.func,
    handleSubmit: React.PropTypes.func,
    validate: React.PropTypes.object,
    value: React.PropTypes.object,
    footerTitle: React.PropTypes.string,
    submitName: React.PropTypes.string
  }

  render() {
    const {
      fields,
      orderChange,
      handleSubmit,
      validate,
      value,
      footerTitle,
      id
      } = this.props;

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
            <div key={key}>
              {input}
              {notice}
            </div>
          );
      }
    });

    const text = this.props.submitName ?
    {__html: this.props.submitName} : {__html: 'Жду звонка'};

    return (
      <div className="orderMainPageOneField">
        <div className="container-wide">
          <form className="clearfix"
                onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-5">
                <strong>
                  <OrderNotice notice_text={footerTitle} />
                </strong>
              </div>
              <div className="col-md-3">
                {forms}
              </div>
              <div className="col-md-1"></div>
              <div className="col-md-3">
                <button id={`submit_${id}`}
                        type="submit"
                        className="btn btn-green-mono"
                        dangerouslySetInnerHTML={text} />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default OrderMainPageOneField;
