/**
 * SubMenu Widget
 */
import React, {Component, PropTypes} from 'react';
import {map, reject, find} from 'lodash';
import classNames from 'classnames';

class FastLinksMenu extends Component {
  static propTypes = {
    items: PropTypes.array
  };

  constructor(props) {
    super(props);

    const item = reject(this.props.items, {childItems: null})[0];

    this.state = {
      showMenu: false,
      item: item
    };
  }

  toggleMenu() {
    const itemId = arguments[0];
    let showMenu;

    if (this.state.item.id !== itemId) {
      showMenu = true;
    } else {
      showMenu = !this.state.showMenu;
    }

    this.setState(() => ({
      showMenu: showMenu,
      item: find(this.props.items, {id: itemId})
    }));
  }

  render() {
    const items = this.props.items;
    const self = this;

    // Рендерим основные пункты меню
    const menuItems = map(items, item => {
      const state = self.state;
      const title = item.title;
      const url = item.url;
      const hasMore = item.childItems ? true : false;
      const classes = item.className;
      const activeLink = state.showMenu && state.item.id == item.id;

      const className = classNames({
        'fastLinks_menuItem_link': true,
        'fastLinks_menuItem_link__hasMore': hasMore,
        'active': activeLink
      });

      return (
        <div className='fastLinks_menuItem' key={item.id}>
          <a
              className={`${className} ${classes}`}
              onClick={hasMore ? self.toggleMenu.bind(self, item.id) : ''}
              href={!hasMore ? url : 'javascript:void(0)'}>
                {title}
                {hasMore ?
                (<div className={(activeLink ?
                   'triangle__up' :
                   'triangle')}>
                </div>) :
            ''}
          </a>
        </div>
      );
    });
    const showMenu = this.state.showMenu;
    const item = this.state.item;

    // Рендерим дополнительные пункты меню (открываются по нажатию)
    const childItems = map(item.childItems, child => {

      const thirdLevelChildren = map(child.childItems, ch => {
        return (
          <a key={ch.id} className='submenu_link' href={ch.url}>{ch.title}</a>
        );
      });

      return (
        <div key={child.id} className="submenu_part">
          <div className='submenu_title'>{child.title}</div>
          {thirdLevelChildren}
        </div>
      );
    });

    const wrapperClasses = classNames({
      submenuWrapper: true,
      'submenuWrapper__grey': true,
      'submenuWrapper__hidden': !showMenu
    });
    const buttonClasses = classNames({
      'etagi--closeBtn': true,
      subMenuCloseBtn: true,
      'subMenuCloseBtn__hidden': !showMenu
    });
    const submenuClasses = classNames({
      submenu: true,
      'container-wide': true,
      'submenu_hidden': !showMenu
    });

    const subMenu = (
        <div
          className={wrapperClasses}>
          <div className="container-wide">
            <button
              onClick={self.toggleMenu.bind(self, item.id)}
              className={buttonClasses}>
              <span>x</span>
            </button>
            <div
              className={submenuClasses}>
              {childItems}
            </div>
          </div>
        </div>
    );

    return (
      <div className="fastLinksMenuWrapper">
        <div className="fastLinks container-wide">
          {menuItems}
        </div>
        {subMenu}
      </div>
    );
  }
}

export default FastLinksMenu;
