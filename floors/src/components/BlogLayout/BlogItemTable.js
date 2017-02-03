/**
 * Blogpost object component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import BlogpostPreview from '../BlogLayout/BlogpostPreview';
import BlogpostControls from '../BlogLayout/BlogpostControls';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class BlogItemTable extends Component {
  static propTypes = {
    posts: PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  render() {
    const {
      posts,
      posts: {
        thumbnail_src: thumbnailPhoto,
        post_title: title,
        post_name: postName
      }
    } = this.props;
    const thumb = `https://cdn-media.etagi.com/u520390/media${thumbnailPhoto}`;

    return (
      <Col xs={12}>
        <div className='blog--item clearfix' ref={posts}>
          <Col xs={3}>
            <div className='blog--item--img'>
              <a href={postName}>
                <img className='img-responsive' src={thumb}/>
              </a>
            </div>
          </Col>
          <Col xs={9}>
            <div className="blog--item--wrapper">
              <div className='blog--item--title clearfix'>
                <h3 className='pull-left col-xs-12'>
                  <a href={postName}>
                    {title}
                  </a>
                </h3>
              </div>
              <div className='blog--item--content clearfix'>
                <BlogpostPreview {...this.props}/>
              </div>
            </div>
            <div className="blog--item--controlswrapper">
              <div className='blog--item--content clearfix'>
                <BlogpostControls {...this.props}/>
              </div>
            </div>
          </Col>
        </div>
      </Col>
    );
  }
}

export default BlogItemTable;