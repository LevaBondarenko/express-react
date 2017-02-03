/**
 * Modular Searcher CheckBox component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import CheckButton from '../../shared/CheckButton';
import {intersection, difference, union, pickBy, sortBy, uniqBy, flattenDeep}
  from 'lodash';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import withCondition from '../../decorators/withCondition';
import Url from '../../utils/Url';
import {getSearchResult} from '../../actions/SearchActions';

@withCondition()
class MSearcherSettleInYear extends Component {
  constructor(props) {
    super(props);
    const deadlines = mss.get('collections')['deadlines'] || [];
    const quarters = pickBy(deadlines, {'year': props.year});
    const currentQuarters = [];

    for (const i in quarters) {
      if (quarters[i]) {
        currentQuarters.push(`${props.year}-${quarters[i].quarter}`);
      }
    }

    this.onChange = this.onChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      currentQuarters: currentQuarters,
      checked: false
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange() {
    const model = mss.get();
    const deadlines = sortBy(uniqBy(flattenDeep(model.collections['deadlines']),
      (elem) => { return [elem.year, elem.quarter].join(); }),
      ['year', 'quarter']);
    const quarters = pickBy(deadlines, {'year': this.props.year});
    const currentQuarters = [];

    for (const i in quarters) {
      if (quarters[i]) {
        currentQuarters.push(`${this.props.year}-${quarters[i].quarter}`);
      }
    }
    this.state = {
      currentQuarters: currentQuarters
    };
    const checked = !difference(
        this.state.currentQuarters,
        intersection(this.state.currentQuarters, model.deadline_date)
      ).length && this.state.currentQuarters.length;

    this.setState(() => ({
      checked: checked
    }));
  }

  toggle() {
    const {checked} = this.state;
    const deadlineDate = mss.get('deadline_date');

    if (this.state.currentQuarters.length) {
      const res = checked ? // eslint-disable-line camelcase
        difference(deadlineDate, this.state.currentQuarters) :
        union(deadlineDate, this.state.currentQuarters);

      ModularSearcherActions.set(
        null,
        {
          deadline_date: res, //eslint-disable-line
          offset: this.props.updateResult ? 0 : mss.get()['offset'],
          currentPage: this.props.updateResult ? 0 : mss.get()['currentPage']
        }
      );

      if (this.props.updateResult) {
        Url.updateSearchParam('currentPage', undefined);
        Url.updateSearchParam('deadline_date', res);

        const perPage = mss.get('perPage');

        getSearchResult(
          mss.get('class'),
          perPage,
          0,
          mss.get(),
          {}
        );
      }
    }
  }

  render() {
    const {checked, currentQuarters} = this.state;
    const disabled = !currentQuarters.length;

    return (
      <div className="msearcher">
        <div className='msearcher--checkbox clearfix'>
          <CheckButton
            disabled={disabled}
            itemID={this.props.id}
            itemLabel={this.props.defaultLabel + this.props.year}
            onValue={true}
            offValue=''
            onChange={this.toggle}
            dataModel={{}}
            mode='0'
            checked={checked}
            model='settleInYear'
          />
        </div>
      </div>
    );
  }
}

MSearcherSettleInYear.propTypes = {
  defaultLabel: React.PropTypes.string,
  year: React.PropTypes.string,
  updateResult: React.PropTypes.string,
  id: React.PropTypes.string
};
MSearcherSettleInYear.defaultProps = {
  defaultLabel: 'Заселиться в '
};

export default MSearcherSettleInYear;
