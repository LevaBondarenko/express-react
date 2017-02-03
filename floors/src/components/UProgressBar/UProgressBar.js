/**
 * UProgressBar widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import ContextType from '../../utils/contextType';
import {isNumber, map, size} from 'lodash';

import UProgressBarForm from '../UProgressBar/UProgressBarForm';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';

class UProgressBar extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: PropTypes.string,
    weights: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object
    ]),
    model: PropTypes.object
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {model, weights} = props;

    if(model && weights) {
      this.setState({
        data: model,
        weights: weights
      });
    }
  }

  getPercentage = () => {
    const {weights, data} = this.state;
    let percentage = 0;

    map(weights, (weight, field) => {
      percentage = data && (isNumber(data[field]) ||
       size(data[field]) || data[field] === true ||
       data[field] === false) ?
        percentage + weight :
        percentage;
    });
    percentage = percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage);

    return percentage;
  }

  render() {

    return (
      <UProgressBarForm
        percentage={this.getPercentage()}
        {...this.props} />
    );
  }

}

export default connect((state, ownProps) => {
  const {objectName} = ownProps;

  return {
    model: state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {}
  };
})(UProgressBar);
