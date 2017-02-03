/**
 * Blog navigation object component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class BlogNavItem extends Component {
  static propTypes = {
    items: PropTypes.string,
    categoryData: PropTypes.object
  };
  /* global data */
  constructor(props) {
    super(props);
  }

  render() {
    const {items, categoryData} = this.props;
    const categoryPath = `/news/${categoryData.tr_name}/`;
    const counterStyle = data.blog &&
     data.blog.category === categoryData.tr_name ?
      'blog--nav--count--selected' : 'blog--nav--count';
    const itemStyle = data.blog &&
     data.blog.category === categoryData.tr_name ?
      'blog--nav--item--selected' : 'blog--nav--item';

    return (
      <div className='blog--nav--category' ref={items}>
        <div className={itemStyle}>
          <a href={categoryPath}>
            {items}
          </a>
        </div>
        <div className={counterStyle}>
          <span>
            {categoryData.count}
          </span>
        </div>
      </div>
    );
  }
}

export default BlogNavItem;
