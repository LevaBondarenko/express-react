/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import OrderInput from './OrderInput';

/*global data*/

class OrderIpotekaLanding extends Component {
  static propTypes = {
    id: React.PropTypes.string,
    fields: React.PropTypes.object,
    orderChange: React.PropTypes.func,
    handleSubmit: React.PropTypes.func,
    validate: React.PropTypes.object,
    value: React.PropTypes.object,
    headerTitle: React.PropTypes.string,
    submitName: React.PropTypes.string
  }

  render() {
    const {
      fields,
      orderChange,
      handleSubmit,
      validate,
      value,
      headerTitle,
      submitName,
      id
    } = this.props;

    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const numImportant = parseInt(form.important);
        const orderVal = form.field === 'phone' ?
          phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];
        const style = numImportant ? validate[form.field].style : '';
        const error = numImportant ? validate[form.field].error : '';
        const importantHtml = numImportant ?
          <div className="input-group-addon orderImportant">*</div> :
          null;
        const notice = numImportant && style === 'error' ?
          <p className='errorText'>{error}</p> : null;
        const styleHtml = numImportant ? style : '';

        return (
          <div key={key} className="form-group main-page-form-group">
            <div className="margin3 clearfix">
              <OrderInput type={form.type}
                          orderChange={orderChange}
                          data-name={form.field}
                          data-error={styleHtml}
                          ref='input'
                          className='form-etagi col-md-12 form-bordered'
                          orderVal={orderVal}
                          text={form.text}/>
              {importantHtml}
              {notice}
            </div>
          </div>
        );
      }
    });

    return (
      <div className='formLanding'>
        <div className='main-page-order-title'
             dangerouslySetInnerHTML={{__html: headerTitle}} />
        <form onSubmit={handleSubmit} className='main-page-order-form'>
          <div className="row">
            <div className="col-md-3">
              {forms}
            </div>
            <div className="col-md-3">
              <button id={`submit_${id}`}
                      className="btn form-control"
                      type="submit">
                {submitName ? submitName : 'Хочу дешевую ипотеку'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

OrderIpotekaLanding.defaultProps = {
  headerTitle: 'оставьте номер телефона'
};

export default OrderIpotekaLanding;
