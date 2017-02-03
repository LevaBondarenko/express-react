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
import s from './LKProfile2.scss';

const FormEmailConfirm = ({
  contactAction, email
}) => {

  return (
    <div className={classNames(s.modalForm, 'mobile-modal', 'fullscreen')}>
      <button
        className={s.modalClose}
        data-action='cancelConfirmation'
        onClick={contactAction}/>
      <div className={s.innerForm}>
        <div className={s.innerTitle}>Подтверждение Email</div>
        <div className={s.innerDescription}>
          Письмо со ссылкой для подтверждения Email отправлен на вашу почту<br/>
          <strong>{email}</strong><br/>
          Следуйте указаниям в письме для подтверждения Email
        </div>
      </div>
    </div>
  );
};

FormEmailConfirm.propTypes = {
  contactAction: PropTypes.func.isRequired,
  email: PropTypes.string
};

export default withStyles(s)(FormEmailConfirm);
