/**
 * Blogpost preview component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {cutText} from '../../utils/Helpers';
import {size} from 'lodash';
import createFragment from 'react-addons-create-fragment';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class BlogpostPreview extends Component {
  static propTypes = {
    posts: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {posts} = this.props;
    const shortText = cutText(posts.post_excerpt, 200);
    const postCategoriesLinks = [];
    const postAuthor = posts.post_author ?
     ` / Автор статьи: ${posts.post_author}` : null;
    const moment = require('moment');

    moment.locale('ru');

    let localPostDate  = moment.utc(posts.post_date_gmt).toDate();

    localPostDate = moment(localPostDate).format('LL');

    for (let $i = 0; $i < size(posts.categories); $i++) {
      const categoryPath = `/news/${posts.categories_tr[$i]}/`;

      if ($i === 0) {
        postCategoriesLinks.push(
          <span><a href={categoryPath}>{posts.categories[$i]}</a></span>
        );
      } else {
        postCategoriesLinks.push(
          <span>, <a href={categoryPath}>{posts.categories[$i]}</a></span>
        );
      }
    }

    const postCategories = size(postCategoriesLinks) ?
     createFragment({postCategoriesLinks}) : null;

    return (
      <div>
        <Col xs={12}
          className='item--description post__description clearfix'>
          <Col xs={12} style={{padding: 0}}>
            <div className='postInfo'>
              <p>
                {localPostDate}
                {postCategories ? ' / ' : null}
                {postCategories}
                {postAuthor}
              </p>
            </div>
          </Col>
          <Col xs={12} style={{padding: 0}}>
            {(posts.post_excerpt ?
              <div className='postExcerpt'>
                <p>{createFragment({__html: shortText[0]})} </p>
                {size(shortText[1]) ? <span> ... </span> : null}
              </div> : null)}
          </Col>
        </Col>
      </div>
    );
  }
}

export default BlogpostPreview;