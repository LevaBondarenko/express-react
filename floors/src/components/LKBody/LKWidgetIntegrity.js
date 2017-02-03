/**
 * LKWidgetIntegrity component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
/* global data */ // eslint-disable-line no-unused-vars

class LKWidgetIntegrity extends Component {
  static propTypes = {
    searches: React.PropTypes.array,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  gotoSearches() {
    window.location.hash = '#searches';
  }

  render() {
    const pIntegrity = UserActions.getIntegrity();

    return (
      <div className='lkbody-integrity'>
        <Row>
          <Col xs={8}>
            <div className='lkbody-pagetitle'>Ваш профиль:</div>
          </Col>
          <Col xs={4} className='lkbody-integrity-buttons'>
            <a href='#/profile/'><i className='fa fa-pencil'/></a>
          </Col>
        </Row>
        <div className='lkbody-integrity-value'>
          <ProgressBar
            now={pIntegrity}
            label="%(percent)s%" />
          <Row>
            <Col xs={2} className='lkbody-integrity-value-percent'>
              {`${pIntegrity}%`}
            </Col>
            <Col xs={10}>
              Заполнение профиля в личном кабинете позволит нам найти наиболее
              подходящий Вашим потребностям и интересам вариант
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default LKWidgetIntegrity;

