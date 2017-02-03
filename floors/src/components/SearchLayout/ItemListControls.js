/**
 * Searchform house component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class ItemListControls extends Component {
  static propTypes = {
    location: PropTypes.string
  };

  render() {
    const {location} = this.props;

    return (
      <div className='item--controls clearfix'>
        <a href={location} className='col-md-3 item--controls__more'>
          Подробнее
        </a>
      </div>
    );
  }
}

export default ItemListControls;
