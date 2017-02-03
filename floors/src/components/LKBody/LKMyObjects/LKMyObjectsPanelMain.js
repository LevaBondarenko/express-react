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
import {testPhone, phoneFormatter, phoneCleanup} from '../../../utils/Helpers';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import UserActions from '../../../actions/UserActions';
import ga from '../../../utils/ga';

/*global data*/

class LKMyObjectsPanelMain extends Component {
  static propTypes = {
    types: PropTypes.array,
    user: PropTypes.object,
    type: PropTypes.string,
    handleTypeChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      phone: this.props.user.phone || '+7 ',
      phoneCorrect: false
    };

  }

  trackEvent = (e) => {
    const key = e.target.value;

    switch (key) {
    case 'flat' : //квартира
      ga('combobox', 'lk_myobjects_add_kvartira');
      break;
    case 'halt' : //доля
      ga('combobox', 'lk_myobjects_add_dolya');
      break;
    case 'room' : //комната
      ga('combobox', 'lk_myobjects_add_komnata');
      break;
    case 'house' : //дом
      ga('combobox', 'lk_myobjects_add_house');
      break;
    case 'cottage' : //коттедж
      ga('combobox',  'lk_myobjects_add_kottedzh');
      break;
    case 'garden' : //квартира
      ga('combobox',  'lk_myobjects_add_dacha');
      break;
    case 'townhouse' : //Таунхаус
      ga('combobox', 'lk_myobjects_add_taunhaus');
      break;
    case 'land' : //квартира
      ga('combobox',  'lk_myobjects_add_land');
      break;
    default: null;
    }
    e.stopPropagation();
  }

  getOptions = () => {
    const {types} = this.props;
    const options = types.map(type => (
      <option value={type.en} key={type.id}>{type.ru}</option>
    ));

    return options;
  };

  phoneChange(e) {
    let {value} = e.target;

    value = value.substr(0, 18);
    this.setState(() => ({
      phone: phoneFormatter(
        value,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ),
      phoneCorrect: testPhone(phoneCleanup(value), true)
    }));
  }

  savePhone() {
    UserActions.updateUser({phone: phoneCleanup(this.state.phone)});
  }

  render() {
    const {handleTypeChange} = this.props;
    const {phoneCorrect} = this.state;
    const phone = this.state.phone.length ?
      phoneFormatter(this.state.phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : this.state.phone;

    return(
      <Col xs={6} xsOffset={2} className='lkbody-myObjects__topStep'>
        <div className='form-group clearfix'>
          <label className='control-label col-xs-6'>Тип недвижимости</label>
          <Col xs={6}>
            <select type='select'
              value={this.props.type}
              onClick={this.trackEvent}
              onChange={handleTypeChange}
              placeholder='Тип недвижимости'
              className='form-control'>
              {this.getOptions()}
            </select>
          </Col>
        </div>
        {(!this.props.user.phone || this.props.user.phone === ''  ?
         (<FormGroup className='clearfix'>
            <label className='control-label col-xs-6'>Телефон</label>
          <Col xs={6}>
            <FormControl type='text'
              placeholder='+7 (___) ___-__-__'
              className='lkPhone'
              onClick={this.savePhone.bind(this)}
              value={phone}
              onChange={this.phoneChange.bind(this)}/>
              <Button
                bsStyle='default'
                disabled={!phoneCorrect}>
                <i className='fa fa-floppy-o'/>
              </Button>
          </Col>
        </FormGroup>) : false)}
      </Col>
    );
  }
}

export default LKMyObjectsPanelMain;
