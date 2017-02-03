/**
 * MobileMenu widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './MobileMenu.scss';
import {setCookie} from '../../utils/Helpers';
/**
 * components
 */
import MainMenu from '../MobileHeader/MainMenu';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';

class MobileMenu extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    isLkEnabled: PropTypes.bool,
    wpMenu: PropTypes.array,
    lkSettings: PropTypes.object,
  };

  static defaultProps = {
    isLkEnabled: true,
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

  action = e => {
    let ancestor = e.target;

    while(!ancestor.dataset.action &&
      (ancestor = ancestor.parentElement)) {};
    const {action} = ancestor.dataset ? ancestor.dataset : {};

    switch(action) {
    case 'mainSite':
      setCookie('no_mobile', 1, {
        domain: window.location.host.replace(/^[^.]*/, ''),
        expireDays: 7,
        path: '/'
      });
      window.location = 'https://www.etagi.com';
      break;
    default:
      throw(`Unknown action: ${action}`);
    }
  }

  render() {
    const {context, wpMenu, isLkEnabled, lkSettings} = this.props;

    return (
      <div className={s.root}>
        <MainMenu
          context={context}
          menu={wpMenu}
          isFullscreen={false}
          city={null}
          currency={null}
          isLkEnabled={isLkEnabled}
          lkSettings={lkSettings}
          action={this.action}/>
      </div>
    );
  }

}

export default connect(
  (state, ownProps) => {
    const {isLkEnabled} = ownProps;

    return {
      lkSettings: isLkEnabled ? state.settings.get('lkSettings').toJS() : {}
    };
  }
)(MobileMenu);
