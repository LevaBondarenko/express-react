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
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import LKMyObjectsInputRange from './LKMyObjectsInputRange';
import LKMyObjectsRooms from './LKMyObjectsRooms';
import LKMyObjectsRieltorSale from './LKMyObjectsRieltorSale';
import Button from 'react-bootstrap/lib/Button';
import ga from '../../../utils/ga';

class LKMyObjectsPanel extends Component {
  static propTypes = {
    children: PropTypes.any,
    paneHeight: PropTypes.number,
    step: PropTypes.number,
    fields: PropTypes.array,
    item: PropTypes.object,
    handleChange: PropTypes.func,
    show: PropTypes.bool,
    rieltorSale: PropTypes.string,
    type: PropTypes.string,
    donePercent: PropTypes.number,
    scrollTothird: PropTypes.func,
    action: PropTypes.string,
    noPhone: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }


  requireValidation = (ref, help = 0, validateData = false) => {
    const {item} = this.props;
    const results = {
      success: ['success', ''],
      error: ['error', 'Это поле обязательно к заполнению'],
      warning: ['warning', '']
    };
    let result;
    const length = item[ref] ? item[ref].toString().length : 0;

    if (typeof item[ref] === 'undefined') {
      if(validateData.name === 'floor') {
        validateData.max = item.build_floors ?
          item.build_floors : validateData.max;
      }
      result = results.warning[help];
    } else if(validateData) {
      if(validateData.type === 'number') {
        if(length >= validateData.minlength &&
          parseInt(item[ref]) >= validateData.min &&
          parseInt(item[ref]) <= validateData.max) {
          result = results.success[help];
        } else {
          result = results.error[help];
        }
      }
      if(validateData.type === 'select') {
        if(length >= validateData.minlength) {
          result = results.success[help];
        } else {
          result = results.error[help];
        }
      }
      if(validateData.type === 'text') {
        if(length >= validateData.minlength) {
          result = results.success[help];
        } else {
          result = results.error[help];
        }
      }
    }

    return result;
  };


  getFields = () => {
    const {fields, handleChange, item, rieltorSale, action} = this.props;

    const filterFields = fields && fields.map(field => {
      const editable = item.status === undefined ?
        field.editable : field[`editable_step_${item.status}`];

      if(!editable) {
        return null;
      } else if(field.name === 'repair') {
        return (
          <FormGroup className='clearfix'
            key={field.id}
            validationState={this.requireValidation(field.name, 0, field)}>
              <label className='control-label col-xs-6'>
                {field.title}
              </label>
            <Col xs={6}>
              <select type='select'
              className='form-control'
              key={field.id}
              name={field.name}
              data-field={field.name}
              onClick={this.trackEvent}
              data-type={field.type}
              value={item[field.name]}
              onChange={handleChange}>
                  <option value='' key={11}>выбрать тип ремонта</option>
                  <option value={8} key={8}>черновая</option>
                  <option value={9} key={9}>улучшенная черновая</option>
                  <option value={7} key={7}>частичный ремонт</option>
                  <option value={2} key={2}>косметический ремонт</option>
                  <option value={4} key={4}>cовременный ремонт</option>
                  <option value={5} key={5}>ремонт по дизайн проекту</option>
              </select>
            </Col>
          </FormGroup>);
      } else if(field.name === 'room') {
        return (
          <div className='clearfix' style={{marginBottom: '15px'}}
            key={field.id}>
            <Col xs={6} className='text-right'>
              <label className='control-label'>{field.title}</label>
            </Col>
            <Col xs={6}>
              <LKMyObjectsRooms
                type={this.props.type}
                field={field}
                handleChange={handleChange}
                item={item[field.name] || ''} />
            </Col>
          </div>
        );
      } else if(!field.min || !field.max) {
        return (
        <FormGroup className='clearfix'
          key={field.id}
          validationState={this.requireValidation(field.name, 0, field)}>
            <label className='control-label col-xs-6'>{field.title}</label>
          <Col xs={6}>
            <FormControl type='text'
              key={field.id}
              name={field.name}
              data-field={field.name}
              data-type={field.type}
              onClick={this.trackEvent}
              value={item[field.name]}
              onChange={handleChange}/>
          </Col>
        </FormGroup>);
      } else {
        return (
          <LKMyObjectsInputRange key={field.id}
            type={this.props.type}
            hasInput={true}
            handleChange={handleChange}
            field={field}
            item={item}
            requireValidation={this.requireValidation} />
        );
      }
    });

    if(rieltorSale === '1' && action !== 'edit') {
      filterFields.push(
        <LKMyObjectsRieltorSale key={99}
          hasInput={false}
          handleChange={handleChange}
          item={item}
          requireValidation={this.requireValidation} />
      );
    }

    return filterFields;
  };

