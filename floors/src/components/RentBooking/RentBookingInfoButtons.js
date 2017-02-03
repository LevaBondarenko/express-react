/**
 * Rent booking form infobuttons view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentBookingInfoButtons.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Button from 'react-bootstrap/lib/Button';


const RentBookingInfoButtons = ({closePopover, buttonType, onClickAction,
 buttonHref = null}) => {
  const infoButtonsArr = {
    download: {
      CNButtonStyle: [style.bookingForm__contacts__controls__dlButton],
      CNDivStyle: [style.bookingForm__contacts__controls__dlButton__image],
      text: 'Скачать'
    },
    print: {
      CNButtonStyle: [style.bookingForm__contacts__controls__printButton],
      CNDivStyle: [style.bookingForm__contacts__controls__printButton__image],
      text: 'Распечатать'
    },
    send: {
      CNButtonStyle: [style.bookingForm__contacts__controls__emailButton],
      CNDivStyle: [style.bookingForm__contacts__controls__emailButton__image],
      text: 'Отправить на Email'
    }
  };

  return (
    <OverlayTrigger
     trigger={['hover', 'focus']}
     placement='bottom'
     rootClose={true}
     overlay={
      <Popover
       id={`rent_infobutton_popover_${buttonType}`}>
        <div className={style.bookingForm__popover__header}>
          <Button
           bsStyle='link'
           className={style.bookingForm__popover__close}
           onClick={closePopover}>
            <i className='fa fa-times' />
          </Button>
        </div>
        {infoButtonsArr[buttonType].text}
      </Popover>
     }>
      <Button
       bsStyle='link'
       className={`${style.bookingForm__contacts__controls__button}
        ${infoButtonsArr[buttonType].CNButtonStyle}`}
       href={buttonHref}
       onClick={onClickAction}>
        <div className={`${style.bookingForm__contacts__controls__button__image}
         ${infoButtonsArr[buttonType].CNDivStyle}`
        } />
      </Button>
    </OverlayTrigger>
  );
};

export default withStyles(style)(RentBookingInfoButtons);

RentBookingInfoButtons.propTypes = {
  buttonHref: PropTypes.string,
  buttonType: PropTypes.string,
  closePopover: PropTypes.func,
  onClickAction: PropTypes.func
};
