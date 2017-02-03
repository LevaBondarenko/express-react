/**
 * LKRouter widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {size} from 'lodash';
import Immutable from 'immutable';
import s from './LKRouter.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {updateInUserDataState} from '../../actionCreators/UserDataActions';

class LKRouter extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    defaultModule: PropTypes.string,
    actions: PropTypes.object,
    lkSettings: PropTypes.object,
    isAuthorized: PropTypes.bool,
    mobileShow: PropTypes.string,
    lkShow: PropTypes.string
  };

  static defaultProps = {
    defaultModule: 'favorites'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      invited: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
    window.removeEventListener('hashchange', this.onHashChange);
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.onHashChange);
    this.onHashChange();
    this.checkAuth();
  }

  componentWillReceiveProps() {
    this.checkAuth();
  }

  checkAuth = () => {
    setTimeout(() => {
      const {isAuthorized, mobileShow} = this.props;
      const {invited} = this.state;

      if(!isAuthorized) {
        if(invited && !mobileShow) {
          window.location = '/';
        } else if(!this.state.invited) {
          this.props.actions.updateInUiState(['mobileShow'], () => ('lk'));
          this.setState(() => ({invited: true}));
        }
      } else {
        this.setState(() => ({invited: false}));
      }
    }, 1000);
  }

  onHashChange = () => {
    const hashData = this.parseHash(window.location.hash);
    const {lkSettings, defaultModule} = this.props;
    const {modules} = lkSettings;
    const activeModules = modules
      .filter(item => item.enabled)
      .map(item => item.name);

    activeModules.push('error');
    if(activeModules.indexOf(hashData.module) < 0) {
      window.location.hash = `#/${defaultModule}/`;
      this.props.actions.updateInUiState(['lkShow'], () => (defaultModule));
    } else {
      this.props.actions.updateInUiState(['lkShow'], () => (hashData.module));
      this.props.actions.updateInUiState(['lkModuleParams'], () => (
        Immutable.fromJS(hashData.params)
      ));
      if(hashData.module === 'error') {
        this.props.actions.updateInUiState(['mobileShow'], () => ('lk'));
      }
    }
  }

  parseHash = hash => {
    const hashData = hash.replace(/^\#\//, '').match(/([^\/]+)/g);

    return size(hashData) ? {
      module: hashData[0],
      params: hashData.slice(1)
    } : {
      module: 'error',
      params: []
    };
  }

  toggleMenu = () => {
    this.props.actions.updateInUiState(['mobileShow'], () => ('lk'));
  }

  render() {
    const {lkShow} = this.props;

    return lkShow === 'error' ? (
      <div className={s.root}>
        Такой страницы нет.<br/>
        <a rel='nofollow' onClick={this.toggleMenu}>Перейти в личный кабинет</a>
      </div>
    ) : null;
  }

}

export default connect(
  state => {
    return {
      mobileShow: state.ui.get('mobileShow'),
      lkShow: state.ui.get('lkShow'),
      isAuthorized: state.userData.get('isAuthorized') || false,
      userData: state.userData.get('userdata') ?
        state.userData.get('userdata').toJS() : {},
      lkSettings: state.settings.get('lkSettings').toJS()
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState,
        updateInUserDataState
      }, dispatch)
    };
  }
)(LKRouter);
