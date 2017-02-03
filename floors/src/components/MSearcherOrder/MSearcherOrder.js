/**
 * MSearcherOrder widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import {size} from 'lodash';
import classNames from 'classnames';
import s from './MSearcherOrder.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  updateInObjectsState, massUpdateInObjectsState
} from '../../actionCreators/ObjectsActions';

class MSearcherOrder extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    orderings: PropTypes.array,
    defaultOrder: PropTypes.string,
    actions: PropTypes.object,
    order: PropTypes.string,
    id: PropTypes.string
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    const {order, orderings} = this.props;
    const selectedOrder = orderings.find(item => {
      return item.order === order;
    });

    selectedOrder && this.props.actions.updateInObjectsState(
      ['searcher', 'orderTitle'],
      () => (selectedOrder.title.toLowerCase())
    );
  }

  toggleShow = () => {
    this.setState(() => ({show: !this.state.show}));
  }

  toggleOrder = e => {
    let ancestor = e.target, order = null;

    while((!ancestor.dataset || !ancestor.dataset.order) &&
      (ancestor = ancestor.parentNode)) {};
    if(ancestor && ancestor.dataset && ancestor.dataset.order) {
      order = ancestor.dataset.order;
    }

    if(order) {
      const toUpdate = {
        offset: 0
      };

      ancestor.dataset.title &&
        (toUpdate.orderTitle = ancestor.dataset.title.toLowerCase());
      this.props.actions.massUpdateInObjectsState(
        ['searcher'], toUpdate
      );
      this.props.actions.updateInObjectsState(
        ['searcher', 'order'],
        () => (order)
      );
    }
    this.setState(() => ({show: false}));
  }

  get list() {
    const {orderings, order, id} = this.props;
    const list = orderings.map((item, key) => {
      const active = order === item.order;

      return (
        <div
          key={`${id}-${key}`}
          className={classNames(
            s.listItem,
            {[s.active]: active}
          )}
          data-order={item.order}
          data-title={item.title}
          onClick={this.toggleOrder}>
          {item.title}
        </div>
      );
    });

    return size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});
  }

  render() {
    const {show} = this.state;

    return (
      <div className={s.root}>
        <div className={s.button}>
          <button className='form-control' onClick={this.toggleShow}>
            <span className={s.sortIco} />
            <span className={s.sortText}>Сортировать</span>
          </button>
        </div>
        {show ? (
          <div className={classNames(s.modal, 'mobile-modal', 'fullscreen')}>
            <div className={s.modalClose} onClick={this.toggleShow}/>
            <div className={s.modalTitle}>Выберите сортировку</div>
            <div className={s.list}>
              {this.list}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

}

export default connect(
  state => {
    const searcher = state.objects.get('searcher').toJS();

    return {
      order: searcher.order || null
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInObjectsState, massUpdateInObjectsState
      }, dispatch)
    };
  }
)(MSearcherOrder);
