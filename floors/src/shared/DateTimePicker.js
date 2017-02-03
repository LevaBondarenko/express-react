/**
 * Shared TimePickerNano Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import TimePickerNano from './TimePickerNano';

import classNames from 'classnames';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import DatePicker from 'react-date-picker';

class DateTimePicker extends Component {
  static propTypes = {
    onDateTimeChange: React.PropTypes.func,
    datetime: React.PropTypes.string,
    minDate: React.PropTypes.string,
    maxDate: React.PropTypes.string,
    title: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    cancelTitle: React.PropTypes.string,
    saveTitle: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
    buttonClass: React.PropTypes.string,
    className: React.PropTypes.string,
    popupHeader: React.PropTypes.string,
    popupComment: React.PropTypes.string,
    rightAlign: React.PropTypes.bool,
    topAlign: React.PropTypes.bool,
    withoutTime: React.PropTypes.bool,
    id: React.PropTypes.string
  };
  static defaultProps = {
    datetime: (new Date()).toISOString(),
    title: 'Дата и Время',
    cancelTitle: 'Отмена',
    saveTitle: 'Сохранить',
    popupHeader: 'Выберите дату и время',
    popupComment: 'удобные Вам для просмотра объекта',
    rightAlign: false,
    topAlign: false,
    withoutTime: false,
    bsStyle: 'primary',
    className: ''
  };
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.closeClick = this.closeClick.bind(this);
    const datetime = props.datetime ? props.datetime.split('T') :
      (new Date()).toISOString().split('T');

    this.state = {
      title: props.title,
      date: datetime[0],
      time: props.withoutTime ?
        null : (/^[0-9]{2}:[0-9]{2}/).exec(datetime[1])[0],
      show: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const datetime = nextProps.datetime ? nextProps.datetime.split('T') :
      (new Date()).toISOString().split('T');

    this.setState(() => ({
      title: nextProps.title,
      date: datetime[0],
      time: nextProps.withoutTime ?
        null : (/^[0-9]{2}:[0-9]{2}/).exec(datetime[1])[0]
    }));
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  toggleShow() {
    if(!this.state.show) {
      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
    }
    this.setState(() => ({show: !this.state.show}));
  }

  close(e) {
    let ancestor = e.target;

//костыль конечно, но у некоторых ячеек datepicker нет родителя, пока не придумал как по-другому реализовать
    if(ancestor.classList && !ancestor.classList.contains('dp-cell')) {
      while(!(ancestor.classList && ancestor.classList.contains('lk-popup')) &&
        (ancestor = ancestor.parentNode)) {};
      if(!ancestor) {
        this.setState(() => ({show: false}));
        document.removeEventListener('click', this.close);
      }
    }
  }

  closeClick() {
    this.setState(() => ({show: false}));
    document.removeEventListener('click', this.close);
  }

  handleDateChange(e) {
    this.setState(() => ({date: e}));
  }

  handleTimeChange(e) {
    this.setState(() => ({time: e}));
  }

  save() {
    this.props.onDateTimeChange(
      this.props.withoutTime ? this.state.date :
      `${this.state.date}T${this.state.time}:00`,
      this.props.id
    );
    this.closeClick();
  }

  cancel() {
    this.props.onDateTimeChange(false);
    this.closeClick();
  }

  render() {
    const {title, date, time, show} = this.state;
    const {rightAlign, topAlign, saveTitle, cancelTitle, withoutTime, bsStyle,
      className, popupHeader, popupComment, buttonClass} = this.props;

    return (
      <div className={classNames('dt-picker', className)}>
        <Button
          bsStyle={bsStyle}
          className={buttonClass}
          onClick={this.toggleShow.bind(this)}>
            {title}
        </Button>
        {show ?
          <div className={classNames(
            'lk-popup',
            {
              'right-align': rightAlign,
              'top-align': topAlign
            }
          )}>
            <div className='lk-popup-header'>
              {popupHeader}
            </div>
            <div className='lk-popup-comment'>
              {popupComment}
            </div>
            <Row>
              {withoutTime ? null : (
                <Row>
                  <Col xs={6} xsOffset={3}>
                    <TimePickerNano
                      time={time}
                      onChange={this.handleTimeChange.bind(this)} />
                  </Col>
                </Row>
              )}
              <DatePicker
                locale='ru'
                weekStartDay={1}
                highlightWeekends={true}
                date={date}
                minDate={this.props.minDate}
                maxDate={this.props.maxDate}
                onChange={this.handleDateChange.bind(this)}/>
            </Row>
            <div className='lk-popup-controls'>
              <Button
                bsStyle='link'
                bsSize='small'
                onClick={this.cancel.bind(this)}>
                {cancelTitle}
              </Button>
              <Button
                bsStyle='primary'
                bsSize='small'
                onClick={this.save.bind(this)}>
                {saveTitle}
              </Button>
            </div>
          </div> : null
        }
        </div>
    );
  }
}

export default DateTimePicker;
