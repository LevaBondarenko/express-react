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

class OrderIpoteka extends Component {
  static propTypes = {
    id: PropTypes.string,
    fields: PropTypes.object,
    orderChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    validate: PropTypes.object,
    value: PropTypes.object,
    headerTitle: PropTypes.string,
    footerTitle: PropTypes.string,
    submitName: PropTypes.string
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
      id
      } = this.props;

    let firstInput;
    let countFields = 0;

    map(fields, form => {
      if (form.field !== '0') {
        countFields++;
      }
    });

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

        let orderClassCol;

        // первый элемент формы сдвигаем в центр добавлением класса col-md-offset-2
        if (!firstInput && countFields < 3) {
          orderClassCol = 'col-md-offset-2 col-md-3 form-group';
          firstInput = key;
        } else {
          orderClassCol = 'col-md-3 form-group';
        }

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
          <div className={orderClassCol} key={key}>
            {input}
            {notice}
          </div>
        );
      }
    });

    return (
      <div className="order-bg">
        <div className="container-wide clearfix widget--wrap__bg">
          <OrderTitle widgetTitle = {headerTitle} />
          <div className="widget--body">
            <div className="row">
              <form className="order-form clearfix"
                    onSubmit={handleSubmit}>
                {forms}
                <button id={`submit_${id}`}
                        type="submit"
                        className="col-md-2 btn btn-green margin--fix">
                  {submitName ? submitName : 'Жду звонка'}
                </button>
              </form>
            </div>
            <OrderNotice notice_text={footerTitle} />
          </div>
        </div>
      </div>
    );
  }
}

export default OrderIpoteka;
