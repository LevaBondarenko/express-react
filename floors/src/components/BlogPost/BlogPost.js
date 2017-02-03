/**
 * Blogpost component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, some} from 'lodash';
import Modal from 'react-bootstrap/lib/Modal';
import {getCookie, setCookie} from '../../utils/Helpers';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {increasePostViews} from '../../actionCreators/ObjectsActions';

import wss from '../../stores/WidgetsStateStore';
import bs from '../../stores/BlogStore';
import BlogActions from '../../actions/BlogActions';

import SocialButton from '../../shared/SocialButton';

import prefetch from 'react-wildcat-prefetch';

/* global data */
const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;


@prefetch(() => Promise.resolve(data.blog.blogpost))
class BlogPost extends Component {
  static propTypes = {
    actions: PropTypes.object,
    blogpost: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showModal: false
    };
  }

  openModal = (event) => {
    if(event.target.getAttribute('rel') === 'imgmodal') {
      const tagName = event.target.tagName;
      const imageSource = tagName === 'A' ? event.target.getAttribute('href') :
       event.target.getAttribute('src');

      event.preventDefault();
      this.setState({
        showModal: true,
        imageSource: imageSource
      });
    }
  }

  closeModal = () => {
    this.setState({
      showModal: false
    });
  }

  componentDidMount() {
    bs.onChange(this.onChange);
    document.addEventListener('click', this.openModal);

    const {id, origin} = data.blog.blogpost;
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');
    const currentPost = {
      id: id,
      origin: origin
    };
    let visits = getCookie('blogposts_visited') ?
     JSON.parse(getCookie('blogposts_visited')) : false;
    // let increaseViews = true;

    this.setState({
      wssData: wss.get()
    });

    if (!visits) {
      visits = [];
      visits.push(currentPost);
      this.props.actions.increasePostViews(origin, id);
    } else {
      if (!some(visits, currentPost)) {
        visits.push(currentPost);
        this.props.actions.increasePostViews(origin, id);
      // } else {
      //   increaseViews = false;
      }
    }

    setCookie('blogposts_visited', JSON.stringify(visits), {
      domain: cookieDomain,
      expireDays: 30,
      path: '/'
    });

    // BlogActions.getBlogInfo(origin, id, null, increaseViews); // before redux migration
    BlogActions.getBlogInfo(origin, id, null, false);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
    document.removeEventListener('click', this.openModal);
  }

  onChange = () => {
    const posts = bs.get('posts') || [];

    this.setState({
      posts: posts,
      isLoading: bs.get('isLoading')
    });
  }

  render() {
    const {posts, isLoading, wssData, showModal, imageSource} = this.state;
    const {
      facebookSb,
      googleplusSb,
      instagramSb,
      odnoklassnikiSb,
      twitterSb,
      vkontakteSb
    } = data.options.socialNetworks;
    const show = data && data.options && data.options.socialNetworks &&
     (facebookSb || googleplusSb || instagramSb || odnoklassnikiSb ||
     twitterSb || vkontakteSb) ?
      true :
      null;
    const content = !size(posts) || isLoading ?
     (data.blog.blogpost ? data.blog.blogpost.content : null) :
      posts[0].post_content;
    const output = {__html: content};
    const selectedSite = wssData && wssData.selectedCity ?
     wssData.selectedCity.site : null;
    const thumb = !size(posts) || isLoading ? null :
     `https://cdn-media.etagi.com/u520390/media${posts[0].thumbnail_src}`;
    const mock = !size(posts) || isLoading ? null : {
      href: `https://${selectedSite}${posts[0].post_name}`,
      title: posts[0].post_title,
      picture: thumb,
      caption: selectedSite,
      description: posts[0].post_excerpt
    };

    return (
      <div>
        <hr />
        <Modal className='blogmodalform' show={showModal}
         onHide={this.closeModal}>
          <ModalHeader closeButton></ModalHeader>
          <ModalBody>
            <img src={imageSource} />
          </ModalBody>
        </Modal>
        <div dangerouslySetInnerHTML={output} />
        <br />
        <div className='postSocial postFooter'>
          {show ?
            (<div className='socNetwork'>
              <span className="postCounter-text">Поделиться: </span>
              <div className='ico'>
                <SocialButton type='fb' data={mock}/>
                <SocialButton type='vk' data={mock}/>
                <SocialButton type='ok' data={mock}/>
              </div>
            </div>) :
            null
          }
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
      actions: bindActionCreators({increasePostViews}, dispatch)
    };
  }
)(BlogPost);
