/**
 * Blog subscribe component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import ReactCssTransitionGroup from 'react-addons-css-transition-group';

import BlogSubscribeForm from '../BlogSubscribe/BlogSubscribeForm';
import BlogSubscribeConfirm from '../BlogSubscribe/BlogSubscribeConfirm';

import bs from '../../stores/BlogStore';
import BlogActions from '../../actions/BlogActions';


class BlogSubscribe extends Component {
  static propTypes = {
    formPosition: PropTypes.string,
    confirmEmailPath: PropTypes.string,
    confirmEmailTemplate: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    bs.onChange(this.onChange);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
  }

  handleSubscribe = (alreadySubscribed = false) => {
    if(alreadySubscribed) {
      BlogActions.set('haveBeenSubscribed', true);
    } else {
      BlogActions.set('subscribed', true);
    }
    this.setState({
      transitionEnd: false
    });
  }

  handleTransitionEnd = () => {
    this.setState({
      transitionEnd: true
    });
  }

  onChange = () => {
    this.setState({
      isLoading: bs.get('isLoading'),
      subscribed: bs.get('subscribed'),
      alreadySubscribed: bs.get('haveBeenSubscribed')
    });
  }

  render() {
    const {
      isLoading,
      subscribed,
      transitionEnd,
      alreadySubscribed
    } = this.state;
    const fPos = this.props.formPosition ? this.props.formPosition : 'side';
    const subscribeClass = `blog--subscribe--${fPos}`;
    const subscribeClassName = classNames({
      [subscribeClass]: true,
      hidden: isLoading
    });
    const message = alreadySubscribed ?
     'Вы уже подписаны на этот блог' :
      'Вам на почту было отправлено письмо с подтверждением подписки';

    return (
      <ReactCssTransitionGroup
       transitionName='blogsubstr'
       transitionEnter={true}
       transitionLeave={true}
       transitionEnterTimeout={2000}
       transitionLeaveTimeout={2000}
       component='div'>
        {!subscribed && !alreadySubscribed ?
          <BlogSubscribeForm
           subscribeClassName={subscribeClassName}
           handleTransitionEnd={this.handleTransitionEnd}
           handleSubscribe={this.handleSubscribe}
           {...this.props}/> : null
        }
        {(subscribed || alreadySubscribed) && transitionEnd ?
          <BlogSubscribeConfirm
           subscribeClassName={subscribeClassName}
           subscribeClass={subscribeClass}
           message={message}/> : null
        }
      </ReactCssTransitionGroup>
    );
  }
}

export default BlogSubscribe;
