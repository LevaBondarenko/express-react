/**
 * AuthPanel Mobile Register component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map, size} from 'lodash';
import s from './AuthPanelMobileDialog.scss';

const AuthPanelMobileRegister = (props) => {
  const {
    onChange, login, password, password2, doRegister, lkSettings, authSocial,
    switchDialog, error
  } = props;
  const {auth_uri: authUri} = lkSettings;
  let socials = map(authUri, (item, key) => {
    return (
      <button key={`social-${key}`} onClick={authSocial}
        className={classNames(s.socialLink, s[key])}
        data-link={item}
        data-social={key}/>
    );
  });

  socials = size(socials) > 0 ?
    createFragment({socials: socials}) :
    createFragment({socials: null});

  return (
    <div className={classNames('mobile-modal', s.root)}>
      <div className={s.title}>Зарегистрируйтесь сейчас</div>
      <div className={s.socials}>
        <div className={s.subTitle}>
          <span>через аккаунт социальной сети:</span>
        </div>
        <div className={s.socialsList}>
          {socials}
        </div>
      </div>
      <form className={s.form} onSubmit={doRegister}>
        <div className={s.subTitle}>
          <span>или с использованием телефона или EMail:</span>
        </div>
        <div className={s.formGroup}>
          <input
            type='text'
            className='form-control'
            value={login}
            data-field='login'
            placeholder='Телефон или Ваш почтовый ящик'
            onChange={onChange}/>
          <input
            type='password'
            className='form-control'
            value={password}
            data-field='password'
            placeholder='Ваш пароль'
            onChange={onChange}/>
          <input
            type='password'
            className='form-control'
            value={password2}
            data-field='password2'
            placeholder='Повторите пароль'
            onChange={onChange}/>
        </div>
        <div className={s.toolsLinks}>
          <button
            type='button'
            data-show='lk'
            onClick={switchDialog}>
            Уже зарегистрирован
          </button>
          <button
            type='button'
            data-show='lkRestore'
            onClick={switchDialog}>
            Забыли пароль?
          </button>
        </div>
        <div className={s.formGroup}>
          <button
            type='submit'
            className='form-control mobile-primary-button'>
            Зарегистрироваться
          </button>
        </div>
        <span className={s.error}>{error}</span>
      </form>
    </div>
  );
};

AuthPanelMobileRegister.propTypes = {
  onChange: PropTypes.func.isRequired,
  doRegister: PropTypes.func.isRequired,
  authSocial: PropTypes.func.isRequired,
  switchDialog: PropTypes.func.isRequired,
  error: PropTypes.string,
  login: PropTypes.string,
  password: PropTypes.string,
  password2: PropTypes.string,
  lkSettings: PropTypes.object,
};

export default withStyles(s)(AuthPanelMobileRegister);
