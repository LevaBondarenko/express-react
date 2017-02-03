/**
 * Created by tatarchuk on 30.04.15.
 */


import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import WidgetsActions from '../../actions/WidgetsActions';
import wss from '../../stores/WidgetsStateStore';

import DatePicker from 'react-date-picker';
import Button from 'react-bootstrap/lib/Button';
import Modal, {Body} from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import moment from 'moment/moment';
import ReactDOM from 'react-dom';
import SwitcherPeriod from './SwitcherPeriod';

moment.locale('ru');

class DateFromTo extends Component {
  static propTypes = {
    text: PropTypes.string,
    formatDate: PropTypes.string,
    nameWSS: PropTypes.string,
    nameWSSfrom: PropTypes.string,
    nameWSSto: PropTypes.string
  };

  constructor(props) {
    super(props);

    const actions = WidgetsActions;
    const store = wss;

    this.state = {
      store: store,
      actions: actions,
      date: '',
      selection: '',
      showModal: false,
      varFrom: props.nameWSSfrom,
      varTo: props.nameWSSto,
      text: '',
      dateFrom: '2014-02-03',
      datePickerFrom: '2014-02-03',
      dateMin: '2010-01-01',
      dateTo: '2015-02-03',
      datePickerTo: '2015-02-03',
      dateMax: moment().format('YYYY-MM-DD'),
      buttons: [
        {text: 'Весь период', value: '-1'},
        {text: 'месяц', value: '31'},
        {text: '6 месяцев', value: '180'},
        {text: '1 год', value: '356'}
      ]
    };

    this.onChange = this.onChange.bind(this);

  }

  componentWillMount() {
    this.state.store.onChange(this.onChange);
  }

  componentWillUnmount() {
    this.state.store.offChange(this.onChange);
  }

  onChange() {
    try {
      const dateFromWSS = this.state.store.get(this.props.nameWSSfrom);
      const dateToWSS = this.state.store.get(this.props.nameWSSto);

      this.setState(() => ({
        dateFrom: dateFromWSS,
        datePickerFrom: dateFromWSS,
        dateTo: dateToWSS,
        datePickerTo: dateToWSS
      }));
    } catch (err) {

    }
  }

  handleDateChange(variable, e) {
    const {varFrom, varTo, datePickerTo, datePickerFrom} = this.state;
    const varName = varFrom === variable ? 'datePickerFrom' : (
        varTo === variable ? 'datePickerTo' : 'anything'
    );

    const deltaDayTo = +moment(datePickerTo).format('x');
    const deltaDayFrom = +moment(datePickerFrom).format('x');
    const countDay = ((deltaDayTo - deltaDayFrom) / (24 * 60 * 60 * 1000)) + 1;

    this.setState(() => ({
      [varName]: e,
      selection: countDay.toString()
    }));
  }

  toggleShow() {}

  open() {
    ReactDOM.findDOMNode(this.refs.districtsButton).blur();
    this.setState(() => ({
      showModal: true
    }));
  }

  close() {
    this.setState(() => ({
      showModal: false
    }));
  }

  onSubmit() {
    const {datePickerFrom, datePickerTo} = this.state;

    const deltaDayTo = +moment(datePickerTo).format('x');
    const deltaDayFrom = +moment(datePickerFrom).format('x');

    const countDay = ((deltaDayTo - deltaDayFrom) / (24 * 60 * 60 * 1000)) + 1;


    WidgetsActions.set(null, {
      'date_from': datePickerFrom,
      'date_to': datePickerTo
    });

    this.setState(() => ({
      showModal: false,
      selection: countDay.toString()
    }));
  }

  handleButton(dateFrom, dateTo, curValue) {
    const {dateMin, dateMax} = this.state;
    const data = parseInt(curValue) > 0 ? {
      datePickerFrom: dateFrom,
      datePickerTo: dateTo,
      selection: curValue.toString()
    } : {
      datePickerFrom: dateMin,
      datePickerTo: dateMax,
      selection: curValue.toString()
    };

    this.setState(() => (data));

  }


  render() {

    const close = this.close.bind(this);
    const onSubmit = this.onSubmit.bind(this);
    const open = this.open.bind(this);
    const {
      showModal,
      buttons,
      selection,
      dateFrom,
      datePickerFrom,
      dateTo,
      datePickerTo,
      varFrom,
      varTo,
      dateMin,
      dateMax
    } = this.state;
    const handleButton = this.handleButton.bind(this);
    const dateFromFormat = moment(datePickerFrom).format('DD.MM.YYYY');
    const dateToFormat = moment(datePickerTo).format('DD.MM.YYYY');
    const dateFromFormatBtn = moment(dateFrom).format('DD.MM.YYYY');
    const dateToFormatBtn = moment(dateTo).format('DD.MM.YYYY');
    const period = `${dateFromFormatBtn} - ${dateToFormatBtn}`;

    return (
        <div>
          <Button
              ref='districtsButton'
              className='btn-select'
              bsStyle='default'
              onClick={open}>
            <span className="calendar-pic" />
            {period}
          </Button>
          <Modal className='etagi--modal-datePeriod wide'
            show={showModal}
            onHide={close} >
            <Button onClick={close}
              bsSize='large'
              className="etagi--closeBtn">
              <span aria-hidden="true">&times;</span>
            </Button>
            <Body className='padding-top-4 datePeriodBlock'>
              <Row>
                <Col md={12} className='buttonsDateFromTo'>
                  <SwitcherPeriod
                      buttons={buttons}
                      selection={selection}
                      dateMin={dateMin}
                      dateMax={dateMax}
                      handleButton={handleButton}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="dateCalendarLeft">
                  <div className='dt-picker'>
                    <DatePicker
                        locale='ru'
                        weekStartDay={1}
                        highlightWeekends={true}
                        date={datePickerFrom}
                        minDate={dateMin}
                        maxDate={datePickerTo}
                        onChange={this.handleDateChange.bind(this, varFrom)}
                    />
                  </div>
                </Col>
                <Col md={6} className="dateCalendarRight">
                  <div className='dt-picker'>
                    <DatePicker
                        locale='ru'
                        weekStartDay={1}
                        highlightWeekends={true}
                        date={datePickerTo}
                        minDate={datePickerFrom}
                        maxDate={dateMax}
                        onChange={this.handleDateChange.bind(this, varTo)}
                    />
                  </div>
                </Col>
              </Row>
              <Row className="padding-2">
                <Col md={12} className="text-center">
                  <input type="text"
                         placeholder="Введите дату"
                         value={dateFromFormat}
                         disabled />&nbsp;—&nbsp;
                  <input type="text"
                         placeholder="Введите дату"
                         value={dateToFormat}
                         disabled />

                  <button onClick={onSubmit}
                          className="btn btn-green btnDateFromTo">
                    Выбрать
                  </button>
                </Col>
              </Row>
            </Body>
          </Modal>
        </div>
    );
  }
}



export default DateFromTo;
