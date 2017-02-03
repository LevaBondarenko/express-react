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

class BoxBids extends Component {
  static propTypes = {
    className: PropTypes.string,
    bids: PropTypes.number,
    oid: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      bids: props.bids
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      bids: nextProps.bids
    }));
  }

  get link() {
    const {oid} = this.props;

    oid;
    return '#/myauctions/';
  }

  render() {
    const {bids} = this.state;
    const countTitle =
      declOfNum(bids, ['ставка', 'ставки', 'ставок']);

    return bids ? (
      <Col xs={4} className={this.props.className}>
        <div className='boxStat--wrap'>
          <div className='boxStat--wrap__head'>
            <span className='fa fa-gavel fa-5x' />
          </div>
          <div className='boxStat--wrap__count'>
            <span>{bids}</span> <span>{countTitle}</span>
          </div>
          <div className='boxStat--wrap__body'>
            &nbsp;<br/>&nbsp;
          </div>
          <div className='boxStat--wrap__actions'>
            <a href={this.link}>
              <span className='fa fa-chevron-circle-right'/>
              <span> Продолжить торги</span>
            </a>
          </div>
        </div>
      </Col>
    ) : null;
  }
}

export default BoxBids;
