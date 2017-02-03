/**
 * Blog layout component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import UserAgentData from 'fbjs/lib/UserAgentData';
import {size} from 'lodash';

import {scrollTo} from '../../utils/Helpers';
import BlogLayoutView from '../BlogLayout/BlogLayoutView';
import BlogLayoutObjects from '../BlogLayout/BlogLayoutObjects';
import SearchPaging from '../SearchPaging/SearchPaging';

import bs from '../../stores/BlogStore';
import BlogActions from '../../actions/BlogActions';

/*eslint camelcase: [2, {properties: "never"}]*/
class BlogLayout extends Component {
  static propTypes = {
    postQuantity: PropTypes.number,
    posts: PropTypes.array
  };
  /* global data */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      perPage: this.props.postQuantity,
      currentPage: 0,
      offset: 0
    };
  }

  componentWillMount() {
    bs.onChange(this.onChange);
  }

  componentDidMount() {
    if (!data.blog) {
      BlogActions.getBlogInfo();
    } else {
      BlogActions.getBlogInfo(null, null, data.blog.category);
    }
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
  }

  onChange = () => {
    const posts = size(this.props.posts) ? this.props.posts :
     bs.get('posts') || [];

    this.setState({
      posts: posts,
      isLoading: bs.get('isLoading')
    });
  }

  getPostObjects(postObjects) {
    const {posts, offset, perPage} = this.state;
    const postCount = (size(posts) - offset) < perPage ?
     size(posts) - offset : perPage;
    const res = [];

    for(let i = 0; i < postCount; i++) {res.push(postObjects[offset + i]);}

    return res;
  }

  onBlogPageChange = (data) => {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.perPage);
    const element = document.getElementsByClassName('fullHeight')[0];

    this.setState(() => ({
      offset: offset,
      currentPage: selected
    }));
    if(element && element.offsetTop < window.pageYOffset) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
        document.documentElement :
        document.body;

      setTimeout(() => {
        scrollTo(elementTop, element.scrollTop + 380,
         600).then(() => {}, () => {});
      }, 0);
    }
  }

  render() {
    const {isLoading, posts} = this.state;
    const objects = this.getPostObjects(posts);
    const pageNum = size(posts) % this.state.perPage ?
     1 + size(posts) / this.state.perPage | 0 :
      size(posts) / this.state.perPage;

    return (
      <div className='fullHeight' id='blog-layout'>
        {(isLoading ?
          <div
            className="loader-inner ball-clip-rotate searchform--preloader">
            <div />
          </div> :
          <BlogLayoutView>
            <BlogLayoutObjects
             posts={objects} {...this.props}/>
            <SearchPaging
              handlePageClick={this.onBlogPageChange.bind(this)}
              pageNum={pageNum}
              {...this.state}
              layoutMap={false}
              bottom={true}/>
          </BlogLayoutView>
        )}
      </div>
    );
  }

}

export default BlogLayout;
