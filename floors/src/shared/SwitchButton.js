/**
 * Shared SwitchButton Component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import s from './css/SwitchButton.scss';

class SwitchButton extends Component {
  static propTypes = {
    leftLabel: PropTypes.string,
    rightLabel: PropTypes.string,
    labelColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    small: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const props = this.props;
    const checked = props.checked ? 'checked' : '';
    const leftLabel = props.checked ? (
      <label htmlFor={props.id}
        className={s.labelNotselected}
        style={{color: `${props.labelColor} !important`}}>
          {props.leftLabel}
      </label>
    ) : (
      <span style={{color: `${props.labelColor} !important`}}>
        {props.leftLabel}
      </span>
    );
    const rightLabel = props.checked ? (
      <span style={{color: `${props.labelColor} !important`}}>
        {props.rightLabel}
      </span>
    ) : (
      <label htmlFor={props.id}
        className={s.labelNotselected}
        style={{color: `${props.labelColor} !important`}}>
        {props.rightLabel}
      </label>
    );

    return (
      <div className={
        classNames(s.switchbutton, {[s.switchbuttonsmall]: this.props.small})
      }>
        {leftLabel}
        <input type="checkbox"
          id={props.id}
          checked={checked}
          value={props.onValue}
          onChange={props.onChange}
          onClick={props.onClick}/>
        <label htmlFor={props.id} className={s.container} style={{
          backgroundColor: `${props.backgroundColor} !important`
        }}/>
        {rightLabel}
      </div>
    );
  }
}

export default SwitchButton;
