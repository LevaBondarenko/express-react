/**
 * Blog comments component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, map, find, cloneDeep, remove, reverse} from 'lodash';
import BlogCommentField from '../BlogComments/BlogCommentField';
import BlogCommentItem from '../BlogComments/BlogCommentItem';

/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import bs from '../../stores/BlogStore';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setComment} from '../../actionCreators/ObjectsActions';


class BlogComments extends Component {
  static propTypes = {
    actions: PropTypes.object, // temp. to make it work with redux
    blogpost: PropTypes.object,
    noticeEmail: PropTypes.string,
    posts: PropTypes.array,
    premoderation: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      commentParent: 0,
      isLoading: true,
      isAuthorized: false,
      publishDisabled: true
    };
  }

  componentDidMount() {
    bs.onChange(this.onChange);
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    const uStore = userStore.get('userInfo');
    const posts = size(this.props.posts) ? this.props.posts :
     bs.get('posts') || [];
    const isLoading = bs.get('isLoading');
    const commentParent = bs.get('commentParent');
    const isAuthorized = userStore.get('isAuthorized');

    this.setState({
      posts: posts,
      userInfo: uStore,
      isLoading: isLoading,
      isAuthorized: isAuthorized,
      commentParent: commentParent
    });
  }

  mapComment = (commentsArr) => {
    const {isAuthorized} = this.state;
    const preMod = this.props.premoderation ? this.props.premoderation : '1';
    const defaultUserPic = 'https://cdn-media.etagi.com/static/site/7/79/795a5f03f2b23189897e8955a3e9d4dab84a2e4f.png';
    const mappedItems = map(commentsArr, (value, key) => {
      const firstComment = key || parseInt(value.comment_parent) ?
       false : true;
      const childrenComments = value.children ?
       this.mapComment(value.children) : null;

      return (
        <BlogCommentItem
          comment={value}
          likesCount={
            this.props.blogpost.comments[value.comment_ID].likes_count
          } // temp. to make it work with redux
          likesUsers={
            this.props.blogpost.comments[value.comment_ID].likes_users
          } // temp. to make it work with redux
          firstComment={firstComment}
          isAuthorized={isAuthorized}
          defaultUserPic={defaultUserPic}
          children={childrenComments}
          premoderation={preMod}
          {...this.state}
          key={key}/>
      );
    });

    return mappedItems;
  }

  getCommentItems = () => {
    // let {comments} = size(this.state.posts) ?
    //  cloneDeep(this.state.posts[0]) : '';
    let comments = size(this.props.blogpost) ?
      Object.values(cloneDeep(this.props.blogpost.comments)) :
      '';
    let i = size(comments);

    while (i > 0) {
      i--;

      const comParent = parseInt(comments[i].comment_parent);

      if(comParent) {
        const parentEl = find(comments, {'comment_ID': comParent.toString()});

        if(parentEl.children) {
          parentEl.children.unshift(comments[i]);
        } else {
          parentEl.children = [comments[i]];
        }
        comments[i] = null;
      }
    }
    comments = remove(comments, null);
    reverse(comments);

    const commentItem = size(comments) ? this.mapComment(comments) : null;

    return commentItem;
  }

  render() {
    const {/*posts, */isLoading} = this.state;
    const {noticeEmail} = this.props;
    const defaultUserPic = 'https://cdn-media.etagi.com/static/site/7/79/795a5f03f2b23189897e8955a3e9d4dab84a2e4f.png';
    // const currentPost = posts && posts[0] ? posts[0] : null;
    const currentPost = this.props.blogpost;
    // const commentCount = !isLoading && size(posts) ?
    //  posts[0].comment_count : null;
    const commentCount = !isLoading ? this.props.blogpost.comment_count : null;
    const preMod = this.props.premoderation ? this.props.premoderation : '1';
    // const commentItems = this.getCommentItems();
    const commentItems = isLoading ? null : this.getCommentItems();

    return (
      <div className='comments'>
        <p className='comments--header'>
          {parseInt(commentCount) ?
            (<span>
              <span>Комментарии: </span>
              <span className='comments--header--counter'>
                {commentCount}
              </span>
            </span>) :
            'Прокомментируйте первыми:)'
          }
        </p>
        <br />
        <BlogCommentField post={currentPost} premoderation={preMod}
         defaultUserPic={defaultUserPic} commentPost={true}
         noticeEmail={noticeEmail} actions={this.props.actions} // temp. 'actions' to make it work with redux
         {...this.state}/>
        <br />
        <div>
          {commentItems}
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
  dispatch => { // temp. to make it work with redux
    return {
      actions: bindActionCreators({setComment}, dispatch)
    };
  }
)(BlogComments);
