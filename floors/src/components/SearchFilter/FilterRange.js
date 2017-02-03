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
import {clone, isNaN, each, extend} from 'lodash';
import ReactSlider from 'react-slider/react-slider';
/**
 * React/Flux entities
 */

import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import shallowCompare from 'react-addons-shallow-compare';
import {getSearchResult} from '../../actions/SearchActions';

class FilterRange extends Component {
  static propTypes = {
    valueMin: PropTypes.number,
    valueMax: PropTypes.number,
    valueLo: PropTypes.number,
    valueHi: PropTypes.number,
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

  componentDidMount() {
    this.setState({
      searchModel: clone(mss.get())
    });
  }

  handleChange = (value) => {
    this.setState(() => ({
      valueLo: value[0],
      valueHi: value[1]
    }));
  };

  onAfterChange = (value) => {
    const {type} = this.props;
    let data = {
      [`${type}_min`]: value[0].toString(),
      [`${type}_max`]: value[1].toString(),
    };
    const perPage = mss.get('perPage');
    const limits = mss.get('limits');

    each(data, (val, t) => {
      // если значение максимально или минимально возможное (которое в mss.get('limits')), то
      // необязательно его подставлять в адр. строку
      if (parseInt(val) === Math.floor(limits[t]) ||
        parseInt(val) === Math.ceil(limits[t])) {
        data[t] = undefined;
      }
    });

    // Url.updateSearchParam('page', undefined);
    data = extend({offset: 0, currentPage: 0}, data);
    ModularSearcherActions.set(null, data);

    getSearchResult(
      mss.get('class'),
      perPage,
      0,
      mss.get(),
      {}
    );

    // нужно ли перисчитывать кол-во объектов при изменении фильтра?
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');

    ModularSearcherActions.getCount();

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
          ></p>}
      </div>
      <ReactSlider min={valueMin}
      max={valueMax}
      step={1}
      minDistance={0}
      defaultValue={[valueLo, valueHi]}
      onChange={this.handleChange}
      onAfterChange={this.onAfterChange}
      className="horizontal-slider filter--slider"
      orientation="horizontal"
      withBars
      ref="rangeSlider" />
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
