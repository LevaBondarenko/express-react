import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import {size, has, includes} from 'lodash';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormGroup from 'react-bootstrap/lib/FormGroup';

const DedlineQuarters = (props) => {
  const {openCollapcibleIndex} = props;

  const toggleCheckbox = (event) => {
    const {type, year} = event.target.dataset;
    let value = event.target.value;

    value = `${year}-${value}`;
    ModularSearcherActions.toggle(type, value);
    props.updateSearchResult(type);
  };

  const quartersListRender = () => {
    const {quarter, parentYear, dataModel} = props;

    return quarter && quarter.map((itemQuarter, key) => {
      const itemID = `quarter_year_${parentYear}_${itemQuarter}`;
      let checked;

      if (size(dataModel) !== 0) {

        if (has(dataModel, parentYear) &&
         includes(dataModel[parentYear], itemQuarter.toString())) {
          checked = 'checked';
        }

      }
      return (
        <Checkbox key={key}
          id={itemID}
          className="checkbox_arrow arrow_extend"
          value={itemQuarter}
          data-year={parentYear}
          onChange={toggleCheckbox}
          data-type="deadline_date" >
          <i className={checked ?
            'icon_arrowChecked icon_arrow' : 'icon_arrow'} />
          <span>{itemQuarter} квартал</span>
        </Checkbox>
      );
    });
  };

  return (
    <div className="dropdown--quarters"
      style={(openCollapcibleIndex ? {display: 'block'} : {display: 'none'})}>
        <FormGroup>
          {quartersListRender()}
        </FormGroup>
    </div>
  );
};

DedlineQuarters.propTypes = {
  quarter: PropTypes.array,
  parentYear: PropTypes.string,
  dataModel: PropTypes.object,
  openCollapcibleIndex: PropTypes.bool,
};

export default DedlineQuarters;
