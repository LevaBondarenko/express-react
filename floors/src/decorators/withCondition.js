
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Conditions from '../core/Conditions';
import wss from '../stores/WidgetsStateStore';
import mss from '../stores/ModularSearcherStore';


function withCondition() {

  return ComposedComponent => class WithCondition extends Component {
    static propTypes = {
      id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ])
    };

    constructor(props) {
      super(props);
      this.state = {
        hidden: Conditions.checkHidden(this.props.id)
      };
      this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
      wss.onChange(this.onChange);
      mss.onChange(this.onChange);
    }

    componentWillUnmount() {
      wss.offChange(this.onChange);
      mss.offChange(this.onChange);
    }

    onChange() {
      Conditions.checkTextWidgets();
      this.checkHidden();
    }

    checkHidden = () => {
      const hidden = Conditions.checkHidden(this.props.id);

      if (this.state.hidden !== hidden) {
        this.setState(() => ({
          hidden: hidden
        }));
      }
    }

    render() {
      if (this.state.hidden) {
        return <div />;
      }

      return <ComposedComponent {...this.props} />;
    }

  };

}


export default withCondition;
