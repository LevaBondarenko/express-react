/**
 * Modular Searcher Input component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom'; // eslint-disable-line no-unused-vars
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import wss from '../../stores/WidgetsStateStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import WidgetsActions from '../../actions/WidgetsActions';
import withCondition from '../../decorators/withCondition';
import {each, extend} from 'lodash';
import FRange from '../../shared/FilterRange';
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';
import Hint from '../../shared/Hint';

@withCondition()
class FilterRange extends Component {
  static propTypes = {
    searcherProperty: React.PropTypes.string,
    title: React.PropTypes.string,
    hintText: React.PropTypes.string,
    showHint: React.PropTypes.string,
    visibilityProperty: React.PropTypes.string
  };

  static defaultProps = {
    hintText: 'Подобрано count {вариант|варианта|вариантов} квартир'
  };

  constructor(props) {
    super(props);
    this.state = {
      input: '',
      displayHint: false,
      loadingHint: false
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
    wss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
    wss.offChange(this.onChange);
  }

  componentDidMount() {
    const {visibilityProperty} = this.props;

    visibilityProperty && WidgetsActions.set(visibilityProperty, true);
  }

  onChange = () => {
    const valueHi = mss.get(`${this.props.searcherProperty}_max`) || '';
    const valueLo = mss.get(`${this.props.searcherProperty}_min`) || '';
    const {limits} = mss.get();
    const {props} = this;

    if (limits) {
      this.setState(() => ({
        valueLo: valueLo ? valueLo :
          limits[`${props.searcherProperty}_min`],
        valueHi: valueHi ? valueHi :
          limits[`${props.searcherProperty}_max`]
      }));
    }
  }

  handleChange(value)  {
    this.setState(() => ({
      valueLo: value[0],
      valueHi: value[1],
      displayHint: true,
      loadingHint: true
    }));
  };

  onAfterChange(value) {
    // const {type} = this.props; //eslint-disable-line
    const type = this.props.searcherProperty; //eslint-disable-line
    const limits = mss.get('limits');

    let data = {
      [`${type}_min`]: value[0].toString(),
      [`${type}_max`]: value[1].toString(),
    };
    const perPage = mss.get('perPage');

    each(data, (val, t) => {
      // если значение максимально или минимально возможное (которое в mss.get('limits')), то
      // необязательно его подставлять в адр. строку
      if (parseInt(val) === Math.floor(limits[t]) ||
          parseInt(val) === Math.ceil(limits[t])) {
        data[t] = undefined;
        Url.updateSearchParam(t, undefined);
      } else {
        // data[t] = val;
        Url.updateSearchParam(t, val);
      }
    });

    data = extend({offset: 0, currentPage: 0}, data);
    ModularSearcherActions.set(null, data);

    // очищаем страницу в url
    Url.updateSearchParam('currentPage', undefined);

    getSearchResult(
      mss.get('class'),
      perPage,
      0,
      mss.get(),
      {}
    );

    // нужно ли перисчитывать кол-во объектов при изменении фильтра?
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll', () => {
      this.setState(() => ({
        loadingHint: false
      }));
      this.timer2 = setTimeout(() => {
        this.setState(() => ({
          displayHint: false
        }));
      }, 2000);
    });
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
  }

  render() {
    const props = this.props;
    const limits = mss.get('limits');

    if (!limits) {
      return null;
    }

    const valueMax = limits[`${props.searcherProperty}_max`];
    const valueMin = limits[`${props.searcherProperty}_min`];
    const {valueLo, valueHi} = this.state;
    const {hintText, showHint} = props;

    return (
      <div className="filterwidget-wrapper"
           style={{display: wss.get(props.visibilityProperty) ?
             'block' : 'none'}}>
        {showHint ? (
          <Hint
            template={hintText}
            display={this.state.displayHint}
            loading={this.state.loadingHint}
            top={23}
            left={241}
            count={mss.get('count')}
            {...props}
          />
        ) : null}
        <FRange title={props.title}
                     valueMin={valueMin}
                     valueMax={valueMax}
                     valueLo={valueLo ? valueLo : valueMin}
                     valueHi={valueHi ? valueHi : valueMax}
                     handleChange={this.handleChange.bind(this)}
                     onAfterChange={this.onAfterChange.bind(this)}
                     type={props.searcherProperty}
                     ref={props.searcherProperty}/>
      </div>
    );
  }
}

export default FilterRange;
