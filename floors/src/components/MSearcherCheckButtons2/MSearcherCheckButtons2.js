/**
 * Modular Searcher Buttons v2 component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import s from './MSearcherCheckButtons2.scss';
import {map, size} from 'lodash';
import CheckButton from '../../shared/CheckButton';
import Immutable, {Iterable} from 'immutable';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class MSearcherCheckButtons2 extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    buttons: PropTypes.object,
    field: PropTypes.string,
    extProps: PropTypes.array,
    extVals: PropTypes.array,
    id: PropTypes.string,
    labelText: PropTypes.string,
    selected: PropTypes.array,
    actions: PropTypes.object,
  };

  static defaultProps = {
    extProps: [],
    extVals: []
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
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

  toggleButton = event => {
    const {value} = event.target;
    const {extProps, extVals, selected, field, buttons} = this.props;
    const wasChecked = selected.indexOf(value) > -1;
    const anyChecked = buttons.buttons.map(item => item.value).filter(item => {
      return item !== value && selected.indexOf(item) > -1;
    }).length > 0;

    this.modifyData(field, value);

    for(const i in extProps) {
      if(extProps[i] && extVals[i] !== undefined) {
        this.modifyData(
          extProps[i],
          extVals[i],
          wasChecked && !anyChecked ? 'remove' : 'set');
      }
    }
  }

  render() {
    const {id: idPrfx, buttons, selected, labelText} = this.props;
    let list = map(buttons.buttons, (btn, key) => {
      return (
        <CheckButton
          key={key}
          itemID={idPrfx + btn.value}
          itemLabel={btn.text}
          onValue={btn.value}
          offValue=''
          onChange={this.toggleButton}
          dataModel={selected}
          model={this.props.field}
          mode='1'
          pullLeft='1'
        />
      );
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});

    return (
      <div className="msearcher">
        <div className="clearfix msearcher--checkbuttons">
          {list}
          {size(labelText) ? (
            <span className="msearcher--checkbuttons__label">
              {labelText}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const searcher = state.objects.get('searcher').toJS();

    return {
      selected: searcher[ownProps.field] || []
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(MSearcherCheckButtons2);
