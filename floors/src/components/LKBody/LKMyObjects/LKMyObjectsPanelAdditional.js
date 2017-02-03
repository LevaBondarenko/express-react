/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class LKMyObjectsPanelAdditional extends Component {
  static propTypes = {
    show: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.node
    ])
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const {show, children} = this.props;

    return(
      <div>
        {(show ? children : <div />)}
      </div>
    );
  }
}

export default LKMyObjectsPanelAdditional;
