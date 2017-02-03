/**
 * Modular Searcher Range component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {priceFormatter, priceCleanup, helpPrice} from '../../utils/Helpers';
import classNames from 'classnames';
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
// временно
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';
import withCondition from '../../decorators/withCondition';
import {connect} from 'react-redux';

@withCondition()
class MSearcherRange extends Component {
  static propTypes = {
    searcherProperty: React.PropTypes.string,
    placeholderMax: React.PropTypes.string,
    placeholderMin: React.PropTypes.string,
    isShowHelp: React.PropTypes.string,
    updateResult: React.PropTypes.string,
    isFormatting: React.PropTypes.string,
    isApplyCourse: React.PropTypes.string,
    helpDigit: React.PropTypes.number,
    currency: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      course: 1,
      inputMin: '',
      inputMax: '',
      minHelpValue: '',
      maxHelpValue: '',
      minHelpShow: false,
      maxHelpShow: false,
      minHelpActive: false,
      maxHelpActive: false
    };
    this.timer;
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  updateResult = (type) => {
    if (this.props.updateResult) {

      const urlParamValue = mss.get(`${this.props.searcherProperty}_${type}`) ?
        mss.get(`${this.props.searcherProperty}_${type}`) : undefined;

      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        Url.updateSearchParam(
          `${this.props.searcherProperty}_${type}`, urlParamValue
        );

        const {perPage} = mss.get();

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
      }, 500);
    }
  }

  onChange = () => {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {currency} = this.props;
    const course = currency ? (currency.nominal / currency.value) : 1;
    let inputMin = mss.get(`${this.props.searcherProperty}_min`) || '';
    let inputMax = mss.get(`${this.props.searcherProperty}_max`) || '';

    if (isApplyCourse && currency) {
      inputMin = inputMin ? Math.round(inputMin * course) : '';
      inputMax = inputMax ? Math.round(inputMax * course) : '';
    }

    if (parseInt(this.props.isFormatting)) {
      inputMin = inputMin ? priceFormatter(inputMin) : '';
      inputMax = inputMax ? priceFormatter(inputMax) : '';
    }
    this.setState(() => ({
      inputMin: inputMin,
      inputMax: inputMax,
      course: course,
    }));
  }

  //refactor this after
  componentWillReceiveProps(nextProps) {
    const isApplyCourse = parseInt(nextProps.isApplyCourse);
    const {currency} = nextProps;
    const course = currency ? (currency.nominal / currency.value) : 1;
    let inputMin = mss.get(`${nextProps.searcherProperty}_min`) || '';
    let inputMax = mss.get(`${nextProps.searcherProperty}_max`) || '';

    if (isApplyCourse && currency) {
      inputMin = inputMin ? Math.round(inputMin * course) : '';
      inputMax = inputMax ? Math.round(inputMax * course) : '';
    }

    if (parseInt(nextProps.isFormatting)) {
      inputMin = inputMin ? priceFormatter(inputMin) : '';
      inputMax = inputMax ? priceFormatter(inputMax) : '';
    }
    this.setState(() => ({
      inputMin: inputMin,
      inputMax: inputMax,
      course: course,
    }));
  }

  getHelpValue(type, value, self) {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {currency} = this.props;
    const course = currency ? (currency.nominal / currency.value) : 1;
    const digitCorrection = isApplyCourse ?
      Math.floor(Math.log(course) / Math.log(10)) : 0;
    let second;

    value = priceCleanup(value);
    if (type === 'min') {
      second = mss.get(`${self.props.searcherProperty}_max`);
    } else {
      second = mss.get(`${self.props.searcherProperty}_min`);
    }
    if (isApplyCourse) {
      second =
        Math.round(priceCleanup(second ? second : '') * course);
    } else {
      second = priceCleanup(second ? second : '');
    }
    return helpPrice(
      value,
      type,
      second ? second.toString() : '',
      this.props.helpDigit + digitCorrection
    );
  }

  handleChange = (event) => {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {course} = this.state;
    const isShowHelp = parseInt(this.props.isShowHelp);
    const type = event.target.dataset.type;
    const value = priceCleanup(event.target.value);
    const hValue = this.getHelpValue(type, value, this);
    const hShow = value.toString().length < hValue.toString().length - 1 &&
      hValue > 0;

    ModularSearcherActions.set(
      `${this.props.searcherProperty}_${type}`,
      value ?
        (isApplyCourse ? (value / course).toString() : value).toString() : null
    );

    this.updateResult(type);

    if (isShowHelp && value.length) {
      this.setState(() => ({
        [`${type}HelpShow`]: hShow,
        [`${type}HelpValue`]: hValue
      }));
    }
  }

  handleOnFocus = (event) => {
    const isShowHelp = parseInt(this.props.isShowHelp);
    const type = event.target.dataset.type;
    const value = priceCleanup(event.target.value);
    const hValue = this.getHelpValue(type, value, this);
    const hShow = value.toString().length < hValue.toString().length - 1 &&
      hValue > 0;

    if (isShowHelp && value.length) {
      this.setState(() => ({
        [`${type}HelpShow`]: hShow,
        [`${type}HelpValue`]: hValue
      }));
    }
  }

  handleOnBlur = (event) => {
    const isShowHelp = parseInt(this.props.isShowHelp);
    const type = event.target.dataset.type;
    const self = this;
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {course} = this.state;
    const value = priceCleanup(event.target.value);

    ModularSearcherActions.set(null, {
      [`${this.props.searcherProperty}_${type}`]: value ?
        (isApplyCourse ? (value / course).toString() : value).toString() : null,
      offset: 0,
      currentPage: 0
    });

    this.updateResult(type);

    if (isShowHelp) {
      setTimeout(() => {
        self.setState(() => ({
          [`${type}HelpActive`]: false,
          [`${type}HelpShow`]: false
        }));
      }, 500);
    }
  }

  handleKeyDown = (event) => {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {course} = this.state;
    const isShowHelp = parseInt(this.props.isShowHelp);
    const type = event.target.dataset.type;
    const value = priceCleanup(event.target.value);
    const hValue = priceCleanup(this.state[`${type}HelpValue`]);

    if (isShowHelp && this.state[`${type}HelpShow`]) {
      switch (event.which) {
      case 13:
        if (this.state[`${type}HelpActive`] ||
          value.toString().length < hValue.toString().length - 1) {
          ModularSearcherActions.set(
            `${this.props.searcherProperty}_${type}`,
            (isApplyCourse ?
              (hValue / course) : hValue).toString()
          );

          this.updateResult(type);
        } else {
          ModularSearcherActions.set(
            `${this.props.searcherProperty}_${type}`,
            (isApplyCourse ?
              (value / course) : value).toString()
          );

          this.updateResult(type);
        }
        this.setState(() => ({
          [`${type}HelpShow`]: false,
          [`${type}HelpActive`]: false
        }));
        break;
      case 40:
        this.setState(() => ({
          [`${type}HelpActive`]: true
        }));
        break;
      case 38:
        this.setState(() => ({
          [`${type}HelpActive`]: false
        }));
        break;
      default:
        //do nothing
      }
    }
  };

  dropPrice = (event) => {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {course} = this.state;
    const {type} = event.target.dataset;
    const value = priceCleanup(this.state[`${type}HelpValue`]);

    ModularSearcherActions.set(
      `${this.props.searcherProperty}_${type}`,
      (isApplyCourse ? (value / course) : value).toString()
    );

    this.updateResult(type);
  }

  getPlaceholder = (value) => {
    const isApplyCourse = parseInt(this.props.isApplyCourse);
    const {symbol} = this.props.currency;
    const placeholder = this.props[`placeholder${value}`];

    return isApplyCourse && placeholder ?
      placeholder.replace('currencyUnit', symbol) : placeholder;
  };

  render() {
    return (
      <div className="clearfix msearcher">
        <div className="inputBlock" style={{width: '45%'}}>
          <input
            type="text"
            ref={`${this.props.searcherProperty}_min`}
            className="form-etagi col-md-5 form-bordered"
            value={this.state.inputMin}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            data-type="min"
            data-field={this.props.searcherProperty}
            placeholder={this.getPlaceholder('Min')}
          />
          <div
            ref={`${this.props.searcherProperty}_minP`}
            style={{display: this.state.minHelpShow ? 'block' : 'none'}}
            className={classNames({
              'range-help-block': true,
              'active': this.state.minHelpActive
            })}
            data-type="min"
            onClick={this.dropPrice}
          >
            {priceFormatter(this.state.minHelpValue)}
          </div>
        </div>
        <div className="inputBlock" style={{width: '45%'}}>
          <input
            type="text"
            ref={`${this.props.searcherProperty}_max`}
            className="form-etagi col-md-5 form-bordered pull-right"
            value={this.state.inputMax}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            data-type="max"
            data-field={this.props.searcherProperty}
            placeholder={this.getPlaceholder('Max')}
          />
          <div
            ref={`${this.props.searcherProperty}_maxP`}
            style={{display: this.state.maxHelpShow ? 'block' : 'none'}}
            className={classNames({
              'range-help-block': true,
              'active': this.state.maxHelpActive
            })}
            data-type="max"
            onClick={this.dropPrice}
          >
            {priceFormatter(this.state.maxHelpValue)}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current
  };
}

export default connect(mapStateToProps)(MSearcherRange);
