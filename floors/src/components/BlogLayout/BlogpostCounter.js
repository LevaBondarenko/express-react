/**
 * Blogpost views/comments counter component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';

class BlogpostCounter extends Component {
  static propTypes = {
    views: PropTypes.string,
    comments: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {views, comments} = this.props;
    const show = parseInt(views) || parseInt(comments) ? true : false;
    const counterClassName = classNames({
      postCounter: true,
      hidden: !show
    });

    return (
      <div className='blog-inline-block'>
        <div className={counterClassName}>
          <span>
            <i className="fa fa-eye"/> {views}
          </span>
          <span>
            <i className="fa fa-comments"/> {comments ? comments : '0'}
          </span>
        </div>
      </div>
    );
  }
}

export default BlogpostCounter;