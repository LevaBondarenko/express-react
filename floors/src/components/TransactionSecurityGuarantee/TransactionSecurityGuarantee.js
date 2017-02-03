import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TransactionTextBlock from './TransactionTextBlock';

class TransactionSecurityGuarantee extends Component {
  static propTypes = {
    title: PropTypes.string,
    fields: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      id: []
    };
  }

  blockItems = () => {
    const {fields} = this.props;
    const items = fields.map(item => {
      return (
        <TransactionTextBlock
          key={item.count}
          item={item}
          fields={fields}/>
      );
    });

    return items;
  }

  render() {
    const {title} = this.props;

    return (
      <div>
        <h3 className='transactionSecurityGuarantee_title'>{title}</h3>
        <div className={'transactionSecurityGuarantee'}>
          {this.blockItems()}
        </div>
      </div>
    );
  }
}

export default connect()(TransactionSecurityGuarantee);
