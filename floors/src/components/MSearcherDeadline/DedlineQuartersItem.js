import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import DedlineQuarters from './DedlineQuarters';
import {filter, head, extend, omit, union, map} from 'lodash';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormGroup from 'react-bootstrap/lib/FormGroup';

class DedlineQuartersItem extends Component {
  static propTypes = {
    id: PropTypes.string,
    checkedItem: PropTypes.string,
    parentYear: PropTypes.string,
    dataModel: PropTypes.object,
    quarter: PropTypes.array,
    yearsFormatted: PropTypes.array,
    openCollapcibleIndex: PropTypes.bool,
    updateSearchResult: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      yearsFormatted: props.yearsFormatted,
      openCollapcibleIndex: props.openCollapcibleIndex
    };
  }

  toggleDeadlineYear = (event) => {
    const type = event.target.dataset.type;
    const {dataModel} = this.props;
    let newvalue = [], value = event.target.value;
    let quaters = filter(this.state.yearsFormatted, {year: value});

    quaters = head(quaters);
    value = event.target.checked ?
      extend(dataModel, {[value]: quaters.quarter}) :
      omit(dataModel, value);

    for(const i in value) {
      if(value[i]) {
        newvalue = union(newvalue, map(value[i], val => `${i}-${val}`));
      }
    }

    ModularSearcherActions.set(null, {[type]: newvalue});
    this.props.updateSearchResult(type);
  }

  collapseDeadline = () => {
    this.setState(() => ({
      openCollapcibleIndex: !this.state.openCollapcibleIndex
    }));
  }

  render() {
    const {id, checkedItem, parentYear, dataModel, quarter} = this.props;
    const {openCollapcibleIndex} = this.state;

    return (
      <div>
        <FormGroup onClick={this.collapseDeadline}>
          <Checkbox
            id={id}
            className="checkbox_arrow arrow_extend"
            value={parentYear}
            data-year={parentYear}
            onChange={this.toggleDeadlineYear}
            data-type="deadline_date" >
            <i className={checkedItem ?
              'icon_arrowChecked icon_arrow' : 'icon_arrow'} />
            <span>{parentYear}</span>
          </Checkbox>
          <span className="caret" />
        </FormGroup>
        <DedlineQuarters dataModel={dataModel}
          openCollapcibleIndex={openCollapcibleIndex}
          updateSearchResult={this.props.updateSearchResult}
          parentYear={parentYear}
          quarter={quarter}/>
      </div>
    );
  }
}

export default DedlineQuartersItem;
