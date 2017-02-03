/**
 * Rent booking email form done view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentBookingEmailDone.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


const RentBookingEmailDone = () => {

  return (
    <div className={style.bookingForm__email} key='ro_email_send_success_form'>
      <div className={style.bookingForm__arrow} />
      <div className={style.bookingForm__emailForm}>
        <div className={style.bookingForm__emailForm__success}>
          Успех!
        </div>
        <div className={style.bookingForm__emailForm__stext}>
          Письмо с контактными данными успешно отправлено
        </div>
      </div>
    </div>
  );
};

export default withStyles(style)(RentBookingEmailDone);
