/**
 * Countdown component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {declOfNum} from '../../utils/Helpers';
import withStyles from '../../decorators/withStyles';
import styles from './countdown.css';

/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
@withStyles(styles)
class Countdown extends Component {
  static propTypes = {
    baseTime: React.PropTypes.string,
    serverTime: React.PropTypes.string,
    timeMode: React.PropTypes.string,
    showMode: React.PropTypes.string,
    label1Before: React.PropTypes.string,
    label1After: React.PropTypes.string,
    label2Before: React.PropTypes.string,
    label2After: React.PropTypes.string,
    digitsColor: React.PropTypes.string,
    labelsColor: React.PropTypes.string,
    label1Color: React.PropTypes.string,
    label2Color: React.PropTypes.string
  };
  static defaultProps = {
    timeMode: 'auto',
    showMode: 'always',
    label1Before: '',
    label1After: '',
    label2Before: '',
    label2After: '',
    digitsColor: '#000',
    labelsColor: '#000',
    label1Color: '#000',
    label2Color: '#000'
  };
  constructor(props) {
    super(props);
    this.timer = null;
    this.tick.bind(this);
    const currentTime = new Date();
    const serverTime = new Date(props.serverTime.replace(' ', 'T'));
    const baseTime = new Date(props.baseTime.replace(' ', 'T'));

    this.state = {
      timeLeft: baseTime - serverTime,
      timeCorrection: currentTime - serverTime
    };
  }

  componentDidMount() {
    const timeMode = this.props.timeMode;

    this.timer = setInterval(() => { this.tick(); },
      timeMode === 'auto' || timeMode === 'timer' ? 1000 : 10000);
  }

  componentWillUnmount() {
    if(this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    const curTime = new Date();
    const baseTime = new Date(this.props.baseTime.replace(' ', 'T'));

    this.setState(() => ({
      timeLeft: baseTime - curTime + this.state.timeCorrection
    }));
  }


  render() {
    const {timeLeft} = this.state;
    const {showMode, timeMode, digitsColor, labelsColor, label1Color,
      label2Color, label1Before, label1After, label2Before, label2After} =
      this.props;
    let out = null, label1 = '', label2 = '';

    if(showMode === 'always' ||
      (showMode === 'showBefore' && timeLeft > 0) ||
      (showMode === 'showAfter' && timeLeft < 0)) {
      let absTimeLeft = Math.abs(timeLeft);
      const days = absTimeLeft / 86400000 | 0;
      const totalHours = (absTimeLeft) / 3600000 | 0;

      absTimeLeft -= days * 86400000;
      const hours = (absTimeLeft) / 3600000 | 0;

      absTimeLeft -= hours * 3600000;
      const minutes = (absTimeLeft) / 60000 | 0;

      absTimeLeft -= minutes * 60000;
      const seconds = (absTimeLeft) / 1000 | 0;
      const daysLabels = ['день', 'дня', 'дней'];
      const hoursLabels = ['час', 'часа', 'часов'];
      const minutesLabels = ['минута', 'минуты', 'минут'];
      const secondsLabels = ['секунда', 'секунды', 'секунд'];

      label1 = timeLeft > 0 ? label1Before : label1After;
      label2 = timeLeft > 0 ? label2Before : label2After;

      switch(timeMode) {
      case 'auto':
        out =
          (<Row>
            <Col xs={3}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {(`0${days}`).slice(-2)}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(days, daysLabels)}
              </span>
            </Col>
            <Col xs={3}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {(`0${hours}`).slice(-2)}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(hours, hoursLabels)}
              </span>
            </Col>
            <Col xs={3}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {(`0${minutes}`).slice(-2)}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(minutes, minutesLabels)}
              </span>
            </Col>
            <Col xs={3}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {(`0${seconds}`).slice(-2)}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(seconds, secondsLabels)}
              </span>
            </Col>
          </Row>);
        break;
      case 'days':
        out =
          (<Row>
            <Col xs={12}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {days}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(days, daysLabels)}
              </span>
            </Col>
           </Row>);
        break;
      case 'hours':
        out =
          (<Row>
            <Col xs={12}>
              <span className='countdown-digits' style={{color: digitsColor}}>
                {totalHours}
              </span>
              <span className='countdown-labels' style={{color: labelsColor}}>
                {declOfNum(totalHours, hoursLabels)}
              </span>
            </Col>
           </Row>);
        break;
      default:
        //do nothing...
      }
    }
    return (
      <div className="countdown">
        <div className='countdown-label' style={{color: label1Color}}>
          {label1}
        </div>
        {out}
        <div className='countdown-label' style={{color: label2Color}}>
          {label2}
        </div>
      </div>
    );
  }
}

export default Countdown;
