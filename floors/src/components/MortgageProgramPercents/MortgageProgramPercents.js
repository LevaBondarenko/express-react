/**
 * MortgageProgramPercents widget class
 *
 * @ver 0.0.0
 * @author a.d.permin@72.etagi.com
 */

 /**
  * devDependencies
  */
import React, {Component, PropTypes} from 'react';
import {
  orderBy, groupBy, size, keys, forEach, intersection, isArray
} from 'lodash';
/*
* components
*/
import MortgageProgramPercentsView from './MortgageProgramPercentsView';
import MortgageProgramPercentsViewM from './MortgageProgramPercentsViewM';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class MortgageProgramPercents extends Component {

  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    mortgage: PropTypes.object,
    noticeError: PropTypes.string,
    tableTitle: PropTypes.string,
    isMobile: PropTypes.bool,
    isCollapsed: PropTypes.bool
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  componentDidMount() {
    this.processProps(this.props);
  }

  constructor(props) {
    super(props);
    /*global data*/

    const processedData = this.processData(data.redux && data.redux.mortgage &&
      data.redux.mortgage.program && data.redux.mortgage.program.percents &&
      data.redux.mortgage.program.percents.filter(p => {
        return p.income.slice(1, -1).split(',').includes('1');
      }));

    this.state = {
      yearsGroups: processedData.yearsGroups,
      percentsGroups: processedData.percentsGroups
    };
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {mortgage} = props;
    const income = size(mortgage.income) > 0 ? mortgage.income : '1';
    const programData = mortgage && mortgage.program &&
      mortgage.program.percents &&
      mortgage.program.percents.filter(p => {
        return isArray(income) ?
          size(intersection(p.income.slice(1, -1).split(','), income)) > 0 :
          p.income.slice(1, -1).split(',').includes(income);
      });
    const processedData = this.processData(programData);

    this.setState({
      yearsGroups: processedData.yearsGroups,
      percentsGroups: processedData.percentsGroups
    });
  }

  processData = (data) => {
    const programData = orderBy(data,
      ['avanse_min', 'avanse_max', 'years_min', 'years_max']);
    const yearsGroups = keys(groupBy(
      orderBy(programData, ['years_min', 'years_max']), data => {
        return `от ${data.years_min} до ${data.years_max} лет`;
      })
    );
    const percentsGroups = groupBy(programData, data => {
      return `${data.avanse_min}-${data.avanse_max}`;
    });

    forEach(percentsGroups, (group) => {
      let groupSize = size(group) - 1;

      for (let i = 0; i < groupSize; i++) {
        const currentPercent = group[i];
        const nextPercent = group[i + 1];

        if (currentPercent.percent === nextPercent.percent &&
        currentPercent.years_min === nextPercent.years_min &&
        currentPercent.years_max === nextPercent.years_max) {
          group.splice(i + 1, 1);
          groupSize--;
        }
      }
    });

    forEach(percentsGroups, (group) => {
      forEach(yearsGroups, (year, key) => {
        const currentGroup = group[key];
        const groupYear = currentGroup &&
          `от ${currentGroup.years_min} до ${currentGroup.years_max} лет`;

        groupYear !== year && group.splice(key, 0, null);
      });
    });

    return {yearsGroups: yearsGroups, percentsGroups: percentsGroups};
  }

  render() {
    return (this.props.isMobile ?
      <MortgageProgramPercentsViewM
        context={this.props.context}
        tableTitle={this.props.tableTitle}
        yearsGroups={this.state.yearsGroups}
        percentsGroups={this.state.percentsGroups}
        noticeError={this.props.noticeError}
        colSpan={size(this.state.yearsGroups)} /> :
      <MortgageProgramPercentsView
        tableTitle={this.props.tableTitle}
        yearsGroups={this.state.yearsGroups}
        percentsGroups={this.state.percentsGroups}
        colSpan={size(this.state.yearsGroups)} />
    );
  }
}

export default connect(
  state => {
    return {
      mortgage: state.objects.get('mortgage').toJS() || null
    };
  }
)(MortgageProgramPercents);
