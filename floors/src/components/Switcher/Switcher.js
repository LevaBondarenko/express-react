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
import {map, isEqual} from 'lodash';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';
import WidgetsActions from '../../actions/WidgetsActions';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';
import {Iterable} from 'immutable';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import withCondition from '../../decorators/withCondition';

@withCondition()
class Switcher extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    buttons: PropTypes.array,
    storeProperty: PropTypes.string,
    defaultButton: PropTypes.string,
    defaultSet: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    sourceStore: PropTypes.string,
    id: PropTypes.string,
    selection: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    actions: PropTypes.object
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  static defaultProps = {
    sourceStore: 'wss',
    defaultButton: '',
    defaultSet: '1'
  }

  constructor(props) {
    super(props);
    let sourceStore, actions, oldStores = true;

    switch (this.props.sourceStore) {
    case 'wss':
      actions = WidgetsActions;
      sourceStore = wss;
      break;
    case 'mss':
      actions = ModularSearcherActions;
      sourceStore = mss;
      break;
    case 'redux.ui':
      actions = 'ui';
      sourceStore = 'props';
      oldStores = false;
      break;
    default:
      actions = WidgetsActions;
      sourceStore = wss;
    }
    this.state = {
      selection: null,
      sourceStore: sourceStore,
      actions: actions
    };
    this.oldStores = oldStores;
  }

  componentDidMount() {
    const {defaultButton, buttons: {0: defaultBtn}} = this.props;

    this.oldStores && this.state.sourceStore.onChange(this.onChange);
    if(parseInt(this.props.defaultSet)) {
      const data = defaultButton ? defaultButton : (
        typeof defaultBtn.value === 'object' ?
          defaultBtn.value[this.props.storeProperty] : defaultBtn.value
      );

      this.update(data, this.props.storeProperty || this.props.id);
    } else {
      this.oldStores && this.onChange();
    }
  }

  componentWillUnmount() {
    this.oldStores && this.state.sourceStore.offChange(this.onChange);
  }

  update = (data, field) => {
    if(this.oldStores) {
      this.state.actions.set(field, data);
    } else {
      this.props.actions.updateInUiState([field], () => (data));
    }
  }

  onChange = () => {
    this.setState(() => ({
      selection:
        this.state.sourceStore.get()[this.props.storeProperty || this.props.id]
    }));
  }

  selectionChange = (event) => {
    event.target.blur();
    const {buttons, storeProperty} = this.props;
    const {actions, sourceStore} = this.state;
    const key = parseInt(event.currentTarget.dataset.value);
    const curValue = this.oldStores ? sourceStore.get(storeProperty) :
      this.props.selection;
    const selectedValue = buttons[key]['value'];
    const selectedMainValue = typeof selectedValue === 'object' ?
      selectedValue[storeProperty] : selectedValue;

    if (selectedValue === '10') {
      ga('tabs', 'zastr_Opisanie');
    }
    if (selectedValue === '11') {
      ga('tabs', 'zastr_Harakteristiki');
    }
    if (selectedValue === '12') {
      ga('tabs', 'zastr_Akcii');
    }
    // сбрасываем текущую модель
    if(this.oldStores && actions.hasOwnProperty('smartFlush') &&
      !isEqual(curValue, selectedMainValue)) {
      actions.smartFlush();
    }

    // если значение является объектом, то записываем его в модель
    if (typeof selectedValue === 'object') {
      this.update(selectedValue);
    } else {
      (selectedValue && !isEqual(curValue, selectedMainValue)) &&
        this.update(selectedValue, this.props.storeProperty || this.props.id);
    }

    if(this.oldStores && this.state.actions.hasOwnProperty('getCollections') &&
      !isEqual(curValue, selectedValue)) {
      this.state.actions.getCollections();
    }
  }

  get buttons() {
    const {selection} = this.oldStores ? this.state : this.props;
    const {buttons, storeProperty} = this.props;

    const content = map(buttons, (btn, key) => {
      const btnVal = typeof btn.value === 'object' ?
        btn.value[storeProperty] : btn.value;

      return (
        <Button
          key={`${key}_${storeProperty}`}
          active={isEqual(btnVal, selection) ? true : false}
          onClick={this.selectionChange}
          data-value={key}>
          {btn.text}
        </Button>
      );
    });

    return content;
  }

  render() {
    return (
      <div>
        <div className='switcher-wrapper'>
          <ButtonGroup>
            {this.buttons}
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
)(Switcher);
