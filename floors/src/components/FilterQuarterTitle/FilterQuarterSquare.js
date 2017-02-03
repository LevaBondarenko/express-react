/**
 * Searchform priceforms component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

/**
 * React/Flux entities
 */
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import FilterQuarterStore from '../../stores/FilterQuarterStore';

import ReactSlider from 'react-slider/react-slider';

class FilterQuarterSquare extends Component {
  static propTypes = {
    dataModel: PropTypes.object,
    squareMin: PropTypes.number,
    squareMax: PropTypes.number
  }

  constructor(props) {
    super(props);
    this.state = {
      square: '',
      squareSliderMin: this.props.squareMin !== undefined &&
       props.dataModel.square[0] < this.props.squareMin ?
        this.props.squareMin : props.dataModel.square[0],
      squareSliderMax: this.props.squareMax !== undefined &&
       props.dataModel.square[1] > this.props.squareMax ?
        this.props.squareMax : props.dataModel.square[1]
    };
    this.onChange = this.onChange.bind(this);
  }

  onAfterChange(val) {
    this.setState(() => ({
      square: val
    }));
    FilterQuarterActions.change('square', val);
  }

  componentWillMount() {
    const squareMinDefault = this.props.squareMin !== undefined ?
     this.props.squareMin : +this.props.dataModel.square[0];
    const squareMaxDefault = this.props.squareMax !== undefined ?
     this.props.squareMax : +this.props.dataModel.square[1];

    FilterQuarterActions.change('square', [squareMinDefault, squareMaxDefault]);
  }

  componentDidMount() {
    const squareMinDefault = this.props.squareMin !== undefined ?
     this.props.squareMin : +this.props.dataModel.square[0];
    const squareMaxDefault = this.props.squareMax !== undefined ?
     this.props.squareMax : +this.props.dataModel.square[1];

    FilterQuarterActions.change('square', [squareMinDefault, squareMaxDefault]);
  }


  onChange(val) {
    this.setState(() => ({
      squareSliderMin: val[0],
      squareSliderMax: val[1]
    }));
  }

  render() {
    const state = this.state,
      onChange = this.onChange,
      onAfterChange = this.onAfterChange,
      squareMinInt = +FilterQuarterStore.model.squareInterval[0],
      squareMaxInt = +FilterQuarterStore.model.squareInterval[1];
    let
      step = (squareMaxInt - squareMinInt) / 50;
    const {squareMax, squareMin, dataModel} = this.props;
    const squareMinDefault = squareMin !== undefined ? squareMin :
     +dataModel.square[0];
    const squareMinMaxDefault = squareMax !== undefined ? squareMax :
     +dataModel.square[1];

    step = (step < 1) ? 1 : step;
    step = +step.toFixed(0);

    return (
        <div className="form-group clearfix">
            <ReactSlider min={squareMinInt}
            max={squareMaxInt}
            step={step}
            minDistance={step}
            defaultValue={[squareMinDefault, squareMinMaxDefault]}
            onChange={onChange}
            onAfterChange={onAfterChange.bind(this)}
            className="horizontal-slider"
            orientation="horizontal"
            withBars />
            <span className="from">от&nbsp;
                <span>{state.squareSliderMin}</span> м<sup>2</sup>
            </span>
            <span className="to">до&nbsp;
                <span>{state.squareSliderMax}</span> м<sup>2</sup>
            </span>
        </div>
    );
  }
}

export default FilterQuarterSquare;
