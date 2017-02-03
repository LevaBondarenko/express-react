/**
 * Rent switcher button view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import style from './RentSwitcherButton.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';


const RentSwitcherButton = ({toggleButton, header, price,
 showPriceUnit, toggled}) => {
  RentSwitcherButton.propTypes = {
    toggleButton: PropTypes.func,
    header: PropTypes.string,
    price: PropTypes.string,
    toggled: PropTypes.bool,
    showPriceUnit: PropTypes.bool
  };

  const buttonClassName = classNames({
    [style.switcherBtn]: true,
    [style.buttonToggled]: toggled
  });

  return (
    <div className={buttonClassName} onClick={toggleButton}>
      <div className={style.switcherBtn__header}>
        {header}
      </div>
      <div className={style.switcherBtn__price}>
      {showPriceUnit ?
        (<Price price={price}>
          &nbsp;<PriceUnit/>
        </Price>) :
        price
      }
      </div>
    </div>
  );
};

export default withStyles(style)(RentSwitcherButton);
