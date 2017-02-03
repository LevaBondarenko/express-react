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
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import withCondition from '../../decorators/withCondition';
import {size, without, map, includes, filter, union, each} from 'lodash';
// import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import FilterBlock from '../../shared/FilterBlock';
import Hint from '../../shared/Hint';
import emptyFunction from 'fbjs/lib/emptyFunction';
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';
import classNames from 'classnames';

@withCondition()
class FilterCheckbox extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    searcherProperty: React.PropTypes.string,
    values: React.PropTypes.string,
    title: React.PropTypes.string,
    type: React.PropTypes.string,
    hintText: React.PropTypes.string
  };

  static defaultProps = {
    type: '0', // checkbox
    hintText: 'Подобрано count {вариант|варианта|вариантов} квартир'
  }
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      items: JSON.parse(props.values)
    };
    this.lastOptType = '';
  }

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    const value = mss.get(this.props.searcherProperty) || '';

    this.setState({
      input: value,
      count: mss.get('count')
    });
  }

  clearFilter() {
    let fieldsToRemove = [];
    const itemsWithType = filter(this.state.items, item => {
      return item.type;
    });
    const optTypes = map(itemsWithType, item => item.type);
    const {perPage} = mss.get();


    fieldsToRemove.push(this.props.searcherProperty);
    fieldsToRemove = union(fieldsToRemove, optTypes);
    fieldsToRemove.push('currentPage');
    fieldsToRemove.push('offset');

    ModularSearcherActions.omit(fieldsToRemove);

    getSearchResult(
      mss.get('class'),
      mss.get('perPage'),
      0,
      mss.get(),
      {}
    );

    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');

    each(fieldsToRemove, type => {
      if (type) {
        Url.updateSearchParam(type, undefined);
      }
    });
  }

  handleChange = (event) => {
    const type = event.target.dataset.type;
    const radio = event.target.dataset.radio;
    const {searcherProperty} = this.props;
    let value, result;

    const filterItem = $(event.target).parents('.form-group');
    const hintTopPosition = filterItem.position().top;
    const hintLeftPosition = filterItem.width();

    this.timer && clearTimeout(this.timer);
    this.timer2 && clearTimeout(this.timer2);

    if (radio !== '1') {
      value = mss.get()[type] || [];

      if (typeof value === 'string') {
        value = [value];
      }

      if(event.target.checked) {
        value.push(event.target.value);
      } else {
        value = without(value, event.target.value);
      }

      result = value.length === 1 ?
        value[0] : value ? value : undefined;

      Url.updateSearchParam(type, result);
    } else {
      result = event.target.checked ? event.target.value : '';

      if (type !== searcherProperty) {
        this.lastOptType = type;
      }

      Url.updateSearchParam(type !== searcherProperty ?
        searcherProperty : this.lastOptType, undefined);
      Url.updateSearchParam(type, result !== '' ? result : undefined);
    }


    if (!size(Url.parseQuery())) {
      Url.removeQuery();
    }

    const perPage = mss.get('perPage');

    ModularSearcherActions.set(null, {
      [type !== searcherProperty ? searcherProperty : this.lastOptType]: null,
      [type]: result,
      offset: 0,
      currentPage: 0
    });

    Url.updateSearchParam('currentPage', undefined);

    this.timer = setTimeout(() => {
      getSearchResult(
        mss.get('class'),
        perPage,
        0,
        mss.get(),
        {}
      );
    }, 150);

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

    this.setState(() => ({
      displayHint: true,
      loadingHint: true,
      hintTop: hintTopPosition,
      hintLeft: hintLeftPosition
    }));


  }

  getInputs = () => {
    const {items} = this.state;
    const {searcherProperty} = this.props;

    return map(items, item => {
      const sProp = item.type ? item.type : searcherProperty;
      const itemsInStore = mss.get(sProp);
      const titleClasses = classNames({
        'icon_arrow': true,
        'fa fa-circle': this.props.type === '1' // radio
      });

      return (
        <div className='form-group title--margin'
             key={`${sProp}_${item.value}`}>
          <input type='checkbox'
                 id={`${sProp}--${item.value}`}
                 checked={typeof itemsInStore !== 'string' ?
                   includes(itemsInStore, item.value) :
                   itemsInStore === item.value
                 }
                 onChange={this.handleChange}
                 className='form-etagi input_arrow'
                 data-type={sProp}
                 data-radio={this.props.type}
                 value={item.value}/>
          <label htmlFor={`${sProp}--${item.value}`}
                 className='checkbox_arrow arrow_extend'>
            <i className={titleClasses} />
            <span dangerouslySetInnerHTML={{__html: item.name}} />
          </label>
        </div>
      );
    });
  }

  hasCheckedItems = () => {
    const {searcherProperty} = this.props;
    const {items} = this.state;
    let hasChecked = false;

    each(items, item => {
      if (hasChecked) {
        return false;
      }
      const sProp = item.type ? item.type : searcherProperty;
      const itemsInStore = mss.get(sProp);

      hasChecked = typeof itemsInStore !== 'string' ?
          includes(itemsInStore, item.value) :
        itemsInStore === item.value;
    });

    return hasChecked;
  }

  render() {
    const props = this.props;
    const {displayHint, loadingHint, hintTop, hintLeft, count} = this.state;

    return (
      <div className="filterwidget-wrapper">
        <FilterBlock title={props.title}
                     visibleClear={this.hasCheckedItems()}
                     clearFilter={this.clearFilter.bind(this)}>
          <Hint
            template={props.hintText}
            display={displayHint}
            loading={loadingHint}
            top={hintTop}
            left={hintLeft}
            count={count}
            {...props}
          />
          {this.getInputs()}
        </FilterBlock>
      </div>
    );
  }
}

export default FilterCheckbox;
