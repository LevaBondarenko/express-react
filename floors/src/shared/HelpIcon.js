/**
 * Shared FavButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
/**
 * Bootstrap 3 elements
 */
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

class HelpIcon extends Component {
  static propTypes = {
    helpText: PropTypes.any,
    placement: PropTypes.string,
    className: PropTypes.string,
    closeButton: PropTypes.bool,
    id: PropTypes.string
  };
  defaultProps = {
    id: ''
  };

  close = () => {
    document.body.click();
  }

  render() {
    const tooltip = (
      <Tooltip id={`etagi-help-icon${this.props.id}`}
        className={classNames('etagi-help-icon', this.props.className)}>
        {this.props.helpText}
        {this.props.closeButton ? (
          <a className='help-close' onClick={this.close}>&times;</a>
        ) : null}
      </Tooltip>
    );

    return (
      <span className={classNames('etagi-help-icon', this.props.className)}>
        <OverlayTrigger
          trigger={['hover', 'focus', 'click']}
          rootClose={true}
          placement={this.props.placement}
          overlay={tooltip}>
          <span id={this.props.id} className='fa fa-question'/>
        </OverlayTrigger>
      </span>
    );
  }
}

export default HelpIcon;
