/**
 * Blog read also object component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import BlogpostCounter from '../BlogLayout/BlogpostCounter';
import classNames from 'classnames';
import Button from 'react-bootstrap/lib/Button';
import {cutText} from '../../utils/Helpers';


class BlogReadAlsoItem extends Component {
  static propTypes = {
    data: PropTypes.object,
    place: PropTypes.number,
    showExcerpt: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      place,
      showExcerpt,
      data: {
        thumbnail_src: thumbnailPhoto,
        post_title: title,
        post_excerpt: excerpt,
        post_name: postName,
        comment_count: commentsQuantity,
        views_count: viewsQuantity
      }
    } = this.props;
    const thumb = `https://cdn-media.etagi.com/u520390/media${thumbnailPhoto}`;
    const placeClassName = classNames({
      readAlsoItem: true,
      readAlsoLeft: !place ? true : false,
      readAlsoRight: place === 2 ? true : false
    });
    let shortTitle = cutText(title, 50);
    let shortExcerpt = cutText(excerpt, 95);

    shortTitle = shortTitle[1] ? `${shortTitle[0]} ...` : shortTitle[0];
    shortExcerpt = shortExcerpt[1] ? `${shortExcerpt[0]} ...` : shortExcerpt[0];

    return (
      <div className={placeClassName}>
        <div className='readAlsoItem--image'>
          <span className='image-helper'/>
          <a href={postName}>
            <img src={thumb}/>
          </a>
        </div>
        <div className='readAlsoItem--title'>
          <a href={postName}>{shortTitle}</a>
        </div>
        {showExcerpt ?
          (<div className='readAlsoItem--excerpt'>
            {shortExcerpt}
          </div>) : null
        }
        <div className='readAlsoItem--infobar'>
          <BlogpostCounter views={viewsQuantity}
            comments={commentsQuantity}/>
          <div className='readAlsoItem--infobar--button'>
            <Button
              bsStyle='link'
              className='publishButton'
              href={postName}>
              Читать дальше
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default BlogReadAlsoItem;