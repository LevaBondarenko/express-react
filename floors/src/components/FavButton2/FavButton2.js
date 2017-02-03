/**
 * FavButton2 widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import classNames from 'classnames';
import {inFavorites} from '../../utils/lkHelpers';
import s from './FavButton2.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {userDataUpdateFavorites} from '../../actionCreators/UserDataActions';
import {updateInUiState} from '../../actionCreators/UiActions';

class FavButton2 extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    isFavoritesEnabled: PropTypes.bool,
    inFavorites: PropTypes.bool,
    isAuthorized: PropTypes.bool,
    oid: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    oclass: PropTypes.string,
    className: PropTypes.string,
    label: PropTypes.string,
    addedLabel: PropTypes.string
  };

  static defaultProps = {};

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

  toggle = () => {
    const {
      isAuthorized, inFavorites, isFavoritesEnabled, oid, oclass
    } = this.props;

    if(isFavoritesEnabled) {
      if(isAuthorized) {
        this.props.actions.userDataUpdateFavorites(
          inFavorites ? 'del' : 'add', oid, oclass
        );
      } else {
        this.props.actions.updateInUiState(['mobileShow'], () => ('lk'));
      }
    }
  }

  render() {
    const {
      isFavoritesEnabled, className, label, addedLabel, inFavorites
    } = this.props;

    return isFavoritesEnabled ? (
      <button className={classNames(s.root, className)} onClick={this.toggle}>
        <i className={classNames({'in-favorites': inFavorites})}/>
        {inFavorites ? addedLabel : label}
      </button>
    ) : null;
  }

}

export default connect(
  (state, ownProps) => {
    const lkSettings = state.settings.get('lkSettings').toJS();
    const isFavoritesEnabled = lkSettings.modules.find(item => {
      return item.name === 'favorites' && item.enabled;
    }) !== undefined;
    const favorites = state.userData.get('favorites') ?
      state.userData.get('favorites').toJS() : [];
    const objectInfo = !ownProps.oid || !ownProps.oclass ?
      (state.objects.get('object') ?
        state.objects.get('object').toJS().info : {}) : null;
    const oclass = ownProps.oclass ? ownProps.oclass :
      ((typeof objectInfo.gp === 'object') ? 'nh_flats' :
        (objectInfo.table === 'rent' ? 'rent' : objectInfo.class));
    const oid = ownProps.oid ? ownProps.oid :
      (oclass === 'nh_flats' ? objectInfo.id : objectInfo.object_id);

    return {
      isAuthorized: state.userData.get('isAuthorized') || false,
      inFavorites: inFavorites(oid, oclass, favorites),
      isFavoritesEnabled: isFavoritesEnabled,
      oid: oid,
      oclass: oclass
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        userDataUpdateFavorites,
        updateInUiState
      }, dispatch)
    };
  }
)(FavButton2);
