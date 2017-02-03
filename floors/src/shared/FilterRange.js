/**
 * Searchform filter component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {isNaN} from 'lodash';
import ReactSlider from 'react-slider/react-slider';
/**
 * React/Flux entities
 */

import shallowCompare from 'react-addons-shallow-compare';

class FilterRange extends Component {
  static propTypes = {
    valueMin: PropTypes.string,
    valueMax: PropTypes.string,
    valueLo: PropTypes.string,
    valueHi: PropTypes.string,
    handleChange: PropTypes.func,
    onAfterChange: PropTypes.func,
    type: PropTypes.string,
    title: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      valueMin: isNaN(Math.floor(props.valueMin)) ?
        0 : Math.floor(props.valueMin),
      valueMax: isNaN(Math.ceil(props.valueMax)) ?
        0 : Math.ceil(props.valueMax),
      valueLo: isNaN(Math.floor(props.valueLo)) ?
        0 : Math.floor(props.valueLo),
      valueHi: isNaN(Math.ceil(props.valueHi)) ?
        0 : Math.ceil(props.valueHi),
      hasLabel: !!(props.type === 'square' || props.type === 'square_kitchen' ||
      props.type === 'area_house'),
      searchModel: ''
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      valueLo: isNaN(Math.floor(nextProps.valueLo)) ?
        0 : Math.floor(nextProps.valueLo),
      valueHi: isNaN(Math.ceil(nextProps.valueHi)) ?
        0 : Math.ceil(nextProps.valueHi)
    }));
  }


  getContent = () => {
    const {valueLo, valueHi, valueMin, valueMax} = this.state;
    const {title} = this.props;
    let label;

    switch (this.props.type) {
    case 'area_land':
      label = ' сот.';
      break;
    case 'square':
      label = ' м<sup>2</sup>';
      break;
    case 'square_kitchen':
      label = ' м<sup>2</sup>';
      break;
    case 'area_house':
      label = ' м<sup>2</sup>';
      break;
    case 'tocenter':
      label = ' км';
      break;
    default:
      label = '';
    }

    const content = (<div>
      <div className="slider--labels clearfix">
        <p className="slider--labels__title pull-left">{title}</p>
        {<p className="slider--labels__values pull-right"
            ref="label"
            dangerouslySetInnerHTML={{
              __html: `${valueLo} - ${valueHi} ${label}`
            }}
          />}
      </div>
      <ReactSlider min={valueMin}
        max={valueMax}
        step={1}
        minDistance={0}
        value={[valueLo, valueHi]}
        onChange={this.props.handleChange.bind(this)}
        onAfterChange={this.props.onAfterChange.bind(this)}
        className="horizontal-slider filter--slider"
        orientation="horizontal"
        withBars
        ref="rangeSlider"
      />
    </div>);

    return valueMax >= valueMin ? content : <div />;
  };

  render() {
    return (
      <div className="form-group slider clearfix">
        {this.getContent()}
      </div>
    );
  }
}

export default FilterRange;
