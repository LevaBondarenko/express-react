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
import moment from 'moment/moment';
import {objPropsConvert} from '../../../utils/Helpers';
import api from '../../../api/apiLK';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

class BoxRise extends Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    userMeta: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.timer = null;
    this.tick = this.tick.bind(this);
    this.state = {
      lastRised: this.getLastRised(props),
      nextRiseIn: -1,
      isLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      lastRised: this.getLastRised(nextProps),
      isLoading: false,
      nextRiseIn: -1
    }));
  }

  componentDidMount() {
    if(this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getLastRised(props) {
    const {id, userMeta} = props;
    const lastRised = userMeta.lastRised ? JSON.parse(userMeta.lastRised) : [];

    return lastRised[id] ? lastRised[id] : null;
  }

  tick() {
    const {lastRised} = this.state;
    const nextRiseIn = lastRised ?
      (moment(lastRised).add(1, 'days').format('x') -
      moment().format('x')) : -1;

    (nextRiseIn > 0) && this.setState(() => ({nextRiseIn: nextRiseIn}));
  }

  rise(e) {
    const {id} = this.props;
    const {isLoading} = this.state;

    e.preventDefault();
    if(!isLoading) {
      this.setState(() => ({isLoading: true}));
      api.rise(id).then(response => {
        UserActions.set(null, {userMeta: objPropsConvert(response, true)});
      }, error => {
        const msg = error.res && error.res.body ?
          error.res.body.data : '---';

        this.setState(() => ({isLoading: false}));
        WidgetsActions.set('notify',[{
          msg: `Ошибка поднятия объекта: ${msg}`,
          type: 'dang'
        }]);
      }).catch(() => {
        this.setState(() => ({isLoading: false}));
        WidgetsActions.set('notify',[{
          msg: 'Ошибка поднятия объекта - обратитесь в службу поддержки',
          type: 'dang'
        }]);
      });
    }
  }

  get countDown() {
    const {nextRiseIn} = this.state;
    const timeLeft = moment(nextRiseIn).subtract(5, 'hours');
    const hoursLeft = timeLeft.format('HH');
    const minutesLeft = timeLeft.format('mm');
    const secondsLeft = timeLeft.format('ss');

    return (
      <Col xs={4} className={this.props.className}>
        <div className='boxRise--wrap'>
          <div className='boxRise--wrap__head'>
            <span>осталось</span>
            <span className='fa fa-clock-o fa-5x' />
          </div>
          <Row className='boxRise--wrap__timer'>
            <Col xs={4} className='hours'>
              <span className='value'>{hoursLeft}</span>
              <span className='title'>час</span>
            </Col>
            <Col xs={4} className='minutes'>
              <span className='value'>{minutesLeft}</span>
              <span className='title'>мин</span>
            </Col>
            <Col xs={4} className='seconds'>
              <span className='value'>{secondsLeft}</span>
              <span className='title'>сек</span>
            </Col>
          </Row>
          <div className='boxRise--wrap__body'>
            приоритетного размещения на сайте www.etagi.com
          </div>
          <div className='boxRise--wrap__actions'>
            <span className='activated'>
              <span className='fa fa-check'/>
              <span> Активировано</span>
            </span>
          </div>
        </div>
      </Col>
    );
  }

  get activator() {
    const {isLoading} = this.state;

    return (
      <Col xs={4} className={this.props.className}>
        <div className='boxRise--wrap'>
          <div className='boxRise--wrap__head'>
            <span>приоритетное размещение на сайте</span>
            <span className='fa fa-angle-double-up fa-5x' />
          </div>
          <div className='boxRise--wrap__timer'>
            <div className='right-now'>Прямо сейчас</div>
          </div>
          <div className='boxRise--wrap__body'>
            вы можете активировать приоритетное размещение на сайте
            etagi.com и Ваш объект будет выше других в выдаче
          </div>
          <div className='boxRise--wrap__actions'>
            <div className='lkobjects--btn-wrap'>
              <a href='#'
                disabled={isLoading}
                className='btn-draft'
                onClick={this.rise.bind(this)}>
                  {isLoading ? (
                    <i className='fa fa-spinner fa-spin'/>
                  ) : 'Активировать'}
              </a>
            </div>
          </div>
        </div>
      </Col>
    );
  }

  render() {
    const {lastRised, nextRiseIn} = this.state;

    return lastRised && nextRiseIn > 0 ? this.countDown : this.activator;
  }
}

export default BoxRise;
