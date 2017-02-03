
import React, {Component} from 'react';
import {scrollTo} from '../../utils/Helpers';
import UserAgentData from 'fbjs/lib/UserAgentData';

class ScrollTop extends Component {

  scrollUp() {
    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;

    scrollTo(elementTop, 0, 500);
  }

  scroll() {
    const toTop = document.getElementById('toTop');
    const position = window.pageYOffset;

    toTop.style.opacity = position > 100 ? 1 : 0;
  }

  componentWillMount() {
    document.addEventListener('scroll', this.scroll);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.scroll);
  }

  render() {

    return (
      <div id='toTop' onClick={this.scrollUp.bind(this)}>
          <i></i>
      </div>
    );
  }
}

export default ScrollTop;
