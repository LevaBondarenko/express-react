/**
 * Switcher component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {isEqual, size} from 'lodash';
import ContextType from '../../utils/contextType';
import {Iterable} from 'immutable';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import withCondition from '../../decorators/withCondition';

@withCondition()
class SwitcherOnOff extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    buttons: PropTypes.array,
    storeProperty: PropTypes.string,
    sourceStore: PropTypes.string,
    tornOn: PropTypes.string,
    valOn: PropTypes.string,
    valOff: PropTypes.string,
    offText: PropTypes.string,
    onText: PropTypes.string,
    id: PropTypes.string,
    selection: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    actions: PropTypes.object
  };

  static defaultProps = {
    sourceStore: 'wss'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  };

  constructor(props) {
    super(props);
    this.state = {
      selection: null
    };
    this.oldStores = this.props.sourceStore === 'wss';
  }

  update = (field, data) => {
    if(this.oldStores) {
      WidgetsActions.set(field, data);
    } else {
      this.props.actions.updateInUiState([field], () => (data));
    }
  }

  componentDidMount() {
    const {tornOn, valOn, valOff, storeProperty, id} = this.props;

    if(tornOn === 'on') {
      this.update(storeProperty || id, valOn);
    } else {
      size(valOff) && this.update(storeProperty || id, valOff);
    }
    if(this.oldStores) {
      this.onChange();
      wss.onChange(this.onChange);
    }
  }

  componentWillUnmount() {
    this.oldStores && this.state.sourceStore.offChange(this.onChange);
  }

  onChange = () => {
    const {storeProperty, id} = this.props;

    this.setState(() => ({
      selection: wss.get()[storeProperty || id] || null
    }));
  }

  selectionChange(e) {
    e.target.blur();
    const {valOn, valOff, storeProperty, id} = this.props;
    const {selection} = this.oldStores ? this.state : this.props;

    if (valOn && !isEqual(selection, valOn)) {
      this.update(storeProperty || id, valOn);
    } else {
      this.update(storeProperty || id, size(valOff) ? valOff : null);
    }
  }

  render() {
    const {selection} = this.oldStores ? this.state : this.props;
    const {valOn, offText, onText, id} = this.props;
    const isOn = isEqual(valOn, selection);

    return (
      <div>
        <div className='switcheronoff-wrapper'>
          <ButtonGroup>
            <Button
              active={isOn}
              onClick={this.selectionChange.bind(this)}
              data-value={id}>
              {isOn ? offText : onText}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const {sourceStore, storeProperty} = ownProps;
    let object = null;

    switch(sourceStore) {
    case 'redux.ui':
      object = state.ui.get(storeProperty);
      return {
        selection: object ? (
          Iterable.isIterable(object) ? object.toJS() : object
        ) : null
      };
      break;
    default:
      return {};
    }
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInUiState}, dispatch)
    };
  }
)(SwitcherOnOff);
