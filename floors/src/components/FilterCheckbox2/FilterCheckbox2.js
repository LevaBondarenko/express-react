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
import withCondition from '../../decorators/withCondition';
import {without, map, includes, filter, union, each, clone} from 'lodash';
import FilterBlock from '../../shared/FilterBlock';
import ContextType from '../../utils/contextType';
import classNames from 'classnames';
import s from './FilterCheckbox2.scss';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class FilterCheckbox2 extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    searcherProperty: React.PropTypes.string,
    values: React.PropTypes.array,
    title: React.PropTypes.string,
    type: React.PropTypes.string,
    hintText: React.PropTypes.string,
    isLoading: React.PropTypes.string,
    searcher: React.PropTypes.object,
    actions: React.PropTypes.object
  };

  static defaultProps = {
    type: '0', // checkbox
  }
  constructor(props) {
    super(props);
    this.lastOptType = '';
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  clearFilter = () => {
    const itemsWithType = filter(this.props.values, item => {
      return item.type;
    });

    this.props.actions.updateInObjectsState(
      ['searcher', this.props.searcherProperty], () => null);

    each(itemsWithType, item => {
      this.props.actions.updateInObjectsState(
        ['searcher', item.type], () => null);
    });
  }

  handleChange = (event) => {
    const type = event.target.dataset.type;
    const radio = event.target.dataset.radio;
    const {searcherProperty, searcher} = this.props;
    let value, result;

    if (radio !== '1') {
      value = searcher[type] || [];

      if (typeof value === 'string') {
        value = [value];
      }

      if (event.target.checked) {
        value = union(clone(value), [event.target.value]);
      } else {
        value = without(clone(value), event.target.value);
      }

      result = value.length === 1 ?
        value[0] : value ? value : undefined;
    } else {
      result = event.target.checked ? event.target.value : '';

      if (type !== searcherProperty) {
        this.lastOptType = type;
      }
    }

    this.props.actions.updateInObjectsState(
      ['searcher', type], () => (result));
  }

  getInputs = () => {
    const {searcherProperty, searcher, values} = this.props;

    return map(values, item => {
      const sProp = item.type ? item.type : searcherProperty;
      const itemsInStore = searcher[sProp];
      const titleClasses = classNames({
        'icon_arrow': true,
        'fa fa-circle': this.props.type === '1' // radio
      });

      return (
        <div key={`${sProp}_${item.value}`}>
          <input type='checkbox'
                 id={`${sProp}--${item.value}`}
                 checked={typeof itemsInStore !== 'string' ?
                   includes(itemsInStore, item.value) :
                   itemsInStore === item.value
                 }
                 onChange={this.handleChange}
                 data-type={sProp}
                 data-radio={this.props.type}
                 value={item.value}/>
          <label htmlFor={`${sProp}--${item.value}`}>
            <i className={titleClasses} />
            <span dangerouslySetInnerHTML={{__html: item.name}} />
          </label>
        </div>
      );
    });
  }

  hasCheckedItems = () => {
    const {searcherProperty, searcher, values} = this.props;
    let hasChecked = false;

    each(values, item => {
      if (hasChecked) {
        return false;
      }
      const sProp = item.type ? item.type : searcherProperty;
      const itemsInStore = searcher[sProp];

      hasChecked = typeof itemsInStore !== 'string' ?
          includes(itemsInStore, item.value) :
        itemsInStore === item.value;
    });

    return hasChecked;
  }

  render() {
    const {title} = this.props;

    return (
      <div className={s.root}>
        <FilterBlock title={title}
          visible={false}
          visibleClear={false} //{this.hasCheckedItems()} на текущем макете нет места для кнопки Очистить
          clearFilter={this.clearFilter}>
          <div className={s.list}>
            {this.getInputs()}
          </div>
        </FilterBlock>
      </div>
    );
  }
}

FilterCheckbox2 = connect(
  (state, ownProps) => {
    const searcher = state.objects.get('searcher').toJS();

    return {
      model: searcher[ownProps.searcherProperty],
      searcher: searcher
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(FilterCheckbox2);
FilterCheckbox2 = withCondition()(FilterCheckbox2);

export default FilterCheckbox2;
