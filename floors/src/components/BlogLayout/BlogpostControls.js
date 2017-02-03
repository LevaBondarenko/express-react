/**
 * Blogpost controls component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import BlogpostCounter from '../BlogLayout/BlogpostCounter';
import SocialButton from '../../shared/SocialButton';
import Button from 'react-bootstrap/lib/Button';

import wss from '../../stores/WidgetsStateStore';


class BlogpostControls extends Component {
  static propTypes = {
    posts: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const posts = this.props.posts;
    const viewsCount = posts.views_count ? posts.views_count : '0';
    const selectedSite = wss.get('selectedCity');
    const thumb = `https://cdn-media.etagi.com/u520390/media${posts.thumbnail_src}`;
    const mock = {
      href: `https://${selectedSite.site}${posts.post_name}`,
      title: posts.post_title,
      picture: thumb,
      caption: selectedSite.site,
      description: posts.post_excerpt
    };

    return (
        <div className='item--description post__controls'>
          <Button
            bsStyle='link'
            className='readMoreButton'
            href={posts.post_name}>
            Читать далее
          </Button>
          <BlogpostCounter views={viewsCount}
            comments={posts.comment_count} />
          <div className='postSocial'>
            <div className='socNetwork'>
              <div className='ico'>
                <SocialButton type='fb' data={mock}/>
                <SocialButton type='vk' data={mock}/>
                <SocialButton type='ok' data={mock}/>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default BlogpostControls;