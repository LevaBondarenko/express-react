/**
 * RieltorOrderForm for mobile widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {PropTypes} from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RieltorOrderForm.scss';
import ContextType from '../../utils/contextType';

import UInput from '../UInput/UInput';
import USubmit from '../USubmit/USubmit';
import UValidator from '../UValidator/UValidator';
import PriceUnit from '../../shared/PriceUnit';
import Price from '../../shared/Price';

const RieltorOrderForm = (props) => {
  const {
    context, ticketType, ticketMode, objectPrice, orderTitle, sendedRedirect
  } = props;

  return (
    <div className={s.root}>
      <div className={s.formControl} id='realtorTicket-name'>
        <UInput
          id='realtorTicket-uinput-name'
          mountNode='realtorTicket-name'
          context={context}
          objectName='realtorTicket'
          fieldName='name'
          placeholder='Введите имя'
          refreshOn='change'
          maxLength={64}/>
      </div>
      <div className={s.formControl} id='realtorTicket-phone'>
        <UInput
          id='realtorTicket-uinput-phone'
          mountNode='realtorTicket-phone'
          context={context}
          objectName='realtorTicket'
          fieldName='phone'
          isPhone={true}
          placeholder='Введите номер телефона'
          refreshOn='change'
          maxLength={64}/>
      </div>
      {ticketMode === 'bid' ? (
        <div className={s.newPrice}>
          <div className={s.objectPrice}>
            <span className={s.label}>
              Текущая цена, <PriceUnit context={context}/>
            </span>
            <Price price={objectPrice} context={context}/>
          </div>
          <div className={s.formControl} id='realtorTicket-newprice'>
            <UInput
              id='realtorTicket-uinput-newprice'
              mountNode='realtorTicket-newprice'
              context={context}
              objectName='realtorTicket'
              fieldName='newPrice'
              isPhone={false}
              funnyPlaceHolder={true}
              isNumeric={true}
              isApplyCourse={true}
              placeholder='Новая цена, currencyUnit'
              refreshOn='change'
              maxLength={1000000000}
              isDisabledListenCarret={true}/>
          </div>
        </div>
      ) : (
        <div className={s.formControl} id='uinput-message'>
          <UInput
            mountNode='uinput-message'
            context={context}
            objectName='realtorTicket'
            fieldName='question'
            rows={4}
            refreshOn='change'
            placeholder=''
            maxLength={256}/>
        </div>
      )}
      <div className={s.formControl}>
        <USubmit
          context={context}
          objectName='realtorTicket'
          typeId={ticketType}
          label={orderTitle}
          validateMode='onSend'
          sendedTitle='Заявка отправлена'
          sendedRedirect={sendedRedirect}
          skipValues={[]}
          extValues={[
            {field: 'source', value: 'Web'}
          ]}
          constructMessage={[
            {field: 'newPrice', title: 'Клиент хочет купить за'},
            {field: 'question', title: 'Вопрос клиента'},
            {field: 'object_id', title: 'Объект'}
          ]}/>
        <UValidator
          context={context}
          objectName='realtorTicket'
          validateOnChange={false}
          blockHeight={-1}
          displayErrors='disabled'
          dumpToConsole={false}
          rules={[
            {
              field: 'phone',
              rule: 'required',
              param: 0,
              err: 'error',
              msg: 'Телефон обязателен'
            },
            {
              field: 'phone',
              rule: 'phone',
              param: 0,
              err: 'error',
              msg: 'Телефон введен не правильно'
            }
          ]}/>
      </div>
    </div>
  );
};

RieltorOrderForm.propTypes = {
  context: PropTypes.shape(ContextType).isRequired,
  ticketType: PropTypes.string,
  ticketMode: PropTypes.string,
  objectPrice: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  orderTitle: PropTypes.string,
  sendedRedirect: PropTypes.string
};

export default withStyles(s)(RieltorOrderForm);