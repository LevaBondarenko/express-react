import React, {PropTypes} from 'react';

import UInput from '../UInput/UInput';
import USubmit from '../USubmit/USubmit';
import UValidator from '../UValidator/UValidator';
import s from './OrderForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const OrderForm = (props) => {
  const {modalToggle, context} = props;

  return (
    <div className={s.root}>
      <div className={s.formTitle}>
        Оставить заявку на ипотеку
      </div>
      <div className={s.formControl} id='uinput-name'>
        <UInput
          mountNode='uinput-name'
          context={context}
          objectName='mortgage'
          fieldName='name'
          placeholder='Введите имя'
          refreshOn='change'
          maxLength={64}/>
      </div>
      <div className={s.formControl} id='uinput-phone'>
        <UInput
          mountNode='uinput-phone'
          context={context}
          objectName='mortgage'
          fieldName='phone'
          isPhone={true}
          placeholder='Введите номер телефона'
          refreshOn='change'
          maxLength={64}/>
      </div>
      <div className={s.formControl}>
        <USubmit
          context={context}
          objectName='mortgage'
          typeId='6'
          label='Оставить заявку'
          validateMode='onSend'
          sendedTitle='Заявка отправлена'
          skipValues={['programs', 'collections', 'isLoading']}
          extValues={[
            {field: 'source', value: 'Web'},
            {field: 'advanced_source', value: 'Ipoteka'}
          ]}
          onSubmitSuccess={modalToggle}/>
        <UValidator
          context={context}
          objectName='mortgage'
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
            },
            {
              field: 'name',
              rule: 'required',
              param: 0,
              err: 'error',
              msg: 'Имя обязателено'
            }
          ]}/>
      </div>
    </div>
  );
};

OrderForm.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  modalToggle: PropTypes.func
};

export default withStyles(s)(OrderForm);
