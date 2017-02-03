/**
 * Blog comment item component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {includes} from 'lodash';

import BlogCommentField from '../BlogComments/BlogCommentField';

import BlogActions from '../../actions/BlogActions';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setComment, setCommentLike} from '../../actionCreators/ObjectsActions';


class BlogCommentItem extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    firstComment: PropTypes.bool,
    isAuthorized: PropTypes.bool,
    isLoading: PropTypes.bool,
    commentParent: PropTypes.number,
    posts: PropTypes.array,
    defaultUserPic: PropTypes.string,
    userInfo: PropTypes.object,
    publishDisabled: PropTypes.bool,
    children: PropTypes.array,
    premoderation: PropTypes.string,
    likesCount: PropTypes.string,
    likesUsers: PropTypes.array
  };
  /* global data */
  constructor(props) {
    super(props);
  }

  deEscapeHtml = (string) => {
    return String(string).replace(/&#?\w+;/g, (s) => {
      const entityMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&Sapostr;': "'", // eslint-disable-line quotes
        '&#x2F;': '/',
        '&Srsh;': '#'
      };

      return entityMap[s];
    });
  }

  handleAClick = () => {
    UserActions.showLogin();
    WidgetsActions.set('notify',[{
      msg: 'Для того чтобы поставить или снять отметку "Нравится" вы должны быть авторизованы в личном кабинете', // eslint-disable-line max-len
      type: 'info'
    }]);
  }

  likeComment = () => {
    const {comment, userInfo} = this.props;
    const {/*id, */origin} = data.blog.blogpost;

    // BlogActions.setBlogInfo(userInfo.id, origin, id,
    //  parseInt(comment.comment_ID));
    this.props.actions.setCommentLike(userInfo.id, origin,
     parseInt(comment.comment_ID));
  }

  replyComment = () => {
    const {comment} = this.props;

    BlogActions.set('commentParent', parseInt(comment.comment_ID));
  }

  render() {
    const {
      firstComment,
      commentParent,
      posts,
      isAuthorized,
      userInfo,
      comment: {
        user_photo: userPic,
        comment_author: author,
        comment_content: content,
        comment_date_gmt: gmtDate,
        comment_ID: commentID//,
        // likes_count: likesQuantity,
        // likes_users: likesUsers
      },
      likesCount: likesQuantity, // temp. to make it work with redux
      likesUsers: likesUsers // temp. to make it work with redux
    } = this.props;
    const commentReply = commentParent &&
     commentParent === parseInt(commentID) ?
      (<BlogCommentField post={posts[0]} {...this.props}/>) : null;
    const moment = require('moment');

    moment.locale('ru');

    let timePassed  = moment.utc(gmtDate).toDate();
    const likes = likesQuantity;
    const userLiked = isAuthorized && includes(likesUsers, userInfo.id);
    const commentClassName = classNames({
      blogFirstComment: firstComment ? true : false,
      blogComment: firstComment ? false : true
    });
    const likeClassName = classNames({
      commentLiked: userLiked ? true : false
    });
    const commentContent = this.deEscapeHtml(content);

    timePassed = moment(timePassed).fromNow();

    return (
      <div className={commentClassName}>
        {(!firstComment ? <hr /> : null)}
        <div className='comments--avatar'>
          <img className='img-circle' src={userPic}></img>
        </div>
        <div className='comments--comment'>
          <div className='comments--comment--author'>{author}</div>
          <div className='comments--comment--time'>{timePassed}</div>
          <div className='comments--comment--content'>{commentContent}</div>
          <div className='comments--comment--controls'>
            <span className={likeClassName}>
              <i className='fa fa-thumbs-up' aria-hidden='true'
                onClick={isAuthorized ? this.likeComment :
                 this.handleAClick}/>{likes}
            </span>
            <span className='comments--comment--controls--reply'>
              <i className='fa fa-comments'/>
              <a onClick={this.replyComment}>Ответить</a>
            </span>
          </div>
        </div>
        <div className='comments--comment--replyform'>
          {commentReply}
        </div>
        <div className='comments--comment--childs'>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      blogpost: state.objects.get('blog') ?
        state.objects.get('blog').toJS().blogpost :
        {}
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({setComment, setCommentLike}, dispatch) // temp. 'setComment' to make it work with redux
    };
  }
)(BlogCommentItem);
