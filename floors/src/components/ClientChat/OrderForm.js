import React, {PropTypes} from 'react';
import s from './ClientChat.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const OrderForm = ({onInput, phone, buttonText, mode,
  titleForm, thanksText, changeMode, sendOrder, width}) => {
  return (
    <div>
      <div
        className={s.orderForm}
        id='order-form'
        style={{
          width: width === 0 ? '100%' : width,
          display: mode === 'call' ? 'block' : 'none'
        }}
      >
        <div className={s.orderTitle}
             dangerouslySetInnerHTML={{__html: titleForm}}/>
        <form onSubmit={sendOrder}>
          <div className={s.orderInputWrapper}>
            <input
              type="text"
              placeholder="Телефон"
              onChange={onInput}
              value={phone}
            />
          </div>
          <div className={s.orderInputWrapper}>
            <button>{buttonText}</button>
          </div>
        </form>
      </div>
      <div className={s.thanks}
           style={{
             width: width === 0 ? '100%' : width,
             display: mode === 'thanks' ? 'block' : 'none'
           }}
      >
        <div
          className="thanksText"
          dangerouslySetInnerHTML={{__html: thanksText}}
        />
        <div className={s.orderInputWrapper}>
          <button onClick={changeMode}>Перейти в диалог</button>
        </div>
      </div>
    </div>
  );
};

OrderForm.propTypes = {
  onInput: PropTypes.func,
  phone: PropTypes.string,
  buttonText: PropTypes.string,
  mode: PropTypes.string,
  titleForm: PropTypes.string,
  thanksText: PropTypes.string,
  changeMode: PropTypes.func,
  sendOrder: PropTypes.func,
  width: PropTypes.number,
};

export default withStyles(s)(OrderForm);