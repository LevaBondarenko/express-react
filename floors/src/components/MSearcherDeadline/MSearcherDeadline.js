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
import {chain, includes, has, size,
  map, sortBy, uniqBy, flattenDeep, clone} from 'lodash';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
/**
 * Bootstrap 3 elements
 */
import {getSearchResult} from '../../actions/SearchActions';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import withCondition from '../../decorators/withCondition';

import Url from '../../utils/Url';
import DedlineQuartersItem from './DedlineQuartersItem';

@withCondition()
class MSearcherDeadline extends Component {

  static propTypes = {
    defaultLabel: React.PropTypes.string,
    customLabel: React.PropTypes.string,
    showName: React.PropTypes.string,
    updateResult: React.PropTypes.string
  };
  static defaultProps = {
    defaultLabel: 'Срок сдачи',
    customLabel: 'Выбрано'
  };

  constructor(props) {
    super(props);

    this.state = {
      dataModel: {
        ondeadline: false,
        deadlineDate: []
      },
      yearsFormatted: ''
    };
  }

  componentWillMount() {
    const years = mss.get('collections')['deadlines'] || [];
    const yearsFormatted = this.getFormattedYears(years);

    mss.onChange(this.onChange);
    this.setState(() => ({yearsFormatted: yearsFormatted}));
  }

  componentDidMount() {
    this.onChange();
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  getFormattedYears = (years) => {
    return chain(years)
      .groupBy('year')
      .map((value, key) => {
        return {
          year: key,
          quarter: map(value, 'quarter')
        };
      })
      .value();
  };

  onChange = () => {
    const model = mss.get();
    const years = sortBy(uniqBy(flattenDeep(model.collections.deadlines),
      (elem) => [elem.year, elem.quarter].join()),
      ['year', 'quarter']);
    const yearsFormatted = this.getFormattedYears(years);

    this.setState(() => ({
      dataModel: {
        ondeadline: includes(model.ondeadline, 'true'),
        deadlineDate: clone(model.deadline_date) || []
      },
      yearsFormatted: yearsFormatted
    }));
  }

  toggleCheckbox(event) {
    const {type} = event.target.dataset;
    const checked = event.target.checked;

    type === 'ondeadline' &&
      ModularSearcherActions.set(null, {[type]: checked ? ['true'] : []});

    this.updateSearchResult.call(this, type);
  }

  updateSearchResult(type) {
    if (this.props.updateResult) {
      const perPage = mss.get('perPage');

      Url.updateSearchParam(type, mss.get()[type]);

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
    }
  }

  render() {
    const {yearsFormatted, dataModel} = this.state;
    const deadlineDate = dataModel.deadlineDate;
    const ondeadline = dataModel.ondeadline;
    const deadlineDateArr = {};

    for(const i in deadlineDate) {
      if(deadlineDate[i]) {
        const dateItem = deadlineDate[i].split('-');

        if(deadlineDateArr[dateItem[0]]) {
          deadlineDateArr[dateItem[0]].push(dateItem[1]);
        } else {
          deadlineDateArr[dateItem[0]] = [dateItem[1]];
        }
      }
    }

    const items = yearsFormatted.map((year, key) => {
      const itemID = `deadline_year_${year.year}`;
      let checked;

      if (has(deadlineDateArr, year.year)) {
        checked = 'checked';
      }
      const openCollapcibleIndex = (year.year ===
        (new Date).getFullYear().toString() || checked === 'checked');

      return (
          <div className="dropdown--deadline" key={key}>
              <DedlineQuartersItem id={itemID}
                checkedItem={checked}
                openCollapcibleIndex={openCollapcibleIndex}
                dataModel={deadlineDateArr} parentYear={year.year}
                quarter={year.quarter}
                updateSearchResult={this.updateSearchResult.bind(this)}
                yearsFormatted={yearsFormatted}/>
          </div>

      );
    });
    let checkedDeadline;
    let countDeadline = size(dataModel.deadlineDate);

    if (ondeadline === true) {
      checkedDeadline = 'checked';
      countDeadline++;
    }
    let btnTitle = (countDeadline > 0 ?
      `${this.props.customLabel}: ${countDeadline}` : this.props.defaultLabel);
    const showName = this.props.showName || 0;

    if (countDeadline === 1 && parseInt(showName)) {
      if (dataModel.deadlineDate.length) {
        const data = (dataModel.deadlineDate).toString().split('-');

        btnTitle = `${data[1]} кв. ${data[0]} г.`;
      } else {
        btnTitle = 'Дом сдан';
      }
    }

    return (
      <div className="clearfix msearcher" title={this.props.defaultLabel}>
        <div id='msearcher_deadline' style={{position: 'relative'}}>
          <DropdownButton id='DropdownButton-deadline-btn'
            className="btn-group--etagi" title={btnTitle}>
              <div className="dropdown--deadline form-group">
                  <input type="checkbox" id="build-year-end"
                    checked={checkedDeadline}
                    className="form-etagi input_arrow"
                    onChange={this.toggleCheckbox.bind(this)}
                    data-type="ondeadline"
                    value="true"/>
                  <label htmlFor="build-year-end"
                    className="checkbox_arrow arrow_extend">
                          <i className="icon_arrow"></i><span>Дом сдан</span>
                  </label>
              </div>
            {items}
          </DropdownButton>
        </div>
      </div>
    );
  }
}

export default MSearcherDeadline;
