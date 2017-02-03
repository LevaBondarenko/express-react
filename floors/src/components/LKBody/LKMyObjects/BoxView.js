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
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class BoxView extends Component {
  static propTypes = {
    className: PropTypes.string,
    views: PropTypes.number,
    oid: PropTypes.number,
    type: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      views: props.views
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      views: nextProps.views
    }));
  }

  get link() {
    const {oid, type} = this.props;
    const objectClass = UserActions.objClasses[type];
    const baseUrls = {
      flats: '/realty/',
      cottages: '/realty_out/',
      offices: '/commerce/',
      rent: '/realty_rent/'
    };

    return `${baseUrls[objectClass]}${oid}`;
  }

  render() {
    const {views} = this.state;
    const countTitle =
      declOfNum(views, ['просмотр', 'просмотра', 'просмотров']);

    return views ? (
      <Col xs={4} className={this.props.className}>
        <div className='boxStat--wrap'>
          <div className='boxStat--wrap__head'>
            <span className='fa fa-eye fa-5x' />
          </div>
          <div className='boxStat--wrap__count'>
            <span>{views}</span> <span>{countTitle}</span>
          </div>
          <div className='boxStat--wrap__body'>
            вашего объекта на сайте<br/>www.etagi.com
          </div>
          <div className='boxStat--wrap__actions'>
            <a href={this.link}>
              <span className='fa fa-chevron-circle-right'/>
              <span> Посмотреть объект на сайте</span>
            </a>
          </div>
        </div>
      </Col>
    ) : null;
  }
}

export default BoxView;
