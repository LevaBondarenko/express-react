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
// import classNames from 'classnames';
import {getSearchResult} from '../../actions/SearchActions';
import {each} from 'lodash';
import Url from '../../utils/Url';

@withCondition()
class FilterGroupSwitcher extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    title: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  onClickClear = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const fields = [];

    // собираем поля с виджетов фильтра
    /* global data */

    // Widget CheckBoxes
    const widgets = data.widget;
    const CheckBoxWidgets = widgets['FilterCheckbox_Widget'];

    each(CheckBoxWidgets, widget => {
      fields.push(widget.searcherProperty); // записываем в fields для сброса основное св-во виджета

      // записываем в fields доп. поля если они есть
      const values = JSON.parse(widget.values);

      each(values, val => {
        if (val.type && fields.indexOf(val.type) === -1) {
          fields.push(val.type);
        }
      });
    });

    // Widget Slider
    const RangeWidgets = widgets['FilterRange_Widget'];

    each(RangeWidgets, widget => {
      fields.push(`${widget.searcherProperty}_min`); // записываем в fields для сброса основное св-во виджета
      fields.push(`${widget.searcherProperty}_max`);
    });

    // Widget MSearcherCheckBox
    const MSCheckBoxes = widgets['MSearcherCheckBox_Widget'];

    each(MSCheckBoxes, widget => {
      const properties = widget.searcherProperty.split(',');

      each(properties, prop => {
        if (prop && fields.indexOf(prop) === -1) {
          fields.push(prop);
        }
      });
      fields.push(widget.searcherProperty); // записываем в fields для сброса основное св-во виджета
    });

    each(RangeWidgets, widget => {
      fields.push(widget.searcherProperty); // записываем в fields для сброса основное св-во виджета
    });

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

  render() {
    return (
      <div className="filter-title-wrapper">
        <h3 className="filter-title">{this.props.title}</h3>
        <a href="#" onClick={this.onClickClear}>Очистить</a>
      </div>
    );
  }
}

export default FilterGroupSwitcher;
