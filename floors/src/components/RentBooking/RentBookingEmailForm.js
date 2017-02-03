/**
 * Rent booking email confirmation form view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentBookingEmailForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';

import Button from 'react-bootstrap/lib/Button';

import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';


class RentBookingEmailForm extends Component {
  static propTypes = {
    emailButtonLoader: PropTypes.bool,
    emailFormHelp: PropTypes.string,
    emailFormStyle: PropTypes.string,
    emailValue: PropTypes.string,
    handleEmailBlur: PropTypes.func,
    handleEmailChange: PropTypes.func,
    handleEmailFocus: PropTypes.func,
    handleEmailKeyDown: PropTypes.func,
    handleEmailSend: PropTypes.func,
    handleTransitionEnd: PropTypes.func,
    ownerAddress: PropTypes.string,
    ownerName: PropTypes.string,
    ownerPhone: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.props.handleTransitionEnd();
  }

  render() {
    const {
      emailButtonLoader,
      emailFormHelp,
      emailFormStyle,
      emailValue,
      handleEmailBlur,
      handleEmailChange,
      handleEmailFocus,
      handleEmailKeyDown,
      handleEmailSend,
      ownerAddress,
      ownerName,
      ownerPhone
    } = this.props;

    return (
      <div className={style.bookingForm__email} key='ro_email_inquire_form'>
        <div className={style.bookingForm__arrow} />
        <div className={style.bookingForm__emailForm}>
          Введите e-mail и мы отправим подтверждение на почту
        </div>
        <FormGroup
         className={classNames([style.bookingForm__emailForm],
          [style.bookingForm__emailForm__inputBlock])}
         controlId='emailFormGroup'
         validationState={emailFormStyle}>
          <Button
           bsClass={style.bookingForm__emailForm__button}
           onClick={handleEmailSend}
           data-owneraddress={ownerAddress}
           data-ownername={ownerName}
           data-ownerphone={ownerPhone}
           disabled={emailButtonLoader}>
            {emailButtonLoader ?
              (<div className='loader-inner ball-pulse'>
                <div />
                <div />
                <div />
              </div>) :
              (<img
               src={'https://cdn-media.etagi.com/static/site/d/d9/d9623e46b12554e41801aada809cfa82bd64f8af.png'}
               data-owneraddress={ownerAddress}
               data-ownername={ownerName}
               data-ownerphone={ownerPhone} />)
            }
          </Button>
          <div className={style.bookingForm__emailForm__formGroup}>
            <ControlLabel srOnly={true}>E-mail</ControlLabel>
            <FormControl
             type='text'
             className={style.bookingForm__emailForm__input}
             placeholder='Ваш e-mail'
             value={emailValue}
             onChange={handleEmailChange}
             onFocus={handleEmailFocus}
             onBlur={handleEmailBlur}
             onKeyDown={handleEmailKeyDown}
             data-owneraddress={ownerAddress}
             data-ownername={ownerName}
             data-ownerphone={ownerPhone} />
            <Feedback />
            <HelpBlock className={style.bookingForm__emailForm__helpBlock}>
              {emailFormHelp}
            </HelpBlock>
          </div>
        </FormGroup>
      </div>
    );
  }
};

export default withStyles(style)(RentBookingEmailForm);
