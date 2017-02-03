/**
 * Modular Searcher CheckBox v2 component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import s from './MSearcherCheckBox2.scss';
import {size} from 'lodash';
import classNames from 'classnames';
import CheckButton from '../../shared/CheckButton';
import Hint from '../../shared/Hint';
import Immutable, {Iterable} from 'immutable';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class MSearcherCheckBox2 extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    labelText: PropTypes.string,
    mode: PropTypes.string,
    isButton: PropTypes.bool,
    field: PropTypes.array,
    asArray: PropTypes.bool,
    onValue: PropTypes.array,
    offValue: PropTypes.array,
    showHint: PropTypes.bool,
    visibilityProperty: PropTypes.string,
    hintText: PropTypes.string,
    model: PropTypes.object,
    isLoading: PropTypes.bool,
    visible: PropTypes.bool,
    count: PropTypes.string,
    actions: PropTypes.object
  };

  static defaultProps = {
    hintText: 'Подобрано count {вариант|варианта|вариантов} квартир'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      displayHint: false
    };
    this.timer = null;
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    const {showHint, isLoading} = this.props;
    const {displayHint} = this.state;

    if(showHint && displayHint && isLoading && !nextProps.isLoading) {
      this.timer = setTimeout(() => {
        this.setState(() => ({
          displayHint: false
        }));
      }, 2000);
    }
  }

  modifyData = (field, value, mode) => {
    this.props.actions.updateInObjectsState(['searcher', field], state => {
      const isEmpty = state === undefined;
      const wasIterable = Iterable.isIterable(state);
      const selected = isEmpty ? [] : (wasIterable ? state.toJS() : state);
      const index = selected.indexOf(value);

      switch(mode) {
      case 'set':
        if(index === -1) {
          selected.push(value);
        }
        break;
      case 'remove':
        if(index > -1) {
          selected.splice(index, 1);
        }
        break;
      default:
        if(index > -1) {
          selected.splice(index, 1);
        } else {
          selected.push(value);
        }
      }

      return wasIterable || isEmpty ? Immutable.fromJS(selected) : selected;
    });
  }

  toggleButton = () => {
    const {field, onValue, offValue, asArray} = this.props;
    const checked = this.checked;
    const newValues = checked ? offValue : onValue;
    const oldValues = checked ? onValue : offValue;

    if (asArray) {
      for(const i in field) {
        if(field[i]) {
          if(newValues[i]) {
            this.modifyData(field[i], newValues[i], 'set');
          }
          if(oldValues[i]) {
            this.modifyData(field[i], oldValues[i], 'remove');
          }
        }
      }
    } else {
      for (const i in field) {
        if (field[i]) {
          this.props.actions.updateInObjectsState(
            ['searcher', field[i]], () => newValues[i]);
        }
      }
    }

    if(this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setState(() => ({
      displayHint: true
    }));
  }

  get checked() {
    const {model, field, onValue, asArray} = this.props;
    const checked = field.filter((key, idx) => {
      return model[key] && (asArray ?
        model[key].indexOf(onValue[idx]) > -1 :
        model[key] && model[key] === onValue[idx]
      );
    });

    return size(checked) && size(checked) === size(field);
  }

  render() {
    const {
      showHint, hintText, isButton, visible, count, isLoading, id, labelText,
      mode
    } = this.props;
    const {displayHint} = this.state;
    const modeClass = classNames('clearfix', {
      'msearcher--checkbuttons': isButton,
      'msearcher--checkbox clearfix': !isButton
    });

    return (
      <div className='msearcher' style={{display: visible ? 'block' : 'none'}}>
        <div className={modeClass}>
          {showHint ? (
            <Hint
              ref='currentHint'
              template={hintText}
              display={displayHint}
              loading={isLoading}
              top={0}
              left={241}
              count={count}
              {...this.props}
            />
          ) : null}
          <CheckButton
            itemID={id}
            itemLabel={labelText}
            onChange={this.toggleButton}
            mode={mode}
            checked={this.checked}/>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const {field, visibilityProperty} = ownProps;
    const searcher = state.objects.get('searcher').toJS();
    const model = {};

    field.forEach(key => {
      searcher[key] && (model[key] = searcher[key]);
    });

    return {
      model: model,
      visible: visibilityProperty ?
        state.ui.get(visibilityProperty) || false :
        true,
      count: searcher.count,
      isLoading: searcher.isLoading
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(MSearcherCheckBox2);
