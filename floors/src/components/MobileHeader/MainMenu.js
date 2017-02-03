/**
 * MainMenu for mobile widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {PropTypes} from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MainMenu.scss';
import ContextType from '../../utils/contextType';
import CompactDropdown from '../../shared/CompactDropdown';
import FormControl from 'react-bootstrap/lib/FormControl';

const getCurrencySymbol = (currency) => {
  let {symbol} = currency;

  if(currency.char_code === 'RUB') {
    symbol = '\u20BD';
  } else if(currency.char_code === 'EUR') {
    symbol = '\u20AC';
  }

  return `${symbol} ${currency.char_code}`;
};

const MainMenu = (props) => {
  const {
    menu, city, currency, action, isLkEnabled, lkSettings, context, isFullscreen
  } = props;
  const {current: {id: selectedCurrencyId}} = currency || {current: {}};
  const {lkPage, modules} = lkSettings;
  const menuItems = isLkEnabled ? [
    {
      objectId: 'lk-0',
      classes: ['mobile-menu-icon', 'icon-profile'],
      title: 'Личный Кабинет',
      url: '#',
      childs: modules.filter(item => item.enabled).map(item => {
        return {
          objectId: `lk-${item.name}`,
          classes: [''],
          title: item.title,
          url: `${lkPage}#/${item.name}/`
        };
      })
    },
    ...menu
  ] : menu;

  return (
    <div className={classNames(
      {'mobile-modal': isFullscreen, [s.fullScreen]: isFullscreen},
      s.root
    )}>
      {city ? (
        <div className={s.city}>
          <div data-action='cityList' onClick={action}>
            <i className={s.mapMarker}/><span>{city.name}</span>
          </div>
          <div>{city.address}</div>
        </div>
      ) : null}
      <div className={s.menu}>
        {city ? (
          <CompactDropdown
            context={context}
            className={s.topItemContainer}
            title='Настройки'
            titleClassName={classNames(
              'mobile-menu-icon',
              'icon-cog',
              s.topItem
            )}
            key='settings-0'>
            <div
              className={classNames(s.menuItem, s.menuCitySelect)}
              key='settings-city'
              data-action='cityList'
              onClick={action}>
              <div>Сменить город</div>
              <div className={s.menuCityName}>{city.name}</div>
            </div>
            <div
              className={classNames(s.menuItem, s.menuCurrencySelect)}
              key='settings-currency'>
              <div>Сменить валюту</div>
              <div>
                <FormControl
                  onChange={action}
                  data-action='currencyChange'
                  className={s.menuCurrencyControl}
                  componentClass="select"
                  value={selectedCurrencyId}>
                  {currency.currencyList.map(item => {
                    return (
                      <option value={item.id} key={`currencyId:${item.id}`}>
                        {getCurrencySymbol(item)}
                      </option>
                    );
                  })}
                </FormControl>
              </div>
            </div>
          </CompactDropdown>
        ) : null}
        {menuItems.map(topItem => {
          return topItem.childs && topItem.childs.length ? (
            <CompactDropdown
              context={context}
              className={s.topItemContainer}
              title={topItem.title}
              titleClassName={[s.topItem, ...topItem.classes].join(' ')}
              key={topItem.objectId}>
              {topItem.childs.map(item => {
                return (
                  <a className={[s.menuItem, ...item.classes].join(' ')}
                    href={item.url}
                    key={item.objectId}
                    data-action='closeMenu'
                    onClick={action}>
                    {item.title}
                  </a>
                );
              })}
            </CompactDropdown>
          ) : (
            <div className={s.topItemContainer} key={topItem.objectId}>
              <div className={[s.topItem, ...topItem.classes].join(' ')}>
                <a data-action='closeMenu'
                   onClick={action}
                   href={topItem.url}>{topItem.title}</a>
              </div>
            </div>
          );
        })}
      </div>
      <div className={s.mainSiteLink}>
        <a onClick={action} data-action='mainSite'>
          Перейти к полной версии сайта
        </a>
      </div>
    </div>
  );
};

MainMenu.propTypes = {
  context: PropTypes.shape(ContextType).isRequired,
  menu: PropTypes.array,
  city: PropTypes.object,
  currency: PropTypes.object,
  isLkEnabled: PropTypes.bool,
  lkSettings: PropTypes.object,
  action: PropTypes.func,
  isFullscreen: PropTypes.bool
};

MainMenu.defaultProps = {
  isFullscreen: true
};

export default withStyles(s)(MainMenu);
