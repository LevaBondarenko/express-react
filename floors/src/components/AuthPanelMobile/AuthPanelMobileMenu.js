/**
 * AuthPanel Mobile Menu component
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
import {size} from 'lodash';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {phoneFormatter} from '../../utils/Helpers';
import Image from '../../shared/Image';
import s from './AuthPanelMobileMenu.scss';

const AuthPanelMobileMenu = (props) => {
  const {
    userData, lkSettings, mediaSource, countryCode, logout, switchDialog
  } = props;
  const {photo, f, i, o, phone, email} = userData;
  const username = i + (o && ` ${o}`) + (f && ` ${f}`);
  const userPhone = size(phone) ? phoneFormatter(
    phone, countryCode.current, countryCode.avail
  ) : null;
  const avaFromPics = (/pics2.etagi.com\/lk\//).test(photo) ||
    (/cdn-media.etagi.com\/content\/media\/lk\//).test(photo);
  const photoUrl = avaFromPics ? photo : getApiMediaUrl(
    avaFromPics ? 'lk' : '160160',
    avaFromPics ? '' : 'profile',
    photo && photo.length ? photo : 'no_photo',
    mediaSource);
  const {lkPage, modules} = lkSettings;
  let menu = modules.filter(item => item.enabled).map(item => {
    const count = size(props[item.name]);

    return (
      <div className={s.menuItem} key={`lk-${item.name}`}>
        <a href={`${lkPage}#/${item.name}/`}
          data-show={null} onClick={switchDialog}>
          {item.title}
          {count ? (
            <span className={s.badge}>{count}</span>
          ) : null}
        </a>
      </div>
    );
  });

  menu = size(menu) > 0 ?
    createFragment({menu: menu}) :
    createFragment({menu: null});

  return (
    <div className={classNames('mobile-modal', s.root)}>
      <div className={s.user}>
        <div className={s.avatar}>
          <Image
            image={photoUrl}
            visual='lk'
            width={100}
            height={100}
            alt={username}
            className='img-circle'/>
        </div>
        <div className={s.userProfile}>
          <span className={s.fio}>{username}</span>
          <span className={s.phone}>{userPhone}</span>
          <span className={s.email}>{size(email) ? email : null}</span>
        </div>
      </div>
      <div className={s.menu}>
        {menu}
        <button
          className={classNames(s.logout, s.menuItem)}
          onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  );
};

AuthPanelMobileMenu.propTypes = {
  userData: PropTypes.object.isRequired,
  lkSettings: PropTypes.object.isRequired,
  mediaSource: PropTypes.number.isRequired,
  countryCode: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  switchDialog: PropTypes.func.isRequired,
};

export default withStyles(s)(AuthPanelMobileMenu);
