/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';

/*global data*/

class OrderLearning extends Component {
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
      footerTitle,
      id
    } = this.props;
    //TODO: Разобраться с типом заявки.
    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {

        const numImportant = parseInt(form.important);
        let style = numImportant ? validate[form.field].style : '';
        const orderVal = form.field === 'phone' ?
          phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];

        style = `form-control ${style}`;

        return (
          <div key={key} className="form-group">
              <input
                type="text"
                onChange={orderChange}
                value={orderVal}
                data-name={form.field}
                className={style}
                placeholder={form.text}
              />
          </div>
        );
      }
    });

    return (
      <div className="order-learning-form-wrapper">
        <h3 className="order-learning-header">{headerTitle}</h3>
        <div className="text-center learn--text">{footerTitle}</div>
        <form className="order-learning-form" onSubmit={handleSubmit}>
          {forms}
          <button id={`submit_${id}`}
                  type="submit"
                  className="btn-red btn hr-mod">
            {submitName}
          </button>
        </form>
        <div className="order-learning-blueText">
          Участие бесплатное. Лучших трудоустроим
        </div>
      </div>
    );
  }
}

export default OrderLearning;
