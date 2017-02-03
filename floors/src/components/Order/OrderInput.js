/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {phoneFormatter} from '../../utils/Helpers';
import {map} from 'lodash';

/*global data*/

class OrderInput extends Component {

  // на данный момент ни на одной странице нет заявки с селектами или
  // радио кнопками. Если такие появятся, то надо будет в этом компоненте
  // дописать их рендеринг


  render() {
    const props = this.props;
    const type = props.type;
    const orderChange = props.orderChange;
    let input;
    let orderVal = props.orderVal;

    if (props['data-name'] === 'phone') {
      orderVal = phoneFormatter(
        orderVal,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
    }

    const style = `form-etagi col-md-12
      ${(props['data-error'] === 'error' ? ' input-error' : '')}`;

    switch (type) {
    case 'text':
      input = (<input type={type}
                     onChange={orderChange}
                     data-name={props['data-name']}
                     className={style}
                     value={orderVal}
                     placeholder={props.text}
        />);
      break;
    case 'select':
      props.options[0] = props.text;
      const options = map(props.options, (val, key) => {
        return <option key={key} value={key}>{val}</option>;
      });

      input = (
        <select type={type}
                onChange={orderChange}
                data-name={props['data-name']}
                className={style}
                value={orderVal}>
          {options}
        </select>);
      break;
    case 'checkbox':
      input = (<div className={props.fieldClass ?
                 `${props.fieldClass} checkbox` :
                 'checkbox'}
        >
        <label htmlFor={`${props['data-name']}_flag`}>
          {props.text}
          <input
            id={`${props['data-name']}_flag`}
            type='checkbox'
            onChange={orderChange}
            data-name={props['data-name']}
            value={props.text}
            placeholder={props.text}
            />
        </label>
      </div>);
      break;
    default:
      input = (<input type={type !== 'input' ? type : 'text'}
                     onChange={orderChange}
                     data-name={props['data-name']}
                     className={style}
                     value={orderVal}
                     placeholder={props.text}
        />);
      break;
    }
    return input;
  }

}

export default OrderInput;
