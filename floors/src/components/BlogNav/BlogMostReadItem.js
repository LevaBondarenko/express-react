/**
 * Blog most read object component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {cutText} from '../../utils/Helpers';

class BlogMostReadItem extends Component {
  static propTypes = {
    postData: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      postData: {
        thumbnail_src: thumbnailPhoto,
        post_title: title,
        post_name: postName,
        post_date_gmt: postDate
      }
    } = this.props;
    const thumb = `https://cdn-media.etagi.com/100100/media${thumbnailPhoto}`;
    const moment = require('moment');

    moment.locale('ru');

    let shortTitle = cutText(title, 30);
    let localPostDate  = moment.utc(postDate).toDate();

    shortTitle = shortTitle[1] ? `${shortTitle[0]} ...` : shortTitle[0];
    localPostDate = moment(localPostDate).format('LL');

    return (
      <div>
        <a href={postName} target='_blank'>
          <div className='blog--nav--mostRead'>
            <div className='blog--nav--item--img'>
              <span className='image-helper'></span>
              <img className='img-responsive' src={thumb}/>
            </div>
            <div className='blog--nav--item--description'>
              <div className='blog--nav--item--text'>
                {shortTitle}
              </div>
              <div className='blog--nav--item--date'>
                {localPostDate}
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }
}

export default BlogMostReadItem;