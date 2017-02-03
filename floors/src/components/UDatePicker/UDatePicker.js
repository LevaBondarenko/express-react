import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateInObjectsState} from
 '../../actionCreators/ObjectsActions';
import Datepicker from './UDatePickerExtends';

class UDatePicker extends Component {
  static defaultProps = {
    format: 'DD-MM-YYYY',
    range: 0
  }
  static propTypes = {
    actions: PropTypes.object,
    defaultValue: PropTypes.string,
    fieldName: PropTypes.string,
    format: PropTypes.string,
    help: PropTypes.string,
    label: PropTypes.string,
    maxValue: PropTypes.string,
    minValue: PropTypes.string,
    objectName: PropTypes.string,
    placeholder: PropTypes.string,
    range: PropTypes.number,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return <Datepicker {...this.props} range={false} />;
  }
}

export default connect(
	(state, ownProps)  => {
  const {fieldName, objectName} = ownProps;
  const searcher = state.objects.get(objectName).toJS()[fieldName];

  return {
    searcher: searcher,
    objects: state.objects.get(objectName).toJS()
  };
},
  (dispatch) => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch),
    };
  }
)(UDatePicker);
