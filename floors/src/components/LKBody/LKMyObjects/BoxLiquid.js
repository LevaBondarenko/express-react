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
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Row from 'react-bootstrap/lib/Row';
import ReactSlider from 'react-slider/react-slider';
import {isEmpty, isObject} from 'lodash';
import {priceFormatter, priceCleanup} from '../../../utils/Helpers';
import ga from '../../../utils/ga';

class BoxLiquid extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    liquid: PropTypes.object,
    item: PropTypes.object,
    handleChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      liquid: props.liquid ? props.liquid : {},
      valueEvent: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({liquid: nextProps.liquid ? nextProps.liquid : {}}));
  }

  handleBlur = (e) => {
    const {item} = this.props;

    item.price = item.price < 100000 ? item.price * 1000 : item.price;
    e.stopPropagation();
  }

  handleChangeRange = (value) => {
    const {handleChange, type} = this.props;
    const {valueEvent} = this.state;
    const field = type === 'sell' ? 'price' : `price_${type}`;

    if (valueEvent < value) {
      ga('slider', 'right', 'lk_myobjects_add_diapazon_ceny');
    }else if (valueEvent > value) {
      ga('slider', 'left', 'lk_myobjects_add_diapazon_ceny');
    }else {
      return null;
    }
    handleChange(false, {
      value: value,
      field: field,
      type: 'number',
    });
    this.setState({
      valueEvent: value
    });
  }

  get labelTitle() {
    return this.props.type === 'sell' ?
      'Продать за, руб.' : 'Сдать за, руб./мес.';
  }

  googleEvent = () => {

  }

  getBlockContent = () => {
    let content;
    const {item, handleChange, type} = this.props;
    let price;

    if(type === 'sell') {
      price = item && item.price ? priceFormatter(item.price) : '';
    } else {
      price = item && item.price_rent ? priceFormatter(item.price_rent) : '';
    }
    const field = type === 'sell' ? 'price' : `price_${type}`;



    if(isEmpty(this.state.liquid) || !isObject(this.state.liquid[type])) {
      content = (
        <Row>
          <Col xs={12}>
            <FormGroup>
              <Col xs={6}>
                <ControlLabel>
                  {this.labelTitle}
                </ControlLabel>
              </Col>
              <Col xs={6}>
                <FormControl type='text'
                  label={this.labelTitle}
                  data-field={field}
                  data-type='number'
                  onChange={handleChange}
                  onBlur={this.handleBlur}
                  className='boxLiquid--form-control'
                  value={price}/>
              </Col>
            </FormGroup>
          </Col>
          <Col xs={12}>
              <p className='small text-center'>
                База объектов вашего города недостаточна для оценки объекта
              </p>
          </Col>
        </Row>
      );
    } else {
      const data = this.state.liquid[type];

      price = data.analitic_price && item && price === '' ?
        priceFormatter(
          (type === 'sell' ?
            Math.floor(data.analitic_price) : data.analitic_price) * 1000) :
        priceFormatter(priceCleanup(price));
      const bound = (data.up_bound - data.low_bound) * 0.33;
      const minPrice = (data.low_bound - bound) * 1000;
      const maxPrice = (data.up_bound + bound) * 1000;

      /*analitic_price
      low_bound
      up_bound*/
      content = (
        <Row>
          <Col xs={12}>
            <FormGroup>
              <Col xs={6}>
                <ControlLabel >
                  {this.labelTitle}
                </ControlLabel>
              </Col>
              <Col xs={6}>
                <FormControl type='text'
                  data-field={field}
                  data-type='number'
                  onChange={handleChange}
                  onClick={this.googleEvent}
                  onBlur={this.handleBlur}
                  className='boxLiquid--form-control'
                  value={price}/>
              </Col>
            </FormGroup>
          </Col>
          <div className='price-min'>
            {priceFormatter(data.low_bound * 1000)}
          </div>
          <div className='price-max'>
            {priceFormatter(data.up_bound * 1000)}
          </div>
          <Col xs={12}>
            <ReactSlider
              min={minPrice}
              max={maxPrice}
              step={(maxPrice - minPrice) / 50 | 0}
              value={parseInt(priceCleanup(price))}
              className="horizontal-slider lk--slider"
              orientation="horizontal"
              withBars
              onChange={this.handleChangeRange.bind(this)}
              ref="rangeSlider" />
            <p className='small text-center'>рекомендуемый диапазон цен</p>
          </Col>
        </Row>
      );
    }

    return content;
  };

  render() {

    return (
      <Col xs={4} className={this.props.className}>
        <div className='boxLiquid--wrap'>
          <div className='boxLiquid--wrap__title'>
            <h3>{this.props.title}</h3>
            <p>Рыночная стоимость</p>
          </div>
          <div className='boxLiquid--wrap__body clearfix'>
            <Col xs={12} style={{padding: 0}}>
              {this.getBlockContent()}
            </Col>
            {this.props.children}
          </div>
        </div>
      </Col>
    );
  }
}

export default BoxLiquid;
