/**
 * lk methods
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import {getFromBack} from './requestHelpers';
import {
  find
} from 'lodash';

const lkHelpers = {
  inFavorites: (oid, oclass, favorites) => {
    return favorites ? !!find(favorites, favItem => {
      return parseInt(favItem.id) === parseInt(oid) &&
      favItem.class === oclass;
    }) : false;
  },

  getCode: (to, contact, baseurl, template) => {
    const cleanedContact = to === 'phone' ?
      contact.replace(/[^0-9+]*/g, '').replace('+7', '8') : contact;

    return getFromBack({
      action: 'user_sendcode',
      to: to,
      phone: to === 'phone' ? cleanedContact : null,
      email: to === 'email' ? cleanedContact : null,
      template: to === 'email' ? template : null,
      baseurl: to === 'email' ? baseurl : null
    });
  }
};

export default lkHelpers;
