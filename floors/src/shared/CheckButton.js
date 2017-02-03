/**
 * Shared CheckButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {includes} from 'lodash';

class CheckButton extends Component {
  render() {
    const props = this.props;
    let checked = '';
    let modeClass = props.mode === '1' ?
      'msearcher--checkbuttons__item clearfix' : (props.radiomode ?
        'msearcher--radio__item clearfix' :
        'msearcher--checkbox__item clearfix'
      );

    if(props.pullLeft && props.pullLeft === '1') {
      modeClass += ' pull-left';
    }
    if(props.checked !== undefined) {
      checked = props.checked;
    } else if (includes(props.dataModel, props.onValue.toString())) {
      checked = 'checked';
    }

    if (props.disabled) {
      modeClass += ' msearcher--checkbox__disabled';
    }

    return (
        <div className={modeClass}>
            <input type="checkbox"
              id={props.itemID}
              checked={checked}
              value={props.onValue}
              data-field={props.model}
              onChange={props.onChange}
              />
            <label htmlFor={props.itemID} onClick={props.onClick}>
              <i /><span>{props.itemLabel}</span>
            </label>
        </div>
    );
  }
}

export default CheckButton;
