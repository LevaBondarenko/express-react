/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';

/*global data*/

class Order2Learn extends Component {
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
  };
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  render() {
    const {
      orderChange,
      handleSubmit,
      validate,
      value,
      fields,
      submitName,
      headerTitle,
      text,
      id
    } = this.props;
    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {

        const numImportant = parseInt(form.important);
        let style = numImportant ? validate[form.field].style : '';
        const error = numImportant ?
          validate[form.field].error : '';
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
          <div key={key} className="form-group">
            <div className="margin3 clearfix">
              <input
                type="text"
                onChange={orderChange}
                value={orderVal}
                data-name={form.field}
                className={style}
                placeholder={form.text}
              />
              {importantHtml}{notice}
            </div>
          </div>
        );
      }
    });

    return (
      <div className="order--learnInterface">
        <h2>{headerTitle}</h2>
        <form className="order-form clearfix" onSubmit={handleSubmit}>
          {forms}
          <button style={{width: '100%'}}
                  id={`submit_${id}`}
                  type="submit"
                  className="btn-red btn">
            {submitName}
          </button>
          <div className="text-center notice--text">{text}</div>
        </form>
      </div>
    );
  }
}

export default Order2Learn;
