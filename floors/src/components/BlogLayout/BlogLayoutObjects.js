/**
 * Blog objects wrapper component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, isEqual, map} from 'lodash';
import createFragment from 'react-addons-create-fragment';

import BlogItemTable from '../BlogLayout/BlogItemTable';
import PostsNotFound from '../BlogLayout/PostsNotFound';


class BlogLayoutObjects extends Component {
  static propTypes = {
    posts: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.posts, this.props.posts);
  }

  getObjectItems = () => {
    const {posts} = this.props;

    const objectItems = size(posts) &&
      map(posts, (posts, key) => {
        return (<BlogItemTable
          posts={posts}
          key={key}/>);
      });

    return objectItems;
  };

  render() {
    let objects = this.getObjectItems();

    objects = createFragment({objectItems: (size(objects) > 0 ?
     objects : <PostsNotFound />)});

    return (
      <div>
        {objects}
      </div>
    );
  }
}

export default BlogLayoutObjects;
