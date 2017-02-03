import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import {isEqual} from 'lodash';
import moment from 'moment/moment';
import Button from 'react-bootstrap/lib/Button';

class SwitcherPeriod extends Component {
  static propTypes = {
    buttons: PropTypes.array,
    selection: PropTypes.string,
    dateMin: PropTypes.string,
    dateMax: PropTypes.string,
    handleButton: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  deltaTime = (selectedValue) => {
    return selectedValue > 0 ? selectedValue * 24 * 60 * 60 * 1000 : 0;
  };

  dateTo = (selectedValue) => {
    const {dateMax} = this.props;

    return selectedValue === -1 ? dateMax : moment().format('YYYY-MM-DD');
  };

  dateFrom = (selectedValue) => {
    const {dateMin} = this.props;
    const deltaTime = this.deltaTime(selectedValue);

    return selectedValue > 0 ? moment(
      parseInt(moment().format('x')) - deltaTime).format('YYYY-MM-DD'
    ) : (selectedValue === -1 ? dateMin : null);
  };

  handleButton = (event) => {
    const {buttons, selection} = this.props;
    const key = parseInt(event.target.dataset.value);
    const curValue = selection === '' ? -2 : selection;
    const selectedValue = parseInt(buttons[key]['value']);

    curValue !== selectedValue && this.props.handleButton(
      this.dateFrom(selectedValue),
      this.dateTo(selectedValue),
      selectedValue
    );

  }

  render() {
    const {selection, buttons} = this.props;

    return (
      <div className='switcher-wrapper'>
        <ButtonGroup>
          {buttons.map((btn, key) => (
            <Button
              key={key}
              active={isEqual(btn.value, selection) ? true : false}
              onClick={this.handleButton}
              data-value={key}>
              {btn.text}
            </Button>))}
        </ButtonGroup>
      </div>
    );
  }
}

export default SwitcherPeriod;
