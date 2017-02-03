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
import ga from '../../../utils/ga';

class LKMyObjectsRooms extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    field: PropTypes.object,
    type: PropTypes.string,
    item: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  constructor(props) {
    super(props);
  }

  trackEventRoom = (e) => {
    const {type} = this.props;
    const value = e.target.value;

    switch (type) {
    case 'flat':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_kvartira_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_kvartira_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_kvartira_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_kvartira_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_kvartira_komnata5');
        break;
      default: null;
      }
      break;
    case 'halt':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_dolya_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_dolya_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_dolya_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_dolya_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_dolya_komnata5');
        break;
      default: null;
      }
      break;
    case 'room':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_komnata_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_komnata_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_komnata_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_komnata_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_komnata_komnata5');
        break;
      default: null;
      }
      break;
    case 'house':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_dom_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_dom_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_dom_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_dom_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_dom_komnata5');
        break;
      default: null;
      }
      break;
    case 'cottage':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_cottage_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_cottage_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_cottage_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_cottage_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_cottage_komnata5');
        break;
      default: null;
      }
      break;
    case 'garden':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_dacha_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_dacha_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_dacha_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_dacha_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_dacha_komnata5');
        break;
      default: null;
      }
      break;
    case 'townhouse':
      switch (value) {
      case '1':
        ga('button', 'lk_myobjects_add_townhouse_komnata1');
        break;
      case '2':
        ga('button', 'lk_myobjects_add_townhouse_komnata2');
        break;
      case '3':
        ga('button', 'lk_myobjects_add_townhouse_komnata3');
        break;
      case '4':
        ga('button', 'lk_myobjects_add_townhouse_komnata4');
        break;
      case '5':
        ga('button', 'lk_myobjects_add_townhouse_komnata5');
        break;
      default: null;
      }
      break;
    case 'land':
      return null;
      break;
    default: null;
    }
  }

  render() {
    const {handleChange, field, item} = this.props;

    return (
      <div className="msearcher">
        <div className="clearfix msearcher--checkbuttons">
          <div className='msearcher--checkbuttons__item clearfix pull-left'>
              <input type="radio"
                id='radio_room1'
                checked={parseInt(item) === 1}
                data-field={field.name}
                data-type='radio'
                value={1}
                onClick={this.trackEventRoom}
                onChange={handleChange}
                />
              <label htmlFor='radio_room1' >
                <i /><span>1</span>
              </label>
          </div>
          <div className='msearcher--checkbuttons__item clearfix pull-left'>
              <input type="radio"
                id='radio_room2'
                checked={parseInt(item) === 2}
                data-field={field.name}
                data-type='radio'
                onClick={this.trackEventRoom}
                value={2}
                onChange={handleChange}
                />
              <label htmlFor='radio_room2' >
                <i /><span>2</span>
              </label>
          </div>
          <div className='msearcher--checkbuttons__item clearfix pull-left'>
              <input type="radio"
                id='radio_room3'
                checked={parseInt(item) === 3}
                data-field={field.name}
                onClick={this.trackEventRoom}
                data-type='radio'
                value={3}
                onChange={handleChange}
                />
              <label htmlFor='radio_room3' >
                <i /><span>3</span>
              </label>
          </div>
          <div className='msearcher--checkbuttons__item clearfix pull-left'>
              <input type="radio"
                id='radio_room4'
                checked={parseInt(item) === 4}
                data-field={field.name}
                onClick={this.trackEventRoom}
                data-type='radio'
                value={4}
                onChange={handleChange}
                />
              <label htmlFor='radio_room4' >
                <i /><span>4</span>
              </label>
          </div>
          <div className='msearcher--checkbuttons__item clearfix pull-left'>
              <input type="radio"
                id='radio_room5'
                checked={parseInt(item) === 5}
                data-field={field.name}
                onClick={this.trackEventRoom}
                data-type='radio'
                value={5}
                onChange={handleChange}
                />
              <label htmlFor='radio_room5' >
                <i /><span>5+</span>
              </label>
          </div>
        </div>
      </div>
    );
  }
}

export default LKMyObjectsRooms;
