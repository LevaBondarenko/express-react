import React, {Component} from 'react';

import {InputMask} from './input-mask';

export default class extends Component {
  componentDidMount() {
    const props = this.props;

    new InputMask().Initialize( //eslint-disable-line
      document
      .querySelectorAll('.react-date-field__input input'),
      {mask: props.mask}
    );
  }

  render() {
    return (
      <div  className="react-date-field__input">
        <input {...this.props} onChange={() => {}} />
      </div>
    );
  }
}
