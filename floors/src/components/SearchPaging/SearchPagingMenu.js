/**
 * Searchpaging menu wrapper
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

class SearchPagingMenu extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.node
    ])
  };

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Col xs={7} className='dateFilter--wrap'>
        <Row>
          {this.props.children.map((child, key) => {
            return (
              <Col xs={3} className='dateFilter--item' key={key}>
                {child}
              </Col>
            );
          })}
        </Row>
      </Col>
    );
  }
}

export default SearchPagingMenu;
