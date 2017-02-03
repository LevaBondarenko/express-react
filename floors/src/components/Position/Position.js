/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class Position extends Component {
  static propTypes = {
    mountNode: PropTypes.string,
    element: PropTypes.string
  };

  static defaultProps = {
    element: ''
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const canvas = document.querySelector('.ao-mainBlock');

    canvas.onmousemove = e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const helfItem = rect.width / 2;

      helfItem < x ? canvas.classList.add('ao-mainBlockLeft') :
        canvas.classList.remove('ao-mainBlockLeft');
    };

    canvas.onmouseout = () => {};
  }

  render() {
    return <div />;
  }
}

export default Position;
