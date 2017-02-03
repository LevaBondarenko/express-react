/**
 * AuthPanel Mobile Login component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {getFilterDesc} from '../../utils/Helpers';
import s from './LKSearches2.scss';


const LKSearchSettings = (props) => {
  const {searchAction, searchData, currency, colls} = props;
  const {
    id: searchId, name, notifications,
    notifications_email: notificationsEmail, filter: model
  } = searchData;
  const filterDesc = getFilterDesc(model, colls, currency);

  return (
    <div className={classNames(s.searchSettings, 'mobile-modal', 'fullscreen')}>
      <div className={s.searchTitle}>
        {name}
        <button
          className={s.closeSettingsButton}
          data-action='toggleSettingsShow'
          data-searchid={searchId}
          onClick={searchAction}/>
      </div>
      <div className={s.searchDescription}>
        {filterDesc}
      </div>
      <div className={s.options}>
        <div>
          <input
            id={`notificationsEmail-${searchId}`}
            type='checkbox'
            data-action='changeSearchSettings'
            data-searchid={searchId}
            data-field='notifications_email'
            checked={notificationsEmail}
            onChange={searchAction}
            value={notificationsEmail}/>
          <label htmlFor={`notificationsEmail-${searchId}`}>
            <i/>
            <span>Получать уведомления на почту</span>
          </label>
        </div>
        <div>
          <input
            id={`notifications-${searchId}`}
            type='checkbox'
            data-action='changeSearchSettings'
            data-searchid={searchId}
            data-field='notifications'
            checked={notifications}
            onChange={searchAction}
            value={notifications}/>
          <label htmlFor={`notifications-${searchId}`}>
            <i/>
            <span>Получать уведомления в личном кабинете</span>
          </label>
        </div>
      </div>
      <div className={s.deleteSearch}>
        <button
          className={s.deleteSearchButton}
          data-action='deleteSearch'
          data-searchid={searchId}
          onClick={searchAction}>
          Удалить подписку
        </button>
      </div>
    </div>
  );
};

LKSearchSettings.propTypes = {
  searchAction: PropTypes.func.isRequired,
  searchData: PropTypes.object,
  colls: PropTypes.object,
  currency: PropTypes.object,
};

export default withStyles(s)(LKSearchSettings);
