/**
 * LK Mortgage State Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import FormControl from 'react-bootstrap/lib/FormControl';
import s from './LKProfile2.scss';

const FormPhoneConfirm = ({
  onChange, isLoading, contactAction, phoneCode, codeSended
}) => {

  return (
    <div className={classNames(s.modalForm, 'mobile-modal', 'fullscreen')}>
      <button
        className={s.modalClose}
        data-action='cancelConfirmation'
        onClick={contactAction}/>
      <div className={s.innerForm}>
        <div className={s.innerTitle}>Подтверждение телефона</div>
        <div className={s.innerDescription}>
          Код подтверждения отправлен на ваш номер
        </div>
        <div className={s.codeInput}>
          <FormControl
            componentClass='input'
            data-field='phoneCode'
            value={phoneCode}
            onChange={onChange}/>
        </div>
        <div className={s.codeSubmit}>
          <button
            className={'mobile-primary-button'}
            data-action='sendPhoneCode'
            onClick={contactAction}>
            {isLoading ? (
              <i className='fa fa-spin fa-spinner'/>
            ) : 'Подтвердить'}
          </button>
        </div>
      </div>
      <div className={s.innerComment}>
        <span>Не пришел код?</span>
        {codeSended > 0 ? (
          <span>
            Через <strong>{codeSended} сек</strong>
            &nbsp; можно будет запросить код повторно
          </span>
        ) : (
          <span>
            <a rel='nofollow'
              onClick={contactAction}
              data-action='requestPhoneCode'>
              Запросить код повторно
            </a>
          </span>
        )}
      </div>
    </div>
  );
};

FormPhoneConfirm.propTypes = {
  onChange: PropTypes.func.isRequired,
  contactAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  phone: PropTypes.string,
  phoneCode: PropTypes.string,
  codeSended: PropTypes.number
};

export default withStyles(s)(FormPhoneConfirm);
