/**
 * Searchform priceforms component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

/**
 * React/Flux entities
 */

import ReactSlider from 'react-slider/react-slider';

class FilterQuarterPrice extends Component {
  static propTypes = {
    dataModel: PropTypes.object,
    priceMin: PropTypes.number,
    priceMax: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      priceSliderMin: this.props.priceMin !== undefined &&
       props.dataModel.price[0] < this.props.priceMin ?
        this.props.priceMin : props.dataModel.price[0],
      priceSliderMax: this.props.priceMax !== undefined &&
       props.dataModel.price[1] > this.props.priceMax ?
        this.props.priceMax : props.dataModel.price[1],
    };
  }

  componentWillMount() {

    const priceMinDefault = this.props.priceMin !== undefined ?
     this.props.priceMin : +this.props.dataModel.price[0];
    const priceMaxDefault = this.props.priceMax !== undefined ?
     this.props.priceMax : +this.props.dataModel.price[1];
    const val = [priceMinDefault, priceMaxDefault];

    FilterQuarterActions.change('price', val);
  }

  componentDidMount() {

    const priceMinDefault = this.props.priceMin !== undefined ?
     this.props.priceMin : +this.props.dataModel.price[0];
    const priceMaxDefault = this.props.priceMax !== undefined ?
     this.props.priceMax : +this.props.dataModel.price[1];
    const val = [priceMinDefault, priceMaxDefault];

    FilterQuarterActions.change('price', val);
  }

  onAfterChange = (val) => {
    this.setState(() => ({
      price: val
    }));
    FilterQuarterActions.change('price', val);
  }

  onChange(val) {
    this.setState(() => ({
      priceSliderMin: val[0],
      priceSliderMax: val[1]
    }));
  }

  render() {
    const {dataModel, priceMin, priceMax} = this.props;

    const {priceSliderMin, priceSliderMax} = this.state;
    const onChange = this.onChange.bind(this),
      onAfterChange = this.onAfterChange.bind(this),
      step = 100;

    const priceMinInt = +dataModel.priceInterval[0];
    const priceMaxInt = +dataModel.priceInterval[1];

    const priceMinDefault = priceMin !== undefined ? priceMin :
     +dataModel.price[0];
    const priceMaxDefault = priceMax !== undefined ? priceMax :
     +dataModel.price[1];

    return (
        <div className="form-group clearfix">
            <ReactSlider min={priceMinInt}
            max={priceMaxInt}
            step={step}
            minDistance={step}
            defaultValue={[priceMinDefault, priceMaxDefault]}
            onChange={onChange}
            onAfterChange={onAfterChange}
            className="horizontal-slider"
            orientation="horizontal" withBars />
            <span className="from">от&nbsp;
              <Price price={priceSliderMin}>
                &nbsp;<PriceUnit/></Price>
            </span>
            <span className="to">до&nbsp;
              <Price price={priceSliderMax}>&nbsp;<PriceUnit/></Price>
            </span>
        </div>
    );
  }
}

export default FilterQuarterPrice;
