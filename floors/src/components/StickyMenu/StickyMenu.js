/**
 * Sticky menu component
 *
 * @ver 0.0.1
 * @author Babitsyn Andrey
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import Sticky from 'react-stickynode';
import UserAgentData from 'fbjs/lib/UserAgentData';
import {map} from 'lodash';
import {findPos, scrollTo} from '../../utils/Helpers';


class StickyMenu extends Component {

  constructor(props) {
    super(props);
  }

  handleScroll = (event) => {
    const target = event.currentTarget.dataset.target;
    const offsetTop = findPos(target);

    event.preventDefault();

    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;

    scrollTo(elementTop, offsetTop - 120, 600);
  }

  render() {
    const props = this.props;
    const items = props.items;

    /** @this StickyMenu */
    const menuItems = map(items, (item, key) => {
      const text = item.link ? {__html: item.link} : {__html: '&nbsp;'};

      return (
        <li className='menu-white__menu-white-item' key={key}>
          <a
            href='#'
            onClick={this.handleScroll}
            data-target={item.target} dangerouslySetInnerHTML={text}>
          </a>
        </li>
      );
    });

    const liHtml = (
      <div className='affixNav'>
        <div className={props.fixedClass ?
                `bs-docs-sidebar hidden-print ${props.fixedClass}` :
                'bs-docs-sidebar hidden-print realtyobject-menu'}
             role='complementary'>
          <div className='searchform--nav'>
            <nav role='navigation'>
              <ul className='jk-menu-main clearfix'>
                {menuItems}
              </ul>
            </nav>
          </div>
        </div>
      </div>);

    return (
      <div className={props.wrapperClass ? props.wrapperClass : 'stickyMenu'}>
        <Sticky
          innerZ={1000}
          activeClass='sticky'
          enabled={props.fixed === '1' ? true : false}>
          {liHtml}
        </Sticky>
        <div className='clear' />
      </div>
    );
  }
}

export default StickyMenu;
