/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import Helpers from '../../utils/Helpers';
import OrderInput from './OrderInput';
import OrderTitle from './OrderTitle';
import OrderNotice from './OrderNotice';

/*global data*/

class OrderCallMe extends Component {
  static propTypes = {
    id: PropTypes.string,
    fields: PropTypes.object,
    orderChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    validate: PropTypes.object,
    value: PropTypes.object,
    headerTitle: PropTypes.string,
    footerTitle: PropTypes.string,
    user: PropTypes.object,
    submitName: PropTypes.string,
    showPhone: PropTypes.string
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
      user,
      showPhone,
      submitName,
      id
    } = this.props;

    const userPhone = user.phone ? Helpers.phoneFormatter(
      user.phone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    ) : '';
    const orderIpotekaPhone = {__html: (showPhone == '1' ? userPhone : '')};

    const forms = map(fields, (form, key) => {
      if (form.field !== '0') {
        const orderVal = form.field === 'phone' ?
          Helpers.phoneFormatter(
            value[form.field],
            data.options.countryCode.current,
            data.options.countryCode.avail
          ) : value[form.field];

        const numImportant = parseInt(form.important);
        const style = numImportant ? validate[form.field].style : '';
        const error = numImportant ? validate[form.field].error : '';
        const importantHtml = numImportant ?
          <div className="input-group-addon orderImportant">*</div> :
          null;
        const notice = numImportant && style === 'error' ?
          <p className='errorText'>{error}</p> : null;
        const styleHtml = numImportant ? style : '';

        return (
          <div key={key} className="form-group">
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

    let userName = user.fio ? user.fio.split(' ') : ['', '', ''];

    userName[0] = userName[0] || '';
    userName[1] = userName[1] || '';
    userName[2] = userName[2] || '';

    userName =
    {__html: `${userName[0]}<br />${userName[1]} ${userName[2]}`};
    return (
      <div className="container-wide clearfix w1000">
        <OrderTitle widgetTitle = {headerTitle} />
        <div className="container-wide">
          <div className="row mortgage--wrap">
            <div className="col-md-4 mortgage--wrap__broker">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="orderIpotekaDiv">
                        { user.photo ?
                        (<img className="orderIpotekaFace"
                             src={user.photo} alt="" />) : null}
                      </div>
                    </td>
                    <td>
                      <p className="orderIpotekaName">
                        <b dangerouslySetInnerHTML={userName}></b>
                      </p>
                      <p className="orderIpotekaJob">
                        <i>Специалист по ипотеке</i>
                      </p>
                      <p className="orderIpotekaPhone">
                        <b dangerouslySetInnerHTML={orderIpotekaPhone} />
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-4">
              <form onSubmit={handleSubmit}>
                {forms}
                <div className="form-group">
                  <button id={`submit_${id}`}
                          className="btn btn-green form-control"
                          type="submit">
                    {submitName ? submitName : 'Получить консультацию'}
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-4 notice-form"></div>
          </div>
        </div>
        <OrderNotice notice_text={footerTitle} />
      </div>
    );
  }
}

export default OrderCallMe;
