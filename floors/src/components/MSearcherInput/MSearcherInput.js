/**
 * Modular Searcher Input component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import withCondition from '../../decorators/withCondition';
import {forEach} from 'lodash';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
// временно
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';

@withCondition()
class MSearcherInput extends Component {
  static propTypes = {
    searcherProperty: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    textSearch: React.PropTypes.string,
    refreshOn: React.PropTypes.string,
    format: React.PropTypes.string,
    updateResult: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      input: ''
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
    const modelUrl = canUseDOM ?
      require('../../utils/Helpers').parseUrlObject() : {};

    forEach(modelUrl, (value, key) => {
      if(key === this.props.searcherProperty) {
        this.setState(() => ({
          input: value
        }));
      }
    });
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    let value = mss.get(this.props.searcherProperty) || '';

    if(parseInt(this.props.textSearch)) {
      value = value.slice(1, -1);
    }

    value.length === 0 && this.setState({
      input: value
    });
  }

  handleChange = (e) => {
    let value = e.target.value;
    const format = this.props.format && parseInt(this.props.format) > 0;
    const fullTextSearch = this.props.textSearch &&
      parseInt(this.props.textSearch) > 0;

    if(format) {
      value = value.toString().replace(/[^0-9]/g, '');
    }
    this.setState(() => ({
      input: value
    }));
    if(!parseInt(this.props.refreshOn)) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if(fullTextSearch) {
          value = `%${value.trim()}%`;
        }
        // ModularSearcherActions.set(this.props.searcherProperty, value);
        ModularSearcherActions.set(null, {
          [this.props.searcherProperty]: value,
          offset: 0,
          currentPage: 0
        });

        if (this.props.updateResult) {
          const urlVal = mss.get(this.props.searcherProperty) ?
            mss.get(this.props.searcherProperty) : undefined;

          Url.updateSearchParam(
            this.props.searcherProperty,
            urlVal
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
        }
      }, 500);
    }
  }

  handleBlur(e) {
    if(parseInt(this.props.refreshOn)) {
      let value = e.target.value;
      const fullTextSearch = this.props.textSearch &&
        parseInt(this.props.textSearch) > 0;

      if(fullTextSearch) {
        value = `%${value.trim()}%`;
      }
      ModularSearcherActions.set(null, {
        [this.props.searcherProperty]: value,
        offset: 0,
        currentPage: 0
      });
    }
  }

  render() {
    const props = this.props;
    const inputClass = 'form-etagi form-etagi-input form-bordered';

    return (
      <div className="clearfix msearcher">
        <div className="inputBlock" style={{width: '100%'}}>
          <label
            className='input-label'
            style={{display: !props.label ? 'none' : 'inline-block'}}>
            {props.label}
          </label>
          <input
            type="text"
            ref={this.props.searcherProperty}
            className={inputClass +
            (props.label ? ' half' : ' full')}
            value={this.state.input}
            data-field={this.props.searcherProperty}
            onChange={this.handleChange.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            placeholder={this.props.placeholder}
          />
        </div>
      </div>
    );
  }
}

export default MSearcherInput;