  trackEvent = (e) => {
    const {type} = this.props;
    const field = e.target.dataset.field;
    const value = e.target.value;

    switch (type) {
    case 'flat':
      switch (field) {
      case 'flat':
        ga('input',  'lk_myobjects_add_kvartira_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_kvartira_remont');
        }
        break;
      default: null;
      }
      break;
    case 'halt':
      switch (field) {
      case 'flat':
        ga('input',  'lk_myobjects_add_dolya_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_dolya_remont');
        }
        break;
      default: null;
      }
      break;
    case 'room':
      switch (field) {
      case 'flat':
        ga('input',  'lk_myobjects_add_komnata_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_komnata_remont');
        }
        break;
      default: null;
      }
      break;
    case 'house':
      switch (field) {
      case 'address_meta':
        ga('input',  'lk_myobjects_add_dom_adress');
        break;
      case 'flat':
        ga('input',  'lk_myobjects_add_dom_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_dom_remont');
        }
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_dom_etag');
        break;
      default: null;
      }
      break;
    case 'cottage':
      switch (field) {
      case 'address_meta':
        ga('input',  'lk_myobjects_add_cottage_adress');
        break;
      case 'flat':
        ga('input',  'lk_myobjects_add_cottage_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_cottage_remont');
        }
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_cottage_etag');
        break;
      default: null;
      }
      break;
    case 'garden':
      switch (field) {
      case 'address_meta':
        ga('input',  'lk_myobjects_add_dacha_adress');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_dacha_remont');
        }
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_dacha_etag');
        break;
      default: null;
      }
      break;
    case 'townhouse':
      switch (field) {
      case 'address_meta':
        ga('input',  'lk_myobjects_add_townhouse_adress');
        break;
      case 'flat':
        ga('input',  'lk_myobjects_add_townhouse_nomer_kvartiry');
        break;
      case 'repair':
        if(value !== '') {
          ga('combobox', 'lk_myobjects_add_townhouse_remont');
        }
        break;
      case 'building_year':
        ga('combobox', 'lk_myobjects_add_townhouse_god_postroiki');
        break;
      default: null;
      }
      break;
    case 'land':
      switch (field) {
      case 'address_meta':
        ga('input',  'lk_myobjects_add_land_adress');
        break;
      default: null;
      }
    default: null;
    }

    e.stopPropagation();
  }

  trackEventStep2 = () => {
    const {type} = this.props;

    switch (type) {
    case 'flat':
      ga('button',  'lk_myobjects_add_kvartira_step 2');
      break;
    case 'halt':
      ga('button',  'lk_myobjects_add_dolya_step 2');
      break;
    case 'room':
      ga('button',  'lk_myobjects_add_komnata_step 2');
      break;
    case 'house':
      ga('button',  'lk_myobjects_add_dom_step 2');
      break;
    case 'cottage':
      ga('button',  'lk_myobjects_add_cottage_step 2');
      break;
    case 'garden':
      ga('button',  'lk_myobjects_add_dacha_step 2');
      break;
    case 'townhouse':
      ga('button',  'lk_myobjects_add_townhouse_step 2');
      break;
    case 'land':
      ga('button',  'lk_myobjects_add_square_step 2');
      break;
    default:
    }
  }

  get getConitious() {
    const btn = this.props.action === 'edit' ? null : (
        parseInt(this.props.donePercent) >= 61 && !this.props.noPhone ? (
        <div onClick={this.trackEventStep2}>
          <Button
            className='getContine'
            bsStyle='success'
            onClick={this.props.scrollTothird}>
            Продолжить
          </Button>
        </div>
      ) : (
        <div>
          <Button
            disabled
            className='disabled'
            bsStyle='success'>
            Продолжить
          </Button>
        </div>
      )
    );

    return btn;
  };

  get showFields() {
    return this.props.fields ? (
      <Row className='clearfix'>
        <Col xs={6} xsOffset={2} >
          {this.getFields()}
        </Col>
        <Col xs={12} className='lkobjects--btn-wrap'>
          {this.getConitious}
        </Col>
      </Row>
    ) : (<div />);
  }

  get showPanel() {
    const {paneHeight} = this.props;

    return this.props.show ? (
      <div style={{minHeight: `${paneHeight}px`}}>
        <Row>
          {this.props.children}
        </Row>
        {this.showFields}
      </div>
    ) : (<div />);
  }

  render() {
    return(
      <Col xs={12}>
          {this.showPanel}
      </Col>
    );
  }
}

export default LKMyObjectsPanel;
