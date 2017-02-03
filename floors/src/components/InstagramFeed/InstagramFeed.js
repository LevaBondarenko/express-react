/**
 * JobSeekerProfile Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import {getFromBack} from '../../utils/requestHelpers';
import {map} from 'lodash';
import Slider from 'react-slick';
import PrevArrow from './PrevArrow';
import NextArrow from './NextArrow';
import Modal from 'react-bootstrap/lib/Modal';
import GeminiScrollbar from 'react-gemini-scrollbar';
import classNames from 'classnames';

@withCondition()
class InstagramFeed extends Component {

  static propTypes = {
    token: React.PropTypes.string,
    imgCount: React.PropTypes.string
  }

  static defaultProps = {
    imgCount: '6'
  }

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      slideSize: window.innerWidth / props.imgCount,
      showModal: false
    };
  }

  componentDidMount() {
    getFromBack({
      token: this.props.token,
      action: 'get_insta_feed'
    }, 'post').then(response => {
      if (response.success) {
        window.addEventListener('resize', this.handleResize);
        this.setState(() => ({
          images: response.images,
          loaded: true,
          currentPost: response.images[0],
          userData: response.userData
        }));
      }
    });
  }

  componentDidUpdate() {
    if (this.state.animateModal) {
      setTimeout(() => {
        this.setState(() => ({
          animateModal: false,
          currentPost: this.state.currentPostTmp
        }));
      }, 200);
    }
  }

  handleResize = () => {
    const slideSize = window.innerWidth / this.props.imgCount;

    this.setState(() => ({
      slideSize: slideSize
    }));
  }

  toggleModal() {
    const e = arguments[1];

    if (e) {
      e.preventDefault();
    }

    this.setState(() => ({
      showModal: !this.state.showModal,
      currentPost: arguments[0]
    }));
  }

  nextPost(e) {
    e.preventDefault();
    const {images} = this.state;
    const currentIndex = images.indexOf(this.state.currentPost);
    let currentPost;

    if (currentIndex < (images.length - 1)) {
      currentPost = images[currentIndex + 1];
    } else {
      currentPost = images[0];
    }

    this.setState(() => ({
      currentPostTmp: currentPost,
      animateModal: true
    }));
  }

  prevPost(e) {
    e.preventDefault();
    const {images} = this.state;
    const currentIndex = images.indexOf(this.state.currentPost);
    let currentPost;

    if (currentIndex > 0) {
      currentPost = images[currentIndex - 1];
    } else {
      currentPost = images[images.length - 1];
    }

    this.setState(() => ({
      currentPostTmp: currentPost,
      animateModal: true
    }));
  }


  render() {

    if (!this.state.loaded) {
      return (
        <div className="instagramFeed_loaderWrapper">
          <div className="loader-inner ball-clip-rotate">
            <div />
          </div>
        </div>
      );
    }

    const {images, slideSize, currentPost, userData} = this.state;
    const settings = {
      className: 'instagramFeed_slider',
      infinite: true,
      speed: 500,
      slidesToShow: this.props.imgCount,
      slidesToScroll: 1,
      swipe: true,
      autoplay: false,
      swipeToSlide: true,
      arrows: true,
      draggable: false,
      prevArrow: <PrevArrow />,
      nextArrow: <NextArrow />
    };
    const slides = map(images, (img, key) => {
      return (
        <div key={key} style={{
          height: 'auto',
          width: slideSize
        }}>
          <a href="#"
             onClick={this.toggleModal.bind(this, img)}>
            <img src={img.image} alt=""/>
          </a>
        </div>
      );
    });
    const ModalBody = Modal.Body;
    const ModalHeader = Modal.Header;
    const modalClasses = classNames({
      'instagramModalPost': true,
      'animating': this.state.animateModal
    });

    return (
      <div className="instagramFeed">
        <Slider {...settings}>
          {slides}
        </Slider>
        <Modal show={this.state.showModal}
               className={modalClasses}
               onHide={this.toggleModal.bind(this, currentPost)}>
          <ModalHeader closeButton />
          <ModalBody>
            <div className="instagramModalPost_image">
              <img src={currentPost.image} alt=""/>
            </div>
            <div className="instagramModalPost_text">
              <div className="instagramModalPost_header">
                <div className="instagramModalPost_logo">
                  <img src={userData.profile_picture} alt=""/>
                </div>
                <div className="instagramModalPost_username">
                  <a href={`https://instagram.com/${userData.username}`}
                     target="_blank"
                  >
                    {userData.username}
                  </a>
                </div>
              </div>
              <div className="instagramModalPost_caption">
                <GeminiScrollbar>
                  {currentPost.caption ? (
                    currentPost.caption.text
                  ) : ''}
                </GeminiScrollbar>
              </div>
              <div className="instagramModalPost_footer">
                <a      href={currentPost.link}
                        className="instagramModalPost_follow"
                        target="_blank"
                >
                  Подписаться
                </a>
              </div>
              <a href="#"
                 onClick={this.nextPost.bind(this)}
                 className="instagramModalPost_nextPost" />
              <a href="#"
                 onClick={this.prevPost.bind(this)}
                 className="instagramModalPost_prevPost" />
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default InstagramFeed;
