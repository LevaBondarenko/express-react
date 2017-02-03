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
import createFragment from 'react-addons-create-fragment';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';
import WidgetsActions from '../../actions/WidgetsActions';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import withCondition from '../../decorators/withCondition';
import emptyFunction from 'fbjs/lib/emptyFunction';
import classNames from 'classnames';
import {getSearchResult} from '../../actions/SearchActions';
import {each, union} from 'lodash';
import Url from '../../utils/Url';

@withCondition()
class FilterGroupSwitcher extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    visibilityProperty: React.PropTypes.string,
    title: React.PropTypes.string,
    fields: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    let fields = props.fields ?
      props.fields.split(',') : [];
    const allFields = [];

    each(fields, field => {
      allFields.push(`${field}_min`);
      allFields.push(`${field}_max`);
    });

    fields = union(fields, allFields);

    this.state = {
      visible: true,
      fields: fields
    };
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
    WidgetsActions.set(this.props.visibilityProperty, true);
    wss.onChange(this.onChange);
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
    mss.offChange(this.onChange);
  }

  onChange = () => {
    const value = wss.get(this.props.visibilityProperty) || '';

    this.setState({
      visible: value || false,
      hasClear: this.hasCheckedItems()
    });
  }

  toggleFilterBlock(event) {
    event.preventDefault();

    const {visibilityProperty} = this.props;
    const currentVisibility = wss.get(visibilityProperty);

    WidgetsActions.set(visibilityProperty, !currentVisibility);
  }

  onClickClear = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const {fields} = this.state;
    const {perPage} = mss.get();

    fields.push('currentPage');
    fields.push('offset');

    ModularSearcherActions.omit(fields);

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

    each(fields, type => {
      if (type) {
        Url.updateSearchParam(type, undefined);
      }
    });
  }

  hasCheckedItems = () => {
    let hasChecked = false;

    each(this.state.fields, field => {
      if (hasChecked) {
        return false;
      }
      hasChecked = !!mss.get()[field];
    });

    return hasChecked;
  }

  render() {
    const state = this.state;
    const {title} = this.props;

    const titleClassSet = classNames({
      'filter--block__title': true,
      'clearfix': true
    });

    const toggleArrow = state.visible ?
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-top pull-left"
                aria-hidden="true" />
        )
      }) :
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-bottom pull-left"
                aria-hidden="true" />
        )
      });

    return (
      <div className="filterwidget-wrapper filter--block"
           style={{marginBottom: state.visible ? 15 : 0}}
      >
        <div className={titleClassSet}
             onClick={this.toggleFilterBlock.bind(this)}>
          <h3 className='clearfix'>
            {toggleArrow}
            <span className='pull-left filter-block-title'>{title}</span>
            {
              this.state.hasClear ? (
                <a className="clear-filter-block"
                   href="#"
                   onClick={this.onClickClear}
                   title="Очистить данный блок">
                  Очистить
                </a>
              ) : null
            }
          </h3>
        </div>
      </div>
    );
  }
}

export default FilterGroupSwitcher;
