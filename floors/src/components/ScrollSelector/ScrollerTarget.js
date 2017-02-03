import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class ScrollerTarget extends Component {

  static propTypes = {
    setTarget: React.PropTypes.func,
    target: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  setTarget(event) {
    event.preventDefault();

    this.props.setTarget(this.props.target);
  }

  render() {
    const target = this.props.target;

    return (
      <div className="lkscroller_target">
        <a
          href="#"
          onClick={this.setTarget.bind(this)}
          className="btn">
          {target.text}
        </a>
      </div>
    );
  }

}

export default ScrollerTarget;