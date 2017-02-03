
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class BankName extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    name: PropTypes.string,
    nameTr: PropTypes.string,
    image: PropTypes.string,
    isRef: PropTypes.bool
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  render() {
    return this.props.isRef ? (
      <a href={`/ipoteka/${this.props.nameTr}/`}>
        <img src={this.props.image} alt={this.props.name} />
      </a>
    ) :
      (<div>
        <img src={this.props.image} alt={this.props.name} />
      </div>);
  }
}

BankName = connect(
  state => {
    const obj = state.objects.get('mortgage') ?
      state.objects.get('mortgage').toJS() : {};

    return {
      name: obj.bank.name || '',
      image: obj.bank.image || '',
      nameTr: obj.bank.name_tr || ''
    };
  }
)(BankName);

export default BankName;
