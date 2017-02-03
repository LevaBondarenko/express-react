/**
 * Blog commentform component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
import classNames from 'classnames';
import Button from 'react-bootstrap/lib/Button';

import UserActions from '../../actions/UserActions';
import userStore from '../../stores/UserStore';
import BlogActions from '../../actions/BlogActions';
import bs from '../../stores/BlogStore';
import WidgetsActions from '../../actions/WidgetsActions';

import request from 'superagent';


class BlogCommentField extends Component {
  static propTypes = {
    actions: PropTypes.object,
    noticeEmail: PropTypes.string,
    post: PropTypes.object,
    userInfo: PropTypes.object,
    isAuthorized: PropTypes.bool,
    isLoading: PropTypes.bool,
    commentParent: PropTypes.number,
    publishDisabled: PropTypes.bool,
    defaultUserPic: PropTypes.string,
    commentPost: PropTypes.bool,
    premoderation: PropTypes.string
  };
  /* global data */
  constructor(props) {
    super(props);
    this.state = {
      inputNameValue: '',
      inputValue: '',
      publishDisabled: this.props.publishDisabled,
      nameOK: false,
      commentOK: false,
      commentParent: this.props.commentParent,
      isAuthorized: false
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
    const isAuthorized = userStore.get('isAuthorized');
    const userInfo = userStore.get('userInfo');
    const {inputValue, inputNameValue} = this.state;

    if(!isAuthorized) {
      this.setState({
        publishDisabled: true
      });
    } else if(((userInfo && userInfo.i && userInfo.i !== 'Пользователь') ||
     (inputNameValue && size(inputNameValue > 2))) && inputValue) {
      this.setState({
        publishDisabled: false
      });
    }
  }

  escapeHtml = (string) => {
    return String(string).replace(/[&<>"'\/#]/g, (s) => {
      const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&Sapostr;', // eslint-disable-line quotes
        '/': '&#x2F;',
        '#': '&Srsh;'
      };

      return entityMap[s];
    });
  }

  handleAClick = () => {
    UserActions.showLogin();
  }

  handleSClick = () => {
    UserActions.showRegister();
  }

  handleNameChange = (event) => {
    const {commentOK} = this.state;

    this.setState({
      inputNameValue: size(event.target.value) > 2 &&
       event.target.value !== 'Пользователь' ? event.target.value : '',
      publishDisabled: size(event.target.value) > 2 &&
       event.target.value !== 'Пользователь' && commentOK ? false : true,
      nameOK: size(event.target.value) > 2 &&
       event.target.value !== 'Пользователь' ? true : false
    });
  }

  handleCommentChange = (event) => {
    const {userInfo} = this.props;
    const nameOK = userInfo && userInfo.i && userInfo.i !== 'Пользователь' ?
     true : this.state.nameOK;

    this.setState({
      inputValue: event.target.value,
      publishDisabled: size(event.target.value) && nameOK ? false : true,
      commentOK: size(event.target.value) ? true : false
    });
  }

  handleSubmit = () => {
    const {cityId} = data.options;
    const {cities} = data.collections;
    const {id, origin} = data.blog.blogpost;
    const {inputValue, inputNameValue} = this.state;
    const {
      commentParent,
      commentPost,
      noticeEmail,
      userInfo,
      userInfo: {
        i: userNm,
        id: userId,
        photo: userLKPhoto
      }
    } = this.props;
    const userPh = size(userLKPhoto) ? userLKPhoto : this.props.defaultUserPic;
    const comParent = commentPost ? 0 : commentParent;
    const comText = this.escapeHtml(inputValue);
    const preMod = parseInt(this.props.premoderation) ? 0 : 1;
    let userName = userNm;

    if(userInfo && (!size(userInfo.i) || userInfo.i === 'Пользователь')) {
      UserActions.updateUser({i: inputNameValue});
      userName = inputNameValue;
    }
    // BlogActions.setBlogInfo(userId, origin, id, comText,
    //  comParent, userName, userPh, cityId, preMod);
    this.props.actions.setComment(userId, origin, id, comText, comParent,
     userName, userPh, cityId, preMod); // preMod values switched - 1 -> no moderation, 0 -> moderation
    this.refs.commentTextbox.value = '';
    this.setState({
      inputValue: '',
      publishDisabled: true,
      commentOK: false
    });
    if(!preMod) {
      WidgetsActions.set('notify',[{
        msg: 'Спасибо! Ваш комментарий отправлен на модерацию.',
        type: 'info'
      }]);

      if (noticeEmail) {
        request
          .post('/backend/')
          .send({
            action: 'send_newcomment_notice',
            city: cities ? `города ${cities[cityId].name}` : '',
            email: noticeEmail
          })
          .set({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          })
          .end();
      }
    }
    BlogActions.getBlogInfo(origin, id); // temp. delete after migration to redux
  }

  render() {
    const {post, userInfo, isAuthorized, isLoading,
     defaultUserPic} = this.props;
    const {publishDisabled} = this.state;
    const userPic = isAuthorized && size(userInfo) && size(userInfo.photo) ?
     userInfo.photo : defaultUserPic;

    const authInvitation = (<a className='commentsName--identify'
     onClick={this.handleAClick}>авторизуйтесь</a>);
    const signInInvitation = (<a className='commentsName--identify'
     onClick={this.handleSClick}>зарегистрируйтесь</a>);
    const inputLKName =
      (<input type='input'
        onChange={this.handleNameChange}
        className='commentsName--input'
        placeholder='| Введите свое имя, чтобы оставить комментарий'/>);

    const idntInvitation = (<span>Пожалуйста, {authInvitation} или {signInInvitation}, чтобы оставить комментарий.</span>); // eslint-disable-line max-len

    const userLKName = !isAuthorized ? idntInvitation :
     (size(userInfo) && size(userInfo.i) && userInfo.i !== 'Пользователь' ?
      userInfo.i : inputLKName);
    const nameClassName = classNames({
      commentsName: true,
      nameStyle: size(userInfo) && userInfo.i === userLKName ? true : false
    });
    const buttonClassName = classNames({
      publishButton: true,
      disabledButton: publishDisabled
    });

    const input = !isLoading && size(post) &&
     post.comment_status === 'open' ?
      (<textarea type='input'
        ref='commentTextbox'
        onChange={this.handleCommentChange}
        className='comment--input--textarea'
        value={this.state.inputValue}
        placeholder='Введите свой комментарий'/>) :
      (<textarea type='input'
        disabled='disabled'
        placeholder='Комментарии к данной записи отключены'/>);

    return (
      <div className='comments--wrapper'>
        <div>
          <div className='comments--avatar'>
            <img className='img-circle' src={userPic}></img>
          </div>
          <div className={nameClassName}>
            {userLKName}
          </div>
        </div>
        <div className='comments--commentfield'>
          <div className='comments--commentfield--input'>
            {input}
          </div>
          <div className='comments--commentfield--button'>
            <Button
              ref='publishButton'
              bsStyle='link'
              className={buttonClassName}
              disabled={publishDisabled}
              onClick={this.handleSubmit}>
              Опубликовать
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default BlogCommentField;