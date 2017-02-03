/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import OrderInput from './OrderInput';

/*global data*/

class OrderNhOneFieldSale extends Component {
  static propTypes = {
    id: React.PropTypes.string,
    fields: React.PropTypes.object,
    orderChange: React.PropTypes.func,
    handleSubmit: React.PropTypes.func,
    validate: React.PropTypes.object,
    value: React.PropTypes.object,
    headerTitle: React.PropTypes.string,
    footerTitle: React.PropTypes.string,
    submitName: React.PropTypes.string,
    text: React.PropTypes.string
  }

  render() {
    const {
        fields,
        orderChange,
        handleSubmit,
        validate,
        value,
        id,
        headerTitle,
        footerTitle

        } = this.props;

    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const numImportant = parseInt(form.important);
        const style = numImportant ? validate[form.field].style : '';

        const importantHtml = numImportant ?
                    <div className="input-group-addon orderImportant">*</div> :
                    null;


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
                    <div className=" clearfix">
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
                        </div>
                    );
      }
    });

    const text = this.props.submitName ?
        {__html: this.props.submitName} : {__html: 'Хочу скидку'};

    return (
      <section className="order--wrap">
       <div className="orderNhOneField zastr-order-parametrs">
        <h2 className="order-wrap-zastr-parametrs">
          {headerTitle}
        </h2>
       <form className="clearfix"
        onSubmit={handleSubmit}>
        <div className="col-md-7">
          <div>
            {forms}
          </div>
        </div>
        <div className="col-md-5">
          <button id={`submit_${id}`}
            type="submit"
            className="btn btn-green-mono"
            dangerouslySetInnerHTML={text} />
        </div>
        </form>
          <p>{footerTitle}</p>
        </div>
      </section>
    );
  }
}

export default OrderNhOneFieldSale;
