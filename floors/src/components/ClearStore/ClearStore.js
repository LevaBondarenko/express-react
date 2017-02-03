
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {clone} from 'lodash';
import wss from '../../stores/WidgetsStateStore';
import WidgetActions from '../../actions/WidgetsActions';

class ClearStore extends Component {
  static propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    property: PropTypes.string,
    className: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    wss.onChange(this.onChange);
  }

  onChange = () => {
    if (!wss.get(this.props.property)['isProgsLoading'] && !this.state.value) {
      const propValue = clone(wss.get(this.props.property));

      this.setState(()=> ({
        value: propValue
      }));
    }
  }

  handleClick = (event) => {
    event.preventDefault();

    WidgetActions.set(null, {
      [this.props.property]: clone(this.state.value),
      moreFields: '2'
    });
  }

  render() {
    const {title, className} = this.props;

    return (
      <div>
        <a
          href="#"
          className={className}
          onClick={this.handleClick}
        >
          <i className="fa fa-trash" />
          {title}
        </a>
      </div>
    );
  }
}

export default ClearStore;
