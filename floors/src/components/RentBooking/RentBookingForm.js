/**
 * Rent booking form view component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RentBookingForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Modal from 'react-bootstrap/lib/Modal';
import classNames from 'classnames';

import RentBookingDescription from '../RentBooking/RentBookingDescription';
import RentBookingEmailForm from '../RentBooking/RentBookingEmailForm';
import RentBookingEmailDone from '../RentBooking/RentBookingEmailDone';
import RentBookingInfoButtons from '../RentBooking/RentBookingInfoButtons';

import ReactCssTransitionGroup from 'react-addons-css-transition-group';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Portal from 'react-portal';


const RentBookingForm = ({rentLink, stepsData, bookingStep, handleSubmit,
 bookingNumber, showModal, modalState, openModal, closeModal, cancelBooking,
 buttonText, ownerName, ownerPhone, ownerAddress, handlePrint, handleEmail,
 contractLink, submitLink, bookingCancelled, officePhone, buttonLoader,
 closePopover, phoneValue, handlePhoneChange, handlePhoneFocus, userHasPhone,
 handlePhoneBlur, phoneFormHelp, phoneFormStyle, handlePhoneKeyDown,
 isAuthorized, GaEvent, trackLink, openModalProblem, trackCont, offerLink,
 offerAccepted, handleOfferState, emailFormHelp, emailFormStyle, emailValue,
 handleEmailBlur, handleEmailChange, handleEmailFocus, handleEmailSend,
 handleEmailKeyDown, emailFormState, emailButtonLoader, emailFormTransitionEnd,
 handleEmailFormTransitionEnd}) => {
  const ModalBody = Modal.Body;
  const ModalHeader = Modal.Header;
  const flagClassName = classNames({
    [style.bookingForm__flag]: true,
    [style.bookingForm__flag__yellow]: stepsData[bookingStep].className ===
     'statusYellow' ? true : false,
    [style.bookingForm__flag__red]: stepsData[bookingStep].className ===
     'statusRed' ? true : false,
    [style.bookingForm__flag__teal]: stepsData[bookingStep].className ===
     'statusGreen' ? true : false
  });

  const modalArr = [
    (<ModalBody>
      <p>
        Ваш максимум в 3 активных брони уже достигнут.
        Если вы хотите забронировать этот объект,
        возможно вам стоит удалить одно из существующих бронирований
      </p>
      <Button
       bsStyle='link'
       className={`${style.bookingForm__modalButton}
        ${style.bookingForm__modalButton__cancel}`}
       href={submitLink}
       onClick={GaEvent}>
        Перейти к списку
      </Button>
    </ModalBody>),

    (<ModalBody>
      <p>
        {bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
          'Вы уверены, что хотите отменить бронирование?' :
          'Вы уверены, что хотите удалить объект из бронирования?'
        }
      </p>
      <Button
       bsStyle='link'
       className={`${style.bookingForm__modalButton}
        ${style.bookingForm__modalButton__confirm}`} data-activekey='btn'
       onClick={cancelBooking}>
        {bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
          'Да, отменить' :
          'Да, удалить'
        }
      </Button>
      <Button
       bsStyle='link'
       className={`${style.bookingForm__modalButton}
        ${style.bookingForm__modalButton__cancel}`}
       onClick={closeModal}>
        {bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
          'Нет, не отменять' :
          'Нет, не удалять'
        }
      </Button>
    </ModalBody>),

    (<ModalBody>
      <img src='https://cdn-media.etagi.com/static/site/b/bc/bcec23e1d96da20614091593207ecbbfb712de4d.png'
       className={style.bookingForm__okSign}/>
      <p>
        {bookingCancelled ?
          'Ваше бронирование отменено' :
          'Объект удален из бронирования'
        }
      </p>
    </ModalBody>),

    (<ModalBody>
      <p>
        Если у вас возникли сложности с заселением или вам не понравилась
         квартира, нажмите «Продолжить». Наш администратор свяжется с вами
         и поможет решить эту проблему. Помните, что вы можете рассмотреть
         еще 2 варианта для заселения в счет уже оплаченной комиссии или мы
         вернем вам деньги
      </p>
      <Button
       bsStyle='link'
       className={`${style.bookingForm__modalButton}
        ${style.bookingForm__modalButton__cancel}`}
       onClick={() =>{cancelBooking(); trackCont();}}>
        Продолжить
      </Button>
    </ModalBody>)
  ];

  return (
    <div className={style.bookingForm}>
      <Modal className={style.bookingForm__cancelModal} show={showModal}
       onHide={closeModal}>
        <ModalHeader closeButton />
        {modalArr[modalState]}
      </Modal>
      {!bookingStep ?
        (<div className={style.bookingForm__phoneblock}>
          <div className={style.bookingForm__phoneblock__header}>
            Забронируйте прямо сейчас и сэкономьте на аренде
          </div>
          {!userHasPhone && isAuthorized ?
            (<FormGroup
             className={style.bookingForm__inputForm}
             controlId='phoneFormGroup'
             validationState={phoneFormStyle}>
              <ControlLabel srOnly={true}>Телефон</ControlLabel>
              <FormControl
               type='text'
               className={style.bookingForm__inputForm__input}
               placeholder='Укажите телефон'
               value={phoneValue}
               onChange={handlePhoneChange}
               onFocus={handlePhoneFocus}
               onBlur={handlePhoneBlur}
               onKeyDown={handlePhoneKeyDown} />
              <Feedback />
              <HelpBlock>{phoneFormHelp}</HelpBlock>
            </FormGroup>) :
            null
          }
          <Button
           bsStyle='link'
           className={style.bookingForm__button}
           onClick={handleSubmit}
           disabled={buttonLoader || (offerLink && !offerAccepted)}>
            {buttonLoader ?
              (<div className="loader-inner ball-pulse">
                <div />
                <div />
                <div />
              </div>) :
              buttonText
            }
          </Button>
          {offerLink ?
            (<div className={style.bookingForm__offerLink}>
              <input
               type='checkbox'
               id='booking--offerLink'
               checked={offerAccepted}
               className='form-etagi input_arrow'
               onChange={handleOfferState} />
              <label
               htmlFor='booking--offerLink'
               className='checkbox_arrow arrow_extend'>
                <i className='icon_arrow'></i>
                Согласен с <a href={offerLink} target='_blank'>
                            договором оферты
                           </a>
              </label>
            </div>) :
            null
          }
        </div>) :
        null
      }
      {bookingStep && bookingStep !== 3 ?
        (<div className={style.bookingForm__message}>
          Номер вашего бронирования:
          <p>{bookingNumber}</p>
        </div>) :
        null
      }
      <div className={style.bookingForm__header}>
        {bookingStep ?
          <div className={flagClassName} /> :
          null
        }
        {stepsData ? stepsData[bookingStep].title : ''}
      </div>
      <div className={style.bookingForm__message}>
        {stepsData ? stepsData[bookingStep].descr : ''}
      </div>
      {bookingStep && bookingStep !== 3 && bookingStep !== 9 ?
        (<div>
          <Button
           bsStyle='link'
           className={style.bookingForm__button}
           href={submitLink}
          onClick={GaEvent}>
            {buttonText}
          </Button>
          {bookingStep !== 3 && bookingStep !== 10 ?
            (<a className={`${style.bookingForm__link}
             ${style.bookingForm__link__cancel}`} data-activekey='link'
                onClick={openModal}>
              {bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
                'Отменить бронирование' :
                'Удалить из бронирования'
              }
            </a>) :
            null
          }
        </div>) :
        null
      }
      {!bookingStep ?
        (<div>
          <div className={style.bookingForm__descriptionblock}>
            <RentBookingDescription
             closePopover={closePopover}
             step={0}
             stepsData={stepsData}
             {...RentBookingForm.props}/>
            <RentBookingDescription
             closePopover={closePopover}
             step={1}
             stepsData={stepsData}
             {...RentBookingForm.props}/>
            <RentBookingDescription
             closePopover={closePopover}
             step={2}
             stepsData={stepsData}
             {...RentBookingForm.props}/>
          </div>
          {rentLink ?
            (<a href={rentLink}
            onClick={GaEvent}
            className={style.bookingForm__link}>
              Подробнее об «Аренде онлайн»
            </a>) :
            null
          }
        </div>) :
        null
      }
      {bookingStep === 3 ?
        (<div className={style.bookingForm__contacts}>
          <div className={style.bookingForm__contacts__info}>
            <p><b>Имя собственника:</b> {ownerName}</p>
            <p><b>Телефон:</b> {ownerPhone}</p>
            <p><b>Адрес:</b> {ownerAddress}</p>
          </div>
          <div className={style.bookingForm__contacts__controls}>
            <p>Распечатайте или отправьте себе на почту подтверждение</p>
            <div className={style.bookingForm__contacts__controls__bar}>
              <RentBookingInfoButtons
               closePopover={closePopover}
               buttonType='print'
               onClickAction={handlePrint} />
              <RentBookingInfoButtons
               closePopover={closePopover}
               buttonType='send'
               onClickAction={handleEmail} />
              <RentBookingInfoButtons
               closePopover={closePopover}
               buttonType='download'
               onClickAction={trackLink}
               buttonHref={contractLink} />
            </div>
            <ReactCssTransitionGroup
             transitionName='roemailform'
             transitionEnter={true}
             transitionLeave={true}
             transitionEnterTimeout={500}
             transitionLeaveTimeout={500}
             component='div'>
              {emailFormState === 1 && emailFormTransitionEnd ?
                (<RentBookingEmailForm
                 emailButtonLoader={emailButtonLoader}
                 emailFormHelp={emailFormHelp}
                 emailFormStyle={emailFormStyle}
                 emailValue={emailValue}
                 handleEmailBlur={handleEmailBlur}
                 handleEmailChange={handleEmailChange}
                 handleEmailFocus={handleEmailFocus}
                 handleEmailKeyDown={handleEmailKeyDown}
                 handleEmailSend={handleEmailSend}
                 handleTransitionEnd={handleEmailFormTransitionEnd}
                 ownerAddress={ownerAddress}
                 ownerName={ownerName}
                 ownerPhone={ownerPhone}
                 {...RentBookingForm.props} />) :
                null
              }
              {emailFormState === 2 && emailFormTransitionEnd ?
                <RentBookingEmailDone {...RentBookingForm.props} /> :
                null
              }
            </ReactCssTransitionGroup>
          </div>
        </div>) :
        null
      }
      {bookingStep === 3 ?
        (<div className={style.bookingForm__contacts__controls}>
          <p>
            Подтвердите заселение, если вы успешно заселились
             и довольны выбранной квартирой
          </p>
          <Button
           bsStyle='link'
           className={style.bookingForm__button}
           onClick={handleSubmit}>
            {buttonLoader ?
              (<div className="loader-inner ball-pulse">
                <div />
                <div />
                <div />
              </div>) :
              buttonText
            }
          </Button>
          <a className={`${style.bookingForm__link}
           ${style.bookingForm__link__cancel}`}  onClick={openModalProblem}>
            У меня проблемы с заселением
          </a>
        </div>) :
        null
      }
      {bookingStep ?
        (<div className={style.bookingForm__callUsBlock}>
          <p>Если у вас возникли сложности с заселением или дополнительные
             вопросы, звоните по телефону:</p>
          <p className={style.bookingForm__callUsBlock__phone}>
            {officePhone}
          </p>
        </div>) :
        null
      }
      <Portal isOpened={true} className='block-to-print'>
        <div className={style.bookingForm__ownerContacts}>
          <div className={style.bookingForm__ownerContacts__title}>
            Созвонитесь с собственником и подтвердите заселение
          </div>
          <div className={style.bookingForm__ownerContacts__contactblock}>
            <div className={style.bookingForm__ownerContacts__list}>
              <span>
                Имя собственника:
              </span>
              <span>
                Телефон:
              </span>
              <span>
                Адрес:
              </span>
              <span className={style.bookingForm__ownerContacts__office}>
                Телефон офиса:
              </span>
              <span>
                Номер бронирования:
              </span>
            </div>
            <div className={style.bookingForm__ownerContacts__values}>
              <span>
                {ownerName}
              </span>
              <span className={style.bookingForm__ownerContacts__phones}>
                {ownerPhone}
              </span>
              <span>
                {ownerAddress}
              </span>
              <span className={style.bookingForm__ownerContacts__office}>
                {officePhone}
              </span>
              <span>
                {bookingNumber}
              </span>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
};

export default withStyles(style)(RentBookingForm);

RentBookingForm.propTypes = {
  bookingCancelled: PropTypes.bool,
  bookingNumber: PropTypes.number,
  bookingStep: PropTypes.number,
  buttonLoader: PropTypes.bool,
  buttonText: PropTypes.string,
  cancelBooking: PropTypes.func,
  closePopover: PropTypes.func,
  closeModal: PropTypes.func,
  contractLink: PropTypes.string,
  emailButtonLoader: PropTypes.bool,
  emailFormHelp: PropTypes.string,
  emailFormState: PropTypes.number,
  emailFormStyle: PropTypes.string,
  emailFormTransitionEnd: PropTypes.bool,
  emailValue: PropTypes.string,
  handleEmail: PropTypes.func,
  handleEmailBlur: PropTypes.func,
  handleEmailChange: PropTypes.func,
  handleEmailFocus: PropTypes.func,
  handleEmailFormTransitionEnd: PropTypes.func,
  handleEmailKeyDown: PropTypes.func,
  handleEmailSend: PropTypes.func,
  handleOfferState: PropTypes.func,
  handlePhoneBlur: PropTypes.func,
  handlePhoneChange: PropTypes.func,
  handlePhoneFocus: PropTypes.func,
  handlePhoneKeyDown: PropTypes.func,
  handlePrint: PropTypes.func,
  handleSubmit: PropTypes.func,
  isAuthorized: PropTypes.bool,
  modalState: PropTypes.number,
  offerAccepted: PropTypes.bool,
  offerLink: PropTypes.string,
  officePhone: PropTypes.string,
  openModal: PropTypes.func,
  ownerAddress: PropTypes.string,
  ownerName: PropTypes.string,
  ownerPhone: PropTypes.string,
  phoneFormHelp: PropTypes.string,
  phoneFormStyle: PropTypes.string,
  phoneValue: PropTypes.string,
  rentLink: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]),
  showModal: PropTypes.bool,
  stepsData: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool
  ]),
  submitLink: PropTypes.string,
  userHasPhone: PropTypes.bool,
  GaEvent: PropTypes.func,
  trackLink: PropTypes.func,
  openModalProblem: PropTypes.func,
  trackCont: PropTypes.func
};
