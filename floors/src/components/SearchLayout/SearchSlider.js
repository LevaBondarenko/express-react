import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import Image from '../../shared/Image';
import request from 'superagent';
import {size, clone, map} from 'lodash';
import ga from '../../utils/ga';

class SearchSlider extends Component {

  static propTypes = {
    imageProps: PropTypes.object,
    object: PropTypes.object,
    location: PropTypes.string,
    realtyClass: PropTypes.string,
    imageCssClass: PropTypes.string,
    objectId: PropTypes.number,
    media: PropTypes.object
  }

  static defaultProps = {
    imageCssClass: 'searchRealtyItem_image'
  }

  constructor(props) {
    super(props);
    this.state = {
      collectionLoaded: false,
      imageProps: props.imageProps,
      realtyClass: props.realtyClass ? props.realtyClass :
        this.props.object.class,
      objectId: props.objectId ? props.objectId :
        props.object.object_id,
      prevImage: {},
      nextImage: {},
      currentIndex: 0,
      collection: {},
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      collectionLoaded: false,
      imageProps: nextProps.imageProps,
      prevImage: {},
      nextImage: {},
      currentIndex: 0,
      collection: {},
      loading: false
    });
  }

  loadCollection(cb) {
    request
      .get('/msearcher_ajax.php')
      .type('form')
      .query({
        action: 'get_object_media',
        id: this.state.objectId,
        class: this.state.realtyClass,
        type: `${this.props.imageProps.visual}s`
      })
      .end((err, res) => {
        if (!err) {
          const mainPhoto = this.props.imageProps.image;
          const collection = map(res.body, file => {
            return file.replace('/photos/', '');
          });
          const mPhotoIdx = collection.indexOf(mainPhoto);

          collection.splice(mPhotoIdx, 1);
          collection.unshift(mainPhoto);

          this.setState(() => ({
            collection: collection,
            collectionLoaded: true,
          }));
          cb();
        }
      });
  }

  changeImage() {
    if (!this.state.loading) {
      this.setState(() => ({
        loading: true
      }));
    }

    const direction = arguments[0];
    const imageProps = this.state.imageProps;
    const prevImage = clone(this.state.imageProps);
    const nextImage = clone(this.state.imageProps);
    let currentIndex = direction === 'next' ?
      this.state.currentIndex + 1 :
      this.state.currentIndex - 1;

    if (currentIndex === -1) {
      currentIndex = size(this.state.collection) - 1;
    }

    if (currentIndex === size(this.state.collection)) {
      currentIndex = 0;
    }

    if (direction === 'next') {
      ga('button', 'site_photo_search_card_forward');
    } else {
      ga('button', 'site_photo_search_card_backward');
    }

    imageProps['image'] = this.state.collection[currentIndex];
    nextImage['image'] = direction === 'next' ?
      this.state.collection[currentIndex + 1] :
      this.state.collection[currentIndex - 1];
    this.setState(() => ({
      imageProps: imageProps,
      currentIndex: currentIndex,
      prevImage: prevImage,
      nextImage: nextImage
    }));
  }

  handleSlide(event) {
    event.preventDefault();
    const direction = event.target.dataset['direction'];
    const self = this;

    if (!this.state.collectionLoaded) {
      this.loadCollection(() => {
        self.changeImage.call(self, direction);
      });
    } else {
      this.changeImage.call(this, direction);
    }
  }

  handleLoad() {
    setTimeout(() => {
      this.setState(() => ({
        loading: false
      }));
    }, 200);
  }

  render() {
    const media = this.props.media ? this.props.media : this.props.object.media;
    const mediaType = Object.prototype.toString.call(media);
    let photoCount = 1;

    if (mediaType === '[object Object]') {
      photoCount = media[`${this.props.imageProps.visual}s`];
    } else {
      photoCount = JSON.parse(media)[`${this.props.imageProps.visual}s`];
    }

    if (this.state.loading) {
      return (
        <div className={`${this.props.imageCssClass} blurred`}>
          <Image {...this.state.prevImage}
            handleLoad={this.handleLoad.bind(this)}/>
          <div className="searchRealtyItem_loaderWrapper">
            <div className="loader-inner ball-clip-rotate">
              <div />
            </div>
          </div>
          {this.state.nextImage.image ? (
            <div style={{display: 'none'}}>
              <Image {...this.state.nextImage}
                handleLoad={this.handleLoad.bind(this)}/>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className={this.props.imageCssClass}>
        <a href={this.props.location} target='_blank'>
          <Image {...this.state.imageProps}
            handleUpload={this.handleLoad.bind(this)} />
        </a>
        <div className="searchRealtyItem_controls">
          <div className="searchRealtyItem_photoCount">
            {this.state.currentIndex + 1} из {photoCount}
          </div>
          <a href="#"
             onClick={this.handleSlide.bind(this)}
             data-direction="prev"
             className="searchRealtyItem_arr searchRealtyItem_arr__left" />
          <a href="#"
             onClick={this.handleSlide.bind(this)}
             data-direction="next"
             className="searchRealtyItem_arr searchRealtyItem_arr__right" />
        </div>
      </div>
    );
  }

}

export default SearchSlider;
