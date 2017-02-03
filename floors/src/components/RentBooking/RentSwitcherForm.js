/**
 * Rent switcher form view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentSwitcherForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import RentSwitcherButton from '../RentBooking/RentSwitcherButton';


const RentSwitcherForm = ({toggleButton, priceWO, priceW,
 priceAsIs, toggled}) => {
  RentSwitcherForm.propTypes = {
    toggleButton: PropTypes.func,
    priceWO: PropTypes.string,
    priceW: PropTypes.string,
    priceAsIs: PropTypes.bool,
    toggled: PropTypes.bool
  };

  return (
    <div className={style.switcherForm}>
      <RentSwitcherButton
        toggleButton={toggleButton}
        header='Самостоятельно'
        price={priceWO}
        showPriceUnit={priceWO === '?' ? false : true}
        toggled={toggled}
        {...RentSwitcherForm.props}/>
     <RentSwitcherButton
       toggleButton={toggleButton}
       header='С риэлтором'
       price={priceW}
       showPriceUnit={!priceAsIs}
       toggled={!toggled}
       {...RentSwitcherForm.props}/>
    </div>
  );
};

export default withStyles(style)(RentSwitcherForm);
