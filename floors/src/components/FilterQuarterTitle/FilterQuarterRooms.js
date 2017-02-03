/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars
/**
 * React/Flux entities
 */
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import CheckButton from '../../shared/CheckButton';

class FilterQuarterRooms extends Component {
  static propTypes = {
    dataModel: PropTypes.array
  };

  constructor(props) {
    super(props);

  }

  toggleCheckbox(event) {
    const value = event.target.value;

    FilterQuarterActions.change('rooms', value);
  }

  render() {
    const dataModel = this.props.dataModel;

    return (
      <div className="form-group">
        <div className="clearfix searchform--rooms">
          <FilterQuarterRoomItem itemID='checkbox_one' itemValue={1}
            itemType='rooms'
            itemLabel={1}
            onChange={this.toggleCheckbox}
            dataModel={dataModel}/>
          <FilterQuarterRoomItem itemID='checkbox_two' itemValue={2}
            itemType='rooms'
            itemLabel={2}
            onChange={this.toggleCheckbox}
            dataModel={dataModel}/>
          <FilterQuarterRoomItem itemID='checkbox_three' itemValue={3}
            itemType='rooms'
            itemLabel={3}
            onChange={this.toggleCheckbox}
            dataModel={dataModel}/>
          <FilterQuarterRoomItem itemID='checkbox_four' itemValue={4}
            itemType='rooms'
            itemLabel="4+"
            onChange={this.toggleCheckbox}
            dataModel={dataModel}/>
        </div>
      </div>
    );
  }
}

class FilterQuarterRoomItem extends Component {
  render() {
    const props = this.props;

    return (
      <div className="searchform--rooms__item clearfix pull-left">
        <div className="flatfilter">
          <CheckButton
            key={props.itemID}
            itemID={props.itemID}
            itemLabel={props.itemLabel}
            onValue={props.itemValue}
            offValue=''
            onChange={props.onChange}
            dataModel={props.dataModel}
            mode='1'
            pullLeft='1'
          />
        </div>
      </div>
    );
  }
}

export default FilterQuarterRooms;
