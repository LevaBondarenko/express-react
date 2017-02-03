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

const FormChangePassword = ({
  submit, onChange, newPassword2, newPassword, oldPassword, lastError,
  isLoading, isComplete
}) => {

  return (
    <div className={s.form}>
      <FormControl
        componentClass='input'
        type='password'
        data-field='oldPassword'
        value={oldPassword}
        onChange={onChange}
        placeholder='Старый пароль'/>
      <FormControl
        componentClass='input'
        type='password'
        data-field='newPassword'
        value={newPassword}
        onChange={onChange}
        placeholder='Новый пароль'/>
      <FormControl
        componentClass='input'
        type='password'
        data-field='newPassword2'
        value={newPassword2}
        onChange={onChange}
        placeholder='Повторить новый пароль'/>
      <button
        className={classNames(
          s.button, 'mobile-primary-button',
          {[s.disabled]: isLoading}
        )}
        onClick={submit}>
        {isLoading ? (
          <i className='fa fa-spin fa-spinner'/>
        ) : (
          lastError.error ? lastError.message :
          (isComplete ? 'Готово' : 'Сменить пароль')
        )}
      </button>
    </div>
  );
};

FormChangePassword.propTypes = {
  submit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isComplete: PropTypes.bool,
  lastError: PropTypes.object,
  newPassword2: PropTypes.string,
  newPassword: PropTypes.string,
  oldPassword: PropTypes.string
};

export default withStyles(s)(FormChangePassword);
