/**
 * LK MyObjects view page
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class LKMyObjectsView extends Component {
  static propTypes = {
    myobjects: PropTypes.array,
    objectId: PropTypes.string,
    types: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          страница просмотра
        </Col>
      </Row>
    );
  }
}

export default LKMyObjectsView;
