/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, throttle} from 'lodash';
import UserAgentData from 'fbjs/lib/UserAgentData';
import ReactDOM from 'react-dom';

const isMounted = (component) => {
  // exceptions for flow control
  try {
    ReactDOM.findDOMNode(component);
    return true;
  } catch (e) {
    // Error
    return false;
  }
};

class Fullpage extends Component {
  static propTypes = {
    children: PropTypes.any,
    handleStepChangeDown: PropTypes.func,
    handleStepChangeUp: PropTypes.func,
    step: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      steps: size(this.props.children),
      ticking: false,
      scrollSensitivitySetting: 30,
      slideDurationSetting: 600
    };
  }

  get mousewheelEvent() {
    return UserAgentData.browserName === 'Firefox' ? 'DOMMouseScroll' : 'wheel';
  }

  componentDidMount() {
    window.addEventListener(
      this.mousewheelEvent, throttle(this.handlePageScroll, 100), false
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      this.mousewheelEvent, throttle(this.handlePageScroll, 100), false
    );
  }

  handlePageScroll = (event) => {
    if(!isMounted(this)) {
      return;
    }

    let delta;

    if (UserAgentData.browserName === 'Firefox') {
      //Set delta for Firefox
      delta = event.detail * (-120);
    } else if (UserAgentData.browserName === 'IE') {
      //Set delta for IE
      delta = -event.deltaY;
    } else {
      //Set delta for all other browsers
      delta = event.wheelDelta;
    }

    const nextNode = document.getElementById(`step_${this.props.step + 1}`);


    if (!this.state.ticking) {
      if (delta <= -this.state.scrollSensitivitySetting) {
        //Down scroll
        if (nextNode &&
            nextNode.offsetHeight > 1 &&
            this.props.step <= this.state.steps) {
          this.handleStepUp();
          this.nextItem();
        }
        this.slideDurationTimeout(this.state.slideDurationSetting);
      }
      if (delta >= this.state.scrollSensitivitySetting) {
        //Up scroll
        if (this.props.step > 1) {
          this.handleStepDown();
          this.previousItem();
        }
        this.slideDurationTimeout(this.state.slideDurationSetting);
      }
    }

  };

  handleStepUp = () => {
    if(this.props.step <= this.state.steps) {
      this.props.handleStepChangeUp();
      this.setState({
        ticking: true
      });
    }
  };

  handleStepDown = () => {
    if(this.props.step > 1) {
      this.props.handleStepChangeDown();
      this.setState({
        ticking: true
      });
    }
  };

  nextItem = () => {
    const nextStep = this.props.children[this.props.step - 1];

    const elementNode = document.getElementById(nextStep.ref);

    $('html, body').animate({
      scrollTop: elementNode.offsetTop + 108
    }, 1000);
  };

  previousItem = () => {
    const nextStep = this.props.children[this.props.step - 1];

    const elementNode = document.getElementById(nextStep.ref);

    $('html, body').animate({
      scrollTop: elementNode.offsetTop + 108
    }, 1000);
  };

  slideDurationTimeout = (slideDuration) => {
    setTimeout(() => {
      this.setState({
        ticking: false
      });
    }, slideDuration);
  };

  render() {

    return (
      <div className='fullpage clearfix'>
        {this.props.children.map((child, step) => {
          return (
            <div id={`step_${step + 1}`} className='clearfix' key={step}>
              {child}
            </div>
          );
        })}
      </div>
    );
  }
}

export default Fullpage;
