import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {each} from 'lodash';

class OrderButton extends Component {

  static propTypes = {
    checkAllFirst: React.PropTypes.bool,
    additionalClassName: React.PropTypes.string,
    title: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    items: React.PropTypes.array,
    action: React.PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  clickHandler = (event) => {
    event.preventDefault();

    if (this.props.checkAllFirst && this.props.items) {
      const {items} = this.props;
      const checked = [];

      each(items, item => {
        checked.push(item.ticket_id.toString());
      });

      this.props.action(['demandShowCase', 'checked'], () => checked);
    }

    setTimeout(() => {
      document
            .querySelectorAll('.showcase-hidden-order')[0]
            .querySelector('button').click();
    }, 300);
  }

  render() {
    const {props} = this;

    return (
      <button onClick={this.clickHandler}
              disabled={this.props.disabled}
              className={`btn ${props.additionalClassName}`}>
        {props.title}
      </button>
    );
  }
}

export default OrderButton;
