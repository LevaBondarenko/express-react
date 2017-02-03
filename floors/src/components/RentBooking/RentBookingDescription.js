/**
 * Rent booking form description view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentBookingDescription.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Button from 'react-bootstrap/lib/Button';


const RentBookingDescription = ({closePopover, step, stepsData}) => {
  RentBookingDescription.propTypes = {
    closePopover: PropTypes.func,
    step: PropTypes.number,
    stepsData: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.bool
    ])
  };

  const popId = `popover-positioned-bottom_${step}`;

  return (
    <div className={style.bookingForm__descriptionItem}>
      <div className={style.bookingForm__stepGroup}>
        {step ?
          <div className={`${style.bookingForm__line}
           ${style.bookingForm__line__upwards}`} /> :
          null
        }
        <div className={style.bookingForm__step}>
          {step + 1}
        </div>
        {!(step + 1 === 3) ?
          <div className={style.bookingForm__line} /> :
          null
        }
      </div>
      <div className={style.bookingForm__description}>
        {stepsData ? stepsData[step].stepDescription : ''}
      </div>
      <div className={style.bookingForm__help}>
        <OverlayTrigger
         trigger={['hover', 'focus']}
         placement='bottom'
         rootClose={true}
         overlay={
          <Popover
           id={popId}
           className={style.bookingForm__help__popover}>
            <div className={style.bookingForm__help__popover__header}>
              <Button
               bsStyle='link'
               className={style.bookingForm__help__popover__close}
               onClick={closePopover}>
                <i className='fa fa-times' />
              </Button>
            </div>
            {stepsData ? stepsData[step].stepHelp : ''}
          </Popover>
         }>
          <i className='fa fa-question-circle' data-popover={step} />
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default withStyles(style)(RentBookingDescription);
