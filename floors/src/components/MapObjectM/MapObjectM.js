/**
 * MapObjectM container component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ContextType from '../../utils/contextType';

import MapObjectMView from './MapObjectMView';

/**
 * React/Redux entities
 */
import {connect} from 'react-redux';


class MapObjectM extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired
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
      <MapObjectMView
       {...this.props} />
    );
  }
}

export default connect(
  state => {
    const object = state.objects.get('object') ?
      state.objects.get('object').toJS().info :
      {};

    return {
      objectInfo: object.info ? object.info : object
    };
  }
)(MapObjectM);
