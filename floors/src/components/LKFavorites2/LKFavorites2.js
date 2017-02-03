/**
 * LKFavorites2 widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import Immutable, {Iterable} from 'immutable';
import createFragment from 'react-addons-create-fragment';
import {size} from 'lodash';
import s from './LKFavorites2.scss';
import ContextType from '../../utils/contextType';
import FormControl from 'react-bootstrap/lib/FormControl';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {updateInUserDataState} from '../../actionCreators/UserDataActions';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

const realtyClasses = {
  flats: 'Квартиры',
  rent: 'Аренда квартир',
  cottages: 'Загородная недвижимость',
  offices: 'Коммерческая недвижимость'
};

class LKFavorites2 extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    favorites: PropTypes.array,
    lkShow: PropTypes.string
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      dispClass: null,
      availClasses: []
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
    this.props.actions.updateInObjectsState(['searcher'], () => (
      Immutable.fromJS({
        preventUrlModification: true,
        city_id: 'all', //eslint-disable-line camelcase
        class: 'flats',
        fields: [],
        object_id: [0] //eslint-disable-line camelcase
      })
    ));
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.favorites.length !== this.props.favorites.length) {
      const {favorites} = nextProps;
      const {dispClass} = this.state;
      const availClasses = this.getAvailClasses(favorites);
      const newDispClass =
        availClasses.length && availClasses.indexOf(dispClass) > -1 ?
        dispClass : (availClasses[0] || null);

      this.updateSearcher(newDispClass, favorites);

      this.setState(() => ({
        dispClass: newDispClass,
        availClasses: availClasses
      }));

      this.props.actions.updateInUiState(
        ['showFavoritesResult'], () => (size(favorites) ? '1' : '0'));
    }
  }

  updateSearcher(oclass, favorites) {
    const oids = favorites
      .filter(item => {
        return item.class === oclass;
      })
      .map(item => item.id);

    if(oclass && oids.length) {
      this.props.actions.updateInObjectsState(
        ['searcher', 'class'], () => (oclass)
      );
      this.props.actions.updateInObjectsState(
        ['searcher', 'object_id'],
        state => {
          const isEmpty = state === undefined;
          const wasIterable = Iterable.isIterable(state);

          return wasIterable || isEmpty ?
            Immutable.fromJS(oids) : oids;
        }
      );
    }
  }

  getAvailClasses = favorites => {
    const availClasses = [];

    favorites
      .filter(item => {return item.class !== 'nh_flats';})
      .forEach(item => {
        availClasses.indexOf(item.class) < 0 && availClasses.push(item.class);
      });
    return availClasses;
  }

  handleSelect = e => {
    const {value} = e.target;
    const {favorites} = this.props;

    this.updateSearcher(value, favorites);
    this.setState(() => ({
      dispClass: value
    }));
  }

  render() {
    const {favorites, lkShow} = this.props;
    const {dispClass, availClasses} = this.state;
    let list = lkShow === 'favorites' ? availClasses.map(item => {
      return (
        <option
          key={`favorites-${item}`}
          value={item}>
          {realtyClasses[item]}
        </option>
      );
    }) : [];

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});

    return lkShow === 'favorites' ? (
      <div className={s.root}>
        <div className={s.title}>
          Избранное
        </div>
        {size(favorites) ? (
          <div className={s.classSelector}>
            <FormControl
              componentClass='select'
              className={s.selectorControl}
              value={dispClass || -1}
              disabled={availClasses.length < 1}
              onChange={this.handleSelect}>
              {list}
            </FormControl>
          </div>
        ) : (
          <div className={s.dummy}>
            <div className={s.icon}>
              <i/>
            </div>
            <div className={s.dummyTitle}>
              В вашем избранном пока пусто
            </div>
            <div className={s.description}>
              Добавляйте объекты в избранное и они появятся здесь
            </div>
          </div>
        )}
      </div>
    ) : null;
  }

}

export default connect(
  state => {
    return {
      lkShow: state.ui.get('lkShow'),
      favorites: state.userData.get('favorites') ?
        state.userData.get('favorites').toJS() : []
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState,
        updateInUserDataState,
        updateInObjectsState
      }, dispatch)
    };
  }
)(LKFavorites2);
