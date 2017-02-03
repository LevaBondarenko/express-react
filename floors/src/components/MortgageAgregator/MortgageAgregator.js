import React, {Component, PropTypes} from 'react';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import objectsRemap from '../../selectors/objectsRemap';

import {declOfNum} from '../../utils/Helpers';
import {size} from 'lodash';

import MortgageAgregatorForm from '../MortgageAgregator/MortgageAgregatorForm';

class MortgageAgregator extends Component {

  static propTypes = {
    alignMode: PropTypes.string,
    beginningWith: PropTypes.string,
    className: React.PropTypes.string,
    context: PropTypes.shape(ContextType).isRequired,
    endingWith: PropTypes.string,
    fieldName: PropTypes.string,
    objectName: PropTypes.string,
    padding: PropTypes.string,
    zeroCountMessage: PropTypes.string,
    value: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object,
      React.PropTypes.string,
      React.PropTypes.number
    ])
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      count: this.processProps(props),
      padding: props.padding ? props.padding : '15'
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      count: this.processProps(nextProps)
    });
  }

  processProps = props => {
    const {value} = props;

    if (value) {
      const dataType = typeof(value);
      const actualCount = dataType === 'array' || dataType === 'object' ?
        size(value) : (dataType === 'string' || dataType === 'number' ?
          value : 0);

      return actualCount;
    } else {
      return 0;
    }
  }

  getActualText = (text) => {
    const {count} = this.state;
    const initialText = text && text.match(/(.+)\|(.+)\|(.+)/) ?
      text.match(/(.+)\|(.+)\|(.+)/) :
      text;
    const actualText = typeof(initialText) === 'object' ?
      declOfNum(count, [initialText[1], initialText[2], initialText[3]]) :
      initialText;

    return actualText;
  }

  render() {
    const {count, padding} = this.state;
    const {beginningWith, endingWith} = this.props;

    return (
      <MortgageAgregatorForm
        alignmentPadding={padding}
        beginning={this.getActualText(beginningWith)}
        ending={this.getActualText(endingWith)}
        mortgageCount={count.toString()}
        {...this.props} />
    );
  }

}

export default connect((state, ownProps) => {
  const {fieldName, objectName} = ownProps;

  return {
    value: objectsRemap[objectName] ?
      objectsRemap[objectName](state)[fieldName] :
      state.objects.get(objectName).toJS()[fieldName]
  };
})(MortgageAgregator);
