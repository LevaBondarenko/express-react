/**
 * Blog reading time component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
import BlogpostCounter from '../BlogLayout/BlogpostCounter';
import ReactCssTransitionGroup from 'react-addons-css-transition-group';

import Button from 'react-bootstrap/lib/Button';

import BlogReadLaterForm from '../BlogReading/BlogReadLaterForm';
import BlogReadLaterDone from '../BlogReading/BlogReadLaterDone';

import bs from '../../stores/BlogStore';
import userStore from '../../stores/UserStore';
import wss from '../../stores/WidgetsStateStore';

import {connect} from 'react-redux';


class BlogReadingTime extends Component {
  static propTypes = {
    blogpost: PropTypes.object,
    posts: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      readLater: false,
      transitionEnd: true,
      submitted: false,
      isLoading: true,
      isAuthorized: false,
      readLaterEmlHelp: ''
    };
  }

  componentDidMount() {
    bs.onChange(this.onChange);
    userStore.onChange(this.onChange);

    this.setState({
      wssData: wss.get()
    });
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
    userStore.offChange(this.onChange);
  }

  readLater = (event) => {
    const userInfo = userStore.get('userInfo');
    const userEml = this.state.isAuthorized ? userInfo.email : '';

    this.setState({
      readLater: !this.state.readLater,
      userEml: userEml,
      readLaterEmlHelp: '',
      readLaterState: null
    });

    event.target.blur();
  }

  handleTransitionEnd = () => {
    this.setState({
      transitionEnd: true
    });
  }

  handleSubmit = () => {
    this.setState({
      submitted: true,
      transitionEnd: false
    });
  }

  onChange = () => {
    const posts = size(this.props.posts) ? this.props.posts :
     bs.get('posts') || [];
    const isAuthorized = userStore.get('isAuthorized');

    this.setState({
      posts: posts,
      isLoading: bs.get('isLoading'),
      isAuthorized: isAuthorized
    });
  }

  render() {
    const {
      posts,
      readLater,
      submitted,
      transitionEnd
    } = this.state;
    const readingTime = size(posts) ? posts[0].blogpost_reading_time : null;
    const commentCount = size(posts) ? posts[0].comment_count : '0';
    // const viewsCount = size(posts) && posts[0].views_count ?
    //  posts[0].views_count : '0';
    const viewsCount = this.props.blogpost.views_count ?
      this.props.blogpost.views_count :
      '0';

    return (
      <div className="blogreading-wrapper">
        <div className="postCounter">
          <span><i className="fa fa-clock-o"/>
            <span className="postCounter-text"> Время чтения: </span>
              {readingTime}</span>
            <Button
              onClick={this.readLater}
              className='noTimeToReadButton'>
              {readLater ? 'Прочту сейчас' : 'Нет времени читать?'}
            </Button>
        </div>
        <BlogpostCounter views={viewsCount.toString()}
         comments={commentCount}/>
        <ReactCssTransitionGroup
         transitionName='blogsubstr'
         transitionEnter={true}
         transitionLeave={true}
         transitionEnterTimeout={2000}
         transitionLeaveTimeout={2000}
         component='div'>
          {readLater && !submitted && transitionEnd ?
            <BlogReadLaterForm
             handleTransitionEnd={this.handleTransitionEnd}
             handleSubmit={this.handleSubmit}
             {...this.state}/> : null}
          {readLater && submitted && transitionEnd ?
            <BlogReadLaterDone/> : null}
        </ReactCssTransitionGroup>
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
  }
)(BlogReadingTime);
