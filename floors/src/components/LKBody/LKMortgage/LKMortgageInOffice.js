/**
 * LK Mortgage Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ContactMap from '../../ContactMap/ContactMap';


import s from './style.scss';

const LKMortgageInOffice = ({selectedCity}) => {
  const {
    office_phone: officePhone,
    office_hours: officeHours,
    office_hours_weekend: officeHoursWeekend,
    address, coords
  } = selectedCity;
  const {0: lo, 1: la} = coords ? coords.split(',') : [0, 0];

  return (
    <div className={s.lkBodyMortgageInOffice}>
      <div className={s.inOfficeHeader}>
        <span>Ипотека по-старому</span>
        <span>
          Вы можете оформить ипотеку с помощью специалиста по ипотеке в нашем
          офисе. Эта услуга для Вас бесплатна.
        </span>
      </div>
      <div className={s.inOfficeInfo}>
        <div className={s.inOfficeContacts}>
          <i className='fa fa-phone'/>
          <span className={s.phone}>{officePhone}</span>
        </div>
        <div className={s.inOfficeContacts}>
          <i className='fa fa-map-marker'/>
          <span className={s.address}>{address}</span>
        </div>
        <div className={s.inOfficeContacts}>
          <i className='fa fa-clock-o'/>
          <span className={s.worktime}>
            Понедельник - пятница: {officeHours}
          </span>
          <span className={s.worktime}>
            Суббота - воскресенье: {officeHoursWeekend}
          </span>
        </div>
      </div>
      <div className={s.inOfficeMap}>
        <ContactMap lo={lo} la={la} address={address} place='ФРК Этажи' />
      </div>
    </div>
  );
};

LKMortgageInOffice.propTypes = {
  selectedCity: PropTypes.object
};

export default withStyles(s)(LKMortgageInOffice);
