/**
 * Modular Searcher Buttons component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import CheckButton from '../../shared/CheckButton';
import withCondition from '../../decorators/withCondition';
import Immutable, {Iterable} from 'immutable';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class UCheckButtons extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    buttons: PropTypes.array,
    objectName: PropTypes.string,
    fieldName: PropTypes.string,
    id: PropTypes.string,
    labelText: PropTypes.string,
    actions: PropTypes.object,
    dataModel: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.array
    ]),
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
    isRadio: React.PropTypes.bool
  };
  static defaultProps = {
    isRadio: true
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  toggleButton = event => {
    const {value} = event.target;
    const {objectName, fieldName, isRadio, actions} = this.props;

    if (isRadio) {
      actions.updateInObjectsState([objectName, fieldName], state => {
        const isEmpty = state === undefined || state === null;
        const wasIterable = Iterable.isIterable(state);
        const selected = isEmpty ? [] : (wasIterable ? state.toJS() : state);
        const index = selected.indexOf(value);

        if(index > -1) {
          selected.splice(index, 1);
        } else {
          selected.push(value);
        }

        return wasIterable || isEmpty ? Immutable.fromJS(selected) : selected;
      });
    } else {
      this.props.actions.updateInObjectsState(
        [objectName, fieldName], () => (value));
    }
  }

  render() {
    const {dataModel, id: idPrfx, fieldName, labelText} = this.props;
    const buttons = map(this.props.buttons, (btn, key) => {
      return (
        <CheckButton
          key={key}
          itemID={idPrfx + btn.value}
          itemLabel={btn.text}
          onValue={btn.value}
          offValue=''
          onChange={this.toggleButton}
          dataModel={dataModel}
          model={fieldName}
          mode='1'
          pullLeft='1'
        />
      );
    });

    return (
      <div className="msearcher">
        <div className="clearfix msearcher--checkbuttons">
          {buttons}
          <span className="msearcher--checkbuttons__label">
            {labelText}
          </span>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state, ownProps) {
  const {objectName, fieldName} = ownProps;
  const obj = state.objects.get(objectName) ?
    state.objects.get(objectName).toJS() : {};

  return {
    isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
    isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
    msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
    err: obj._validationStates ? obj._validationStates[fieldName] : null,
    dataModel: obj[fieldName] || []
  };
}

UCheckButtons = connect(mapStateToProps, mapDispatchToProps)(UCheckButtons);
UCheckButtons = withCondition()(UCheckButtons);

export default UCheckButtons;
