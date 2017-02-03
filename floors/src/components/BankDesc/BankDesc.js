
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class BankDesc extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    description: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  render() {
    return (
      <div dangerouslySetInnerHTML={{__html: this.props.description}} />
    );
  }
}

BankDesc = connect(
  state => {
    const obj = state.objects.get('mortgage') ?
      state.objects.get('mortgage').toJS() : {};

    return {
      description: obj.bankDescriptions[obj.bank.id] || ''
    };
  }
)(BankDesc);

export default BankDesc;
