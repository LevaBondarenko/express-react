/**
 * Blog title component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, forEach} from 'lodash';
import {cutText} from '../../utils/Helpers';

import bs from '../../stores/BlogStore';

// import prefetch from 'react-wildcat-prefetch';


/* global data */
// @prefetch(() => Promise.resolve(data.blog.blogpost))
class BlogTitle extends Component {
  static propTypes = {
    bgImage: PropTypes.string,
    categories: PropTypes.object,
    defaultAdditionalText: PropTypes.string,
    defaultHeaderText: PropTypes.string,
    posts: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  componentWillMount() {
    const {bgImage, defaultAdditionalText, defaultHeaderText} = this.props;
    const actualImage = bgImage ? bgImage : (data.blog && data.blog.blogpost &&
      data.blog.blogpost.id && data.blog.blogpost.origin ?
        '//cdn-media.etagi.com/static/site/f/f1/f1658f8712cbb1210609c71ea1e243c1641e91c3.png' : // eslint-disable-line max-len
        '//cdn-media.etagi.com/static/site/6/6c/6cfb04233dcf2935dde7ceb153b2b26096d3c219.png'); // eslint-disable-line max-len

    this.setState({
      actualImage: actualImage,
      defaultAdditionalText: defaultAdditionalText,
      defaultHeaderText: defaultHeaderText
    });
  }

  componentDidMount() {
    bs.onChange(this.onChange);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
  }

  onChange = () => {
    const posts = size(this.props.posts) ? this.props.posts :
     bs.get('posts') || [];
    const categories = size(this.props.categories) ? this.props.categories :
     bs.get('categories') || [];

    this.setState({
      posts: posts,
      categories: categories,
      isLoading: bs.get('isLoading')
    });
  }

  render() {
    const {
      actualImage,
      categories,
      defaultAdditionalText,
      defaultHeaderText,
      isLoading,
      posts
    } = this.state;
    const blogHeaderStyle = {
      backgroundImage: `url(${actualImage})`,
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat'
    };
    let title = data.blog && data.blog.blogpost ? data.blog.blogpost.title : '';
    let additionalInfo = '';

    if (!isLoading && data.blog && data.blog.category) {
      forEach(categories, (categoryData, name) => {
        if (categoryData.tr_name === data.blog.category) {
          title = name;
          additionalInfo = categoryData.description;
        }
      });
      title = cutText(title, 25);
      title[0] += title[1] ? ' ...' : '';
      title = title[0];
      additionalInfo = cutText(additionalInfo, 110);
      additionalInfo[0] += additionalInfo[1] ? ' ...' : '';
      additionalInfo = additionalInfo[0];
    }
    if (!isLoading && size(posts) && data.blog &&
     data.blog.id && data.blog.origin) {
      title = posts[0].post_title;
      additionalInfo = posts[0].post_author;
      title = cutText(title, 130);
      title[0] += title[1] ? ' ...' : '';
      title = title[0];
      additionalInfo = cutText(additionalInfo, 75);
      additionalInfo[0] += additionalInfo[1] ? ' ...' : '';
      additionalInfo = additionalInfo[0];
    }

    if (!isLoading && !title && !additionalInfo) {
      title = defaultHeaderText ? defaultHeaderText : 'Блог компании';
      additionalInfo = defaultAdditionalText ? defaultAdditionalText :
       'Новости рынка недвижимости и советы';
    }

    return (
      <div className="blog-wrapper" style={blogHeaderStyle}>
        <img className='blog__hidden' src={actualImage} />
        {(data.blog && data.blog.blogpost ?
          <div>
            <div className="blog-postheader-text">
              <h1>
                <b>{title}</b><br />
                {size(additionalInfo) ? (<span className="blog-post-text">
                <i className="fa fa-user"/> Автор: {additionalInfo}</span>) :
                 null}
              </h1>
            </div>
          </div> :
          <div className="blog-text">
            <h1>
              <b>{title}</b><br /><span className="blog-text--additional">
              <b>{additionalInfo}</b></span>
            </h1>
          </div>
        )}
      </div>
    );
  }

}

export default BlogTitle;
