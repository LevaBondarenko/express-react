/**
 * o.e.kurgaev@it.etagi.com
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

function waitFor(prop) {
  return ChildComponent => class extends Component {
    render() {
      return this.props[prop] ? <ChildComponent {...this.props} /> : null;
    }
  };
}

export default waitFor;
