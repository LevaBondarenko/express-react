/**
 * SubMenu Widget
 */
import React, {Component} from 'react';
import {map} from 'lodash';
import classNames from 'classnames';

class SubMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false
    };
  }

  toggleMenu = () => {
    const val = this.state.showMenu;

    this.setState(() => ({
      showMenu: !val
    }));
  }

  render() {

    const {items, leftOffset} = this.props;
    const visible = this.state.showMenu;

    const menuParts = map(items, item => {
      const menuPart = map(item.childItems, child => {
        return (
          <a className="submenu_link"
             key={child.id}
             href={child.url}>{child.title}</a>
        );
      });

      return (
        <div className="submenu_part" key={item.id}>
          <div className="submenu_title">{item.title}</div>
          {menuPart}
        </div>
      );

    });
    const closeBtnClasses = classNames({
      'etagi--closeBtn': true,
      'subMenuCloseBtn': true,
      'subMenuCloseBtn__hidden': !visible
    });
    const switcherClasses = classNames({
      'advanced-menu-switcher': true,
      'container-wide': true,
      'advanced-menu-switcher__active': visible
    });
    const submenuClasses = classNames({
      'submenuWrapper': true,
      'submenuWrapper__hidden': !visible
    });

    return (
      <div className="submenuWrapperWrapper">
        <div className="container-wide">
          <button
            onClick={this.toggleMenu}
            className={closeBtnClasses}>
            <span>x</span>
          </button>
          <div className="container-wide">
            <div
              className={switcherClasses}
              style={{left: `${leftOffset}px`}}
              >
                <a onClick={this.toggleMenu} href="javascript:void(0)"></a>
            </div>
          </div>
          <div
            className={submenuClasses}>
            <div className="submenu container-wide">
              {menuParts}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SubMenu.propTypes = {
  items: React.PropTypes.array,
  leftOffset: React.PropTypes.string
};

export default SubMenu;
