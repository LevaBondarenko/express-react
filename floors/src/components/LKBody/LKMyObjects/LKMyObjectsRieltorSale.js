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
import Row from 'react-bootstrap/lib/Row';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

class LKMyObjectsRieltorSale extends Component {
  static propTypes = {
    field: PropTypes.object,
    item: PropTypes.object,
    handleChange: PropTypes.func,
    requireValidation: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      field: {
        'id': 99,
        'category_id': 1,
        'type': 'number',
        'title': 'Продажа через риэлтора',
        'default': null,
        'name': 'rieltor_sale',
        'help': null,
        'required': '0',
        'minlength': 4,
        'min': 0,
        'max': 1,
        'order': 9,
        'editable': '0',
        'is_table': 'objects_house_houses',
        'is_screening': '0',
        'is_editable_step_0': '0',
        'is_editable_step_1': '0',
        'is_editable_step_2': '0',
        'is_editable_step_3': '0',
        'weight': '2',
        'icon': 4,
        'status': true,
        'category_editor_id': 1,
        'html_before': null,
        'html_after': null,
        'mask': null,
        'ries_field': 'rieltor_sale',
        'ries_field_position': 1
      }
    };
  }

  handleChangeRange = (value) => {
    const {handleChange} = this.props;
    const {field} = this.state;

    handleChange(false, {
      value: value,
      field: field.name,
      type: field.type,
    });
  }

  get tipLeft() {
    const tooltip = (
      <Tooltip id='saleLeftTip'>
        <p>Ваше объявление выйдет на сайте с номером телефона специалиста,
          и он займется организацией продажи квартиры
          (услуга платная 28т.р. + 1% от стоимости объекта недвижимости)</p>
      </Tooltip>
    );

    return tooltip;
  }

  get tipRight() {
    const tooltip = (
      <Tooltip id='saleRightTip'>
        <p>Ваше объявление выйдет на сайте с вашим личным номером телефона,
        Вы лично сможете заняться продажей</p>
      </Tooltip>
    );

    return tooltip;
  }

  render() {
    const {item} = this.props;
    const {field} = this.state;

    return(
      <div>
        <div className='form-group clearfix' style={{position: 'relative'}}>
            <label className="control-label col-xs-6 text-right">
              <OverlayTrigger placement="left" overlay={this.tipLeft}>
                <span>{field.title}</span>
              </OverlayTrigger>
            </label>
          <div className="control-label col-xs-6 text-right rieltorSale">
            <OverlayTrigger placement="right" overlay={this.tipRight}>
              <span>Самостоятельная продажа</span>
            </OverlayTrigger>
          </div>
          <Col xs={6} className='lkslider--wrap' style={{marginTop: '11px'}}>
              <ReactSlider
                min={field.min}
                max={field.max}
                step={1}
                minDistance={0}
                value={item[field.name] || 0}
                onChange ={this.handleChangeRange}
                className="horizontal-slider lk--slider"
                orientation="horizontal"
                withBars
                ref="rangeSlider" />
          </Col>

        </div>
        <Row>
          <Col xs={6}>
            <ul className='lklist--additional'>
              <li>- Правильно оценит стоимость</li>
              <li>- Обеспечит безопасность сделки</li>
              <li>- Сэкономит ваше время</li>
              <li>- Подготовит красивые фотографии</li>
              <li>- Напишет продающее объявление</li>
              <li>- Продаст быстрее</li>
            </ul>
          </Col>
          <Col xs={6} className='pull-right' style={{marginRight: '-40%'}}>
            <ul className='lklist--additional'>
              <li>- Сами общаетесь с покупателем</li>
              <li>- Несете риски при продаже</li>
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}

export default LKMyObjectsRieltorSale;
