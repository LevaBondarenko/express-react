/**
 * RealtorsListM container component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ContextType from '../../utils/contextType';

import RealtorsListMView from './RealtorsListMView';

/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {getProcessedRealtorsData} from '../../selectors/';


class RealtorsListM extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {

    return (
      <RealtorsListMView
       {...this.props} />
    );
  }
}

export default connect(
  state => {
    return {
      realtorsList: getProcessedRealtorsData(state)
    };
  }
)(RealtorsListM);
