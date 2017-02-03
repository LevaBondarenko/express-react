/**
 * LK Messages List component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size} from 'lodash';
import LKMessagesListItem from '../../LKBody/LKMessages/LKMessagesListItem';
import createFragment from 'react-addons-create-fragment';

class LKMessagesList extends Component {
  static propTypes = {
    filteredMessages: React.PropTypes.array,
    user: React.PropTypes.object,
    subPage: React.PropTypes.string,
    mode: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componenentWillReceiveProps() {
    this.forceUpdate();
  }

  render() {
    const {filteredMessages} = this.props;

    let messagesItems = map(filteredMessages, (message, key) => {
      const item =
        (<LKMessagesListItem
            key={key}
            message={message}
            uid={this.props.user.id} />);

      return item;
    });

    messagesItems = size(messagesItems) > 0 ?
      createFragment({messagesItems: messagesItems}) :
      createFragment({
        messagesItems:
          <div className='notFound'>
            <p>Уведомления не найдены</p>
          </div>
      });

    return <div>{messagesItems}</div>;
  }
}

export default LKMessagesList;
