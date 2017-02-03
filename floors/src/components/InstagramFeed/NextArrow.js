import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class NextArrow extends Component {

  static propTypes = {
    onClick: PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="slider-nav-next-wrapper" onClick={this.props.onClick}>
        <div className="slider-nav-bg" />
        <a href="javascript:void(0)"
           className="slider-nav-next"
           onClick={this.props.onClick} />
      </div>
    );
  }

}

export default NextArrow;
