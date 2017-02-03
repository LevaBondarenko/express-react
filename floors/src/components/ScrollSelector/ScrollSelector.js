/**
 * BuilderPromo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import withCondition from '../../decorators/withCondition';

import className from 'classnames';
import UserAgentData from 'fbjs/lib/UserAgentData';
import Helpers from '../../utils/Helpers';
import CustomPopover from './CustomPopover';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';

@withCondition()
class ScrollSelector extends Component {
  static propTypes = {
    fields: React.PropTypes.array,
    btnText: React.PropTypes.string
  }
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      currentTarget: this.props.fields[0]
    };
  }

  togglePopup = () => {
    this.setState(() => ({
      open: !this.state.open
    }));
  }

  setTarget = target => {
    if (target) {
      this.setState(() => ({
        open: false,
        currentTarget: target
      }));
    }
  }

  scrollTo = event => {
    event.preventDefault();

    const target = $(this.state.currentTarget.selector);
    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;

    Helpers.scrollTo(elementTop, target.offset().top - 50, 500);
  }

  render() {

    const btnClasses = className({
      'lkseller_scroller': true,
      open: this.state.open
    });


    return (
      <div className="lkseller_scrollerBtn">
        <Button
          ref="scroller"
          onClick={this.togglePopup}
          className={btnClasses}>
          {this.state.currentTarget.text}
        </Button>
        <Overlay
          show={this.state.open}
          rootClose={true}
          onHide={this.togglePopup}
          placement='bottom'
          container={this}
          target={() => ReactDOM.findDOMNode(this.refs['scroller'])}>
          <CustomPopover
            fields={this.props.fields}
            setTarget={this.setTarget}
            scrollTo={this.scrollTo}/>
        </Overlay>
        <div className="lkscroller_goToBtnWrapper">
          <Button
            className="lkscroller_goToBtn"
            onClick={this.scrollTo}>
            {this.props.btnText}
          </Button>
        </div>
      </div>
    );
  }
}

export default ScrollSelector;
