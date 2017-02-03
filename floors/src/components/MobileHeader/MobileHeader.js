/**
 * MobileHeader widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {getDistance} from '../../utils/geoHelpers';
import {orderBy} from 'lodash';
import {getCookie, setCookie} from '../../utils/Helpers';
import classNames from 'classnames';
import s from './MobileHeader.scss';
/**
 * components
 */
import MainMenu from './MainMenu';
import CitySelector from './CitySelector';
import GeoLocationBlock from './GeoLocationBlock';
import Image from '../../shared/Image';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import withCondition from '../../decorators/withCondition';

@withCondition()
class MobileHeader extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    acceptOnGeoCancel: PropTypes.bool,
    actions: PropTypes.object,
    cities: PropTypes.object,
    citySelectTrue: PropTypes.bool,
    currency: PropTypes.object,
    current: PropTypes.object,
    favsCount: PropTypes.number,
    geoLocationTimeout: PropTypes.number,
    isAuthorized: PropTypes.bool,
    isLkEnabled: PropTypes.bool,
    lkSettings: PropTypes.object,
    logoIcon: PropTypes.string,
    logoLink: PropTypes.string,
    selectedCity: PropTypes.object,
    show: PropTypes.string,
    showGeo: PropTypes.bool,
    wpMenu: PropTypes.array
  };

  static defaultProps = {
    logoLink: '',
    isLkEnabled: true,
    acceptOnGeoCancel: true,
    geoLocationTimeout: 100
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      showGeo: false,
      nearestCity: null,
      geoFailed: false
    };
    this.geoTimer = null;
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    const {geoLocationTimeout, cities} = this.props;

    if(geoLocationTimeout && canUseDOM && !getCookie('selected_city')) {
      this.setState(() => ({showGeo: true}));
      this.geoTimer = setTimeout(() => {
        this.setState(() => ({geoFailed: true, nearestCity: 23}));
        this.geoTimer = null;
      }, geoLocationTimeout * 1000);
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          if(this.geoTimer) {
            clearTimeout(this.geoTimer);
            this.geoTimer = null;
          }
          let citiesCoords = Object.keys(cities).map(key => {
            const {id, coords} = cities[key];
            const coordsArr = coords ? coords.split(',') : [];

            return {
              id: id,
              lat: parseFloat(coordsArr[1]),
              lng: parseFloat(coordsArr[0])
            };
          });

          getDistance({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }, citiesCoords);

          citiesCoords = orderBy(citiesCoords, item => item.distance);
          this.setState(() => ({
            nearestCity: citiesCoords[0].id
          }));
        });
      } else {
        this.setState(() => ({
          showGeo: true,
          nearestCity: 23
        }));
      }
    }
  }

  toggle = e => {
    const {module} = e.target.dataset ? e.target.dataset : {module: null};

    this.props.actions.updateInUiState(['mobileShow'], state => {
      return state === module ? null : module;
    });
    this.setState(() => ({showGeo: false}));
  }

  close = () => {
    this.props.actions.updateInUiState(['mobileShow'], () => (null));
  }

  action = e => {
    const {cities, selectedCity: {city_id: cityId}} = this.props;
    let domain;
    let ancestor = e.target;

    while(!ancestor.dataset.action &&
      (ancestor = ancestor.parentElement)) {};
    const {action} = ancestor.dataset ? ancestor.dataset : {};
    const value = ancestor.value ? ancestor.value : ancestor.dataset.value;

    switch(action) {
    case 'currencyChange':
      const newCurrent = this.props.currency.currencyList.find(item => {
        return item.id === parseInt(value);
      });

      this.props.actions.updateInUiState(
        ['currency', 'current'], () => (newCurrent));
      break;
    case 'cityChange':
      const newCity = parseInt(value);

      domain = cities[newCity].office.site.match(/^([^\.]*)/)[0];
      this.setCookie('selected_city', domain);
      cityId !== newCity && (window.location.reload());
      this.props.actions.updateInUiState(
        ['mobileShow'], () => (null));
      break;
    case 'cityList':
      this.props.actions.updateInUiState(
        ['mobileShow'], () => ('cityList'));
      break;
    case 'geoCancel':
      if(!this.props.acceptOnGeoCancel) {
        this.setState(() => ({showGeo: false}));
        break;
      }
    case 'geoAccept':
      const {nearestCity} = this.state;

      this.setState(() => ({showGeo: false}));
      domain = cities[nearestCity].office.site.match(/^([^\.]*)/)[0];
      this.setCookie('selected_city', domain);
      cityId !== nearestCity && (window.location.reload());
      break;
    case 'geoDecline':
      this.setState(() => ({showGeo: false}));
      this.props.actions.updateInUiState(
        ['mobileShow'], () => ('cityList'));
      break;
    case 'mainSite':
      this.setCookie('no_mobile', 1);
      window.location = 'https://www.etagi.com';
      break;
    case 'closeMenu':
      this.props.actions.updateInUiState(['mobileShow'], () => null);
      break;
    default:
      throw(`Unknown action: ${action}`);
    }
  }

  setCookie = (name, value) => {
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');
    const settings = {
      domain: cookieDomain,
      expireDays: 7,
      path: '/'
    };

    setCookie(name, value, settings);
  }

  get icons() {
    const {isLkEnabled, citySelectTrue,
       show, favsCount, lkSettings, isAuthorized} = this.props;
    const {lkPage, modules} = lkSettings;
    const isFavsEnabled = modules.find(item => {
      return item.name === 'favorites' && item.enabled;
    }) !== undefined;
    const lkLogo = isAuthorized ? s.lkAutoriz : s.lk;

    return (
      <div className={s.icons}>
        {
          citySelectTrue ?
          (
            <span
              data-module='cityList'
              className={classNames(s.icon, s.citySelect)}
              onClick={this.toggle}/>
          ) : null
        }
        {isLkEnabled && isFavsEnabled ? (
          <a
            className={classNames(s.icon, s.favorites)}
            href={`${lkPage}#/favorites/`}>
            {favsCount ? <span className={s.badge}>{favsCount}</span> : null}
          </a>
        ) : null}
        {isLkEnabled ? (
          <span
            data-module='lk'
            className={classNames(s.icon, lkLogo)}
            onClick={this.toggle}/>
        ) : null}
        {show ? (
          <span
            className={classNames(s.icon, s.close)}
            onClick={this.close}/>
        ) : (
          <span
            data-module='mainmenu'
            className={classNames(s.icon, s.mainmenu)}
            onClick={this.toggle}/>
        )}
      </div>
    );
  }

  render() {
    const {
      logoIcon, wpMenu, selectedCity, currency, current, show, isLkEnabled,
      context, cities, logoLink, lkSettings
    } = this.props;
    const {showGeo, nearestCity, geoFailed} = this.state;
    const imageProps = {
      image: logoIcon,
      visual: 'media',
      width: 'site',
      source: 2
    };
    let module = null;

    switch(show) {
    case 'mainmenu':
      module = (
        <MainMenu
          context={context}
          menu={wpMenu}
          city={selectedCity}
          currency={{...currency, current: current}}
          isLkEnabled={isLkEnabled}
          lkSettings={lkSettings}
          action={this.action}/>
      );
      break;
    case 'cityList':
      module = (
        <CitySelector
          context={context}
          cities={cities}
          city={selectedCity}
          action={this.action}/>
      );
      break;
    default:
      //do nothing
    }

    return (
      <div className={classNames(s.root, {[s.fixedHeader]: show !== null})}>
        {showGeo ? (
          <GeoLocationBlock
            context={context}
            cities={cities}
            nearestCity={nearestCity}
            geoFailed={geoFailed}
            action={this.action}/>
        ) : null}
        <div className={s.header}>
          <div className={s.logo}>
            {logoLink.length > 0 ? (
              <a href={logoLink}><Image {...imageProps}/></a>
            ) : <Image {...imageProps}/>}
          </div>
          {this.icons}
        </div>
        {module}
      </div>
    );
  }

}

export default connect(
  (state, ownProps) => {
    const {isLkEnabled} = ownProps;

    return {
      show: state.ui.get('mobileShow'),
      selectedCity: state.settings.get('selectedCity') ?
        state.settings.get('selectedCity').toJS() : {},
      cities: state.collections.get('cities') ?
        state.collections.get('cities').toJS() : {},
      currency: state.intl.get('currency').toJS(),
      current: state.ui.get('currency').toJS().current,
      isAuthorized: isLkEnabled ? state.userData.get('isAuthorized') : false,
      favsCount: isLkEnabled && state.userData.get('favorites') ?
        state.userData.get('favorites').count() : 0,
      lkSettings: state.settings.get('lkSettings').toJS()
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInUiState}, dispatch)
    };
  }
)(MobileHeader);
