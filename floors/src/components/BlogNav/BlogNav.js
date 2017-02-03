/**
 * Blog navigation component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, cloneDeep} from 'lodash';
import createFragment from 'react-addons-create-fragment';
import BlogNavItem from '../BlogNav/BlogNavItem';
import BlogMostReadItem from '../BlogNav/BlogMostReadItem';

/**
 * React/Flux entities
 */
import bs from '../../stores/BlogStore';

class BlogNav extends Component {
  static propTypes = {
    categoriesBlock: PropTypes.string,
    mostReadBlock: PropTypes.string,
    stickyModule: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      navWdgtOffset: false,
      navWdgtRangeOffset: 0,
      offset: 0,
      isLoading: true
    };
  }

  componentDidMount() {
    bs.onChange(this.onChange);
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);

    this.setState({
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    });
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }

  onChange = () => {
    this.setState({
      isLoading: bs.get('isLoading')
    });
  }

  getMostReadObjectItems = () => {
    let outputList = cloneDeep(bs.get('posts'));
    let j, i;
    let swapped = false;

    for (j = 0; j < size(outputList) - 1; j++) { // Сортируем
      swapped = false;
      i = 0;
      while (i < size(outputList) - 1) {
        if (parseInt(outputList[i].views_count) <
         parseInt(outputList[i + 1].views_count)) {
          const tempH = outputList[i];

          outputList[i] = outputList[i + 1];
          outputList[i + 1] = tempH;
          swapped = true;
        }
        ++i;
      }
      if (!swapped) {
        break;
      }
    }
    outputList = outputList.slice(0, 3);

    const objectItems = size(outputList) &&
      map(outputList, (postData) => {
        return (<BlogMostReadItem postData={postData}/>);
      });

    return objectItems;
  }

  getObjectItems = () => {
    const outputList = bs.get('categories');
    const objectItems = size(outputList) &&
      map(outputList, (categoryData, name) => {
        return (<BlogNavItem items={name} categoryData={categoryData}/>);
      });

    return objectItems;
  }

  handleResize = () => {
    this.setState({
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    });

    this.handleScroll();
  }

  smallNavScroll = () => {
    const navWdgt = document.getElementById('blog-navigation');
    const layoutWdgt = document.getElementById('blog-layout');
    const {
      bottom: navWdgtBottom,
      top: navWdgtTop
    } = navWdgt.getBoundingClientRect();
    const {bottom: layoutWdgtBottom} = layoutWdgt.getBoundingClientRect();
    const {navWdgtOffset} = this.state;
    const currentOffset = window.pageYOffset ?
      window.pageYOffset :
      document.documentElement.scrollTop;

    if (navWdgt.className === '') {
      if (navWdgtTop < 30) {
        navWdgt.className = 'fixed';

        this.setState({
          navWdgtOffset: window.pageYOffset
        });
      }
    }
    if (navWdgt.className === 'fixed') {
      if (currentOffset + 30  < navWdgtOffset) {
        navWdgt.className = '';
      }
      if (navWdgtBottom >
       layoutWdgtBottom - 80) {
        navWdgt.className = 'fixed-bottom';
      }
    }
    if (navWdgt.className === 'fixed-bottom') {
      if (navWdgtTop > 15) {
        navWdgt.className = 'fixed';
      }
    }
  }

  largeNavScroll = (navWdgtHeight) => {
    const navWdgt = document.getElementById('blog-navigation');
    const layoutWdgt = document.getElementById('blog-layout');
    const {
      bottom: navWdgtBottom,
      top: navWdgtTop
    } = navWdgt.getBoundingClientRect();
    const {bottom: layoutWdgtBottom} = layoutWdgt.getBoundingClientRect();
    const {
      navWdgtOffset,
      offset,
      windowHeight,
    } = this.state;
    const currentOffset = window.pageYOffset ?
      window.pageYOffset :
      document.documentElement.scrollTop;

    if (!navWdgt.className && !navWdgtOffset) {
      if (navWdgtTop < 30) {
        this.setState({
          navWdgtOffset: window.pageYOffset
        });
      }
    }
    if (navWdgtBottom + 20 < windowHeight &&
     navWdgt.className !== 'fixed-bottom') {
      navWdgt.className = 'fixed-down';

      this.setState({
        navWdgtRangeOffset: 0
      });
    }
    if (navWdgt.className === 'fixed-down' ||
     navWdgt.className === 'fixed') {
      if (currentOffset + 30  < navWdgtOffset) {
        navWdgt.className = '';

        this.setState({
          navWdgtOffset: false
        });
      }
      if (navWdgtBottom >
       layoutWdgtBottom - 60) {
        navWdgt.className = 'fixed-bottom';
      }
    }
    if (navWdgt.className !== '') {
      if (navWdgtTop > 14) {
        navWdgt.className = 'fixed';

        this.setState({
          navWdgtRangeOffset: 0
        });
      }
    }
    if (navWdgtOffset && navWdgt.className !== 'fixed-bottom') {
      if (navWdgt.className === 'fixed-down' && currentOffset < offset) {
        navWdgt.className = 'fixed-range';
        this.setState({
          navWdgtRangeOffset: offset - navWdgtOffset -
           (navWdgtHeight - 40 - windowHeight)
        });
      }
      if (navWdgt.className === 'fixed' && currentOffset > offset) {
        navWdgt.className = 'fixed-range';
        this.setState({
          navWdgtRangeOffset: offset - navWdgtOffset + 50
        });
      }
    }

    this.setState({
      offset: currentOffset
    });
  }

  handleScroll = () => {
    const navWdgt = document.getElementById('blog-navigation');
    const layoutWdgt = document.getElementById('blog-layout');
    const {
      height: navWdgtHeight,
    } = navWdgt.getBoundingClientRect();
    const stickyWdgt = this.props.stickyModule === '0' ?
      false :
      true;
    const {
      windowHeight,
      windowWidth
    } = this.state;

    if (windowWidth < 1350 ||
     navWdgt.offsetHeight + 150 > layoutWdgt.offsetHeight ||
     !stickyWdgt || !window.XMLHttpRequest) {
      navWdgt.className = '';
    } else {
      if (navWdgtHeight < windowHeight) {
        this.smallNavScroll();
      } else {
        this.largeNavScroll(navWdgtHeight);
      }
    }
  }

  render() {
    const {isLoading, navWdgtRangeOffset} = this.state;
    let objects = this.getObjectItems();
    let mostReadObjects = this.getMostReadObjectItems();

    objects = createFragment({objectItems: (size(objects) ?
     objects : <p>Нет доступа к данным. Попробуйте позже.</p>)});
    mostReadObjects = createFragment({objectItems: (size(mostReadObjects) ?
     mostReadObjects : <p>Нет доступа к данным. Попробуйте позже.</p>)});

    return (
      <div
       id='blog-navigation'
       style={navWdgtRangeOffset ? {top: navWdgtRangeOffset} : null}>
        {(isLoading ?
          <div
            className='loader-inner ball-clip-rotate searchform--preloader'>
            <div />
          </div> :
          <div className='blog--nav'>
            {(this.props.categoriesBlock === '1' ?
             <div>
              <h3 className='blog--nav--catLink'>
                <a href='/news/'>
                  <b>ВСЕ СТАТЬИ</b>
                </a>
              </h3>
              {objects}
             </div> : null
            )}
            {(this.props.mostReadBlock === '1' ?
             <div>
              <h3><b>САМОЕ ЧИТАЕМОЕ</b></h3>
              {mostReadObjects}
             </div> : null
            )}
          </div>
        )}
      </div>
    );
  }
}

export default BlogNav;
