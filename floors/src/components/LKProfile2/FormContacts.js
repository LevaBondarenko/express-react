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

const FormContacts = ({
  onChange, isLoading, contactAction, statuses,
  phone, email, phoneExt, validationError
}) => {

  return (
    <div className={s.form}>
      <div className={s.comment}>
        Данные нужны для защиты вашего аккаунта, если мы заметим
        подозрительную активность
      </div>
      <div className={s.contactGroup}>
        <FormControl
          componentClass='input'
          data-type='userdata'
          data-field='phone'
          value={phone}
          onChange={onChange}
          placeholder='Ваш телефон'/>
        {validationError.phone ? (
          <span className={s.helpBlock}>
            Телефон введен не верно
          </span>
        ) : null}
        <button
          data-contact='phone'
          className={classNames(
            s.button,
            'form-control',
            {[s.disabled]: statuses.phone === 'confirmed' || isLoading}
          )}
          onClick={contactAction}>
          {isLoading ? <i className='fa fa-spin fa-spinner'/> : (
            statuses.phone === 'confirmed' ?
              'Подтверждено' :
              (statuses.phone === 'saved' ? 'Подтвердить' : 'Сохранить')
          )}
        </button>
      </div>
      <div className={s.contactGroup}>
        <FormControl
          componentClass='input'
          data-type='userdata'
          data-field='email'
          value={email}
          onChange={onChange}
          placeholder='Ваш Email'/>
        {validationError.email ? (
          <span className={s.helpBlock}>
            Email введен не верно
          </span>
        ) : null}
        <button
          data-contact='email'
          className={classNames(
            s.button,
            'form-control',
            {[s.disabled]: statuses.email === 'confirmed' || isLoading}
          )}
          onClick={contactAction}>
          {isLoading ? <i className='fa fa-spin fa-spinner'/> : (
            statuses.email === 'confirmed' ?
              'Подтверждено' :
              (statuses.email === 'saved' ? 'Подтвердить' : 'Сохранить')
          )}
        </button>
      </div>
      <div className={s.contactGroup}>
        <FormControl
          componentClass='input'
          data-type='metadata'
          data-field='phone_ext'
          value={phoneExt}
          onChange={onChange}
          placeholder='Дополнительный телефон'/>
        {validationError.phone_ext ? (
          <span className={s.helpBlock}>
            Телефон введен не верно
          </span>
        ) : null}
        <button
          data-contact='phone_ext'
          className={classNames(
            s.button,
            'form-control',
            {[s.disabled]: statuses.phone_ext === 'saved' || isLoading}
          )}
          onClick={contactAction}>
          {isLoading ? <i className='fa fa-spin fa-spinner'/> : (
            statuses.phone_ext === 'saved' ? 'Сохранено' : 'Сохранить'
          )}
        </button>
      </div>
    </div>
  );
};

FormContacts.propTypes = {
  onChange: PropTypes.func.isRequired,
  contactAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  statuses: PropTypes.object,
  phone: PropTypes.string,
  email: PropTypes.string,
  phoneExt: PropTypes.string,
  validationError: PropTypes.object
};

export default withStyles(s)(FormContacts);
