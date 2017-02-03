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
import ReactSlider from 'react-slider/react-slider';
import Col from 'react-bootstrap/lib/Col';
import ga from '../../../utils/ga';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';

class LKMyObjectsInputRange extends Component {
  static propTypes = {
    field: PropTypes.object,
    item: PropTypes.object,
    handleChange: PropTypes.func,
    requireValidation: PropTypes.func,
    type: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  handleChangeRange = (value) => {
    const {handleChange, field, type} = this.props;

    handleChange(false, {
      value: value,
      field: field.name,
      type: field.type,
    });


    switch (type) {
    case 'flat':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_kvartira_square');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_kvartira_etag');
        break;
      default: null;
      }
      break;
    case 'halt':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_dolya_square');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_dolya_etag');
        break;
      default: null;
      }
      break;
    case 'room':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_komnata_square');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_komnata_etag');
        break;
      default: null;
      }
      break;
    case 'house':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_dom_square');
        break;
      case 'square_land':
        ga('slider', 'lk_myobjects_add_dom_square_uchastok');
        break;
      default: null;
      }
      break;
    case 'cottage':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_cottage_square');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_cottage_etag');
        break;
      case 'square_land':
        ga('slider', 'lk_myobjects_add_cottage_square_uchastok');
        break;
      case 'floors':
        ga('slider', 'lk_myobjects_add_townhouse_etagnost');
        break;
      default: null;
      }
      break;
    case 'garden':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_dacha_square');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_dacha_etag');
        break;
      case 'square_land':
        ga('slider', 'lk_myobjects_add_dacha_square_uchastok');
        break;
      case 'floors':
        ga('slider', 'lk_myobjects_add_townhouse_etagnost');
        break;
      default: null;
      }
      break;
    case 'townhouse':
      switch (field.name) {
      case 'square':
        ga('slider', 'lk_myobjects_add_townhouse_square');
        break;
      case 'square_land':
        ga('slider', 'lk_myobjects_add_townhouse_square_uchastok');
        break;
      case 'floor':
        ga('slider', 'lk_myobjects_add_townhouse_etag');
        break;
      case 'floors':
        ga('slider', 'lk_myobjects_add_townhouse_etagnost');
        break;
      default: null;
      }
      break;
    case 'land':
      switch (field.name) {
      case 'square_land':
        ga('slider', 'lk_myobjects_add_land_square_uchastok');
        break;
      default: null;
      }
      break;
    default: null;
    }
  }

  trackEventRange = (e) => {
    const fields = e.target.dataset.field;
    const {type} = this.props;

    switch (type) {
    case 'flat':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_kvartira_square');
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_kvartira_etag');
        break;
      default: null;
      }
      break;
    case 'halt':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_dolya_square');
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_dolya_etag');
        break;
      default: null;
      }
      break;
    case 'room':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_komnata_square');
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_komnata_etag');
        break;
      default: null;
      }
      break;
    case 'house':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_dom_square');
        break;
      case 'square_land':
        ga('input', 'lk_myobjects_add_dom_square_uchastok');
        break;
      default: null;
      }
      break;
    case 'cottage':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_cottage_square');
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_cottage_etag');
        break;
      case 'square_land':
        ga('input', 'lk_myobjects_add_cottage_square_uchastok');
        break;
      default: null;
      }
      break;
    case 'garden':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_dacha_square');
        break;
      case 'square_land':
        ga('input', 'lk_myobjects_add_dacha_square_uchastok');
        break;
      default: null;
      }
      break;
    case 'townhouse':
      switch (fields) {
      case 'square':
        ga('input', 'lk_myobjects_add_townhouse_square');
        break;
      case 'square_land':
        ga('input', 'lk_myobjects_add_townhouse_square_uchastok');
        break;
      case 'floor':
        ga('input', 'lk_myobjects_add_townhouse_etag');
        break;
      case 'floors':
        ga('input', 'lk_myobjects_add_townhouse_etagnost');
        break;
      default: null;
      }
      break;
    case 'land':
      switch (fields) {
      case 'square_land':
        ga('input', 'lk_myobjects_add_land_square_uchastok');
        break;
      default: null;
      }
      break;
    default: null;
    }
    e.stopPropagation();
  }

  render() {
    const {field, item, handleChange, requireValidation} = this.props;

    return(
        <FormGroup className='clearfix' style={{position: 'relative'}}
                    validationState={requireValidation(field.name, 0, field)}>
          <label className='control-label col-xs-6'>
            {field.title}
          </label>
          <Col xs={2}>
            <FormControl type='text'
            key={field.id}
            name={field.ries_field}
            data-field={field.name}
            data-type={field.type}
            value={item[field.name] || ''}
            onClick={this.trackEventRange}
            onChange={handleChange}/>
          </Col>
          <Col xs={4} className='lkslider--wrap'>
              <div className="slider--labels clearfix">
                {<p className="slider--labels__values pull-right"
                    ref="label"
                    dangerouslySetInnerHTML={{
                      __html: `${field.min} - ${field.max}`
                    }}
                  ></p>}
              </div>
              <ReactSlider
                min={field.min}
                max={field.max}
                step={1}
                minDistance={0}
                value={parseInt(item[field.name]) || 0}
                onChange ={this.handleChangeRange}
                className="horizontal-slider lk--slider"
                orientation="horizontal"
                withBars
                ref="rangeSlider" />
          </Col>
        </FormGroup>
    );
  }
}

export default LKMyObjectsInputRange;
