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
import {declOfNum} from '../../../utils/Helpers';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class BoxFavs extends Component {
  static propTypes = {
    className: PropTypes.string,
    favs: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      favs: props.favs
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      favs: nextProps.favs
    }));
  }

  render() {
    const {favs} = this.state;
    const countTitle =
      declOfNum(favs, [
        'потенциальный клиент',
        'потенциальных клиента',
        'потенциальных клиентов'
      ]);

    return favs ? (
      <Col xs={4} className={this.props.className}>
        <div className='boxStat--wrap'>
          <div className='boxStat--wrap__head'>
            <span className='fa fa-heart-o fa-5x' />
          </div>
          <div className='boxStat--wrap__count'>
            <span>{favs}</span> <span>{countTitle}</span>
          </div>
          <div className='boxStat--wrap__body'>
            добавили Ваш объект<br/>недвижимости в Избранное
          </div>
          <div className='boxStat--wrap__actions'>
            &nbsp;
          </div>
        </div>
      </Col>
    ) : null;
  }
}

export default BoxFavs;
