/**
 * shared Image component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {getApiMediaUrl, getAgavaUrl} from '../utils/mediaHelpers';
import {isAbsolutePath} from '../utils/Helpers';

/* global data*/

class Image extends Component {
  static propTypes = {
    image: PropTypes.string,
    className: PropTypes.string,
    visual: PropTypes.string,
    width: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    height: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    source: PropTypes.number,
    alt: PropTypes.string,
    handleLoad: PropTypes.func,
    handleError: PropTypes.func,
    rieltors: PropTypes.bool,
    error: PropTypes.bool
  };

  static defaultProps = {
    visual: 'photos',
    width: 640,
    height: 480,
  };

  constructor(props) {
    super(props);
    this.state = {
      source: props.source ? props.source : data.options.mediaSource,
      hasError: this.props.error || false
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.image !== this.props.image) {
      this.setState(() => ({
        hasError: false
      }));
    }
  }

  get imageSrc() {
    const {image} = this.props;
    const {source} = this.state;
    const imagePath = isAbsolutePath(image) ? image : this.getSrcSource(source);

    return imagePath;
  }

  getSrcSource = (source) => {
    const {visual, width, height, rieltors} = this.props;
    const imageType = visual !== 'layout' && visual !== 'photo' ?
      visual : (visual === 'layout' ? 'layouts' : 'photos');
    let {image} = this.props;

    if (image === '0' || image === null && !rieltors) {
      image = source ?
        getApiMediaUrl('content', 'no_photo', 'photos.png', source) :
        getAgavaUrl(width, height, 'photos', 1, 1, 0, 'no_photo');
    }else if(rieltors) {
      image = '//cdn-media.etagi.com/static/site/b/b3/' +
      'b37e8fcd5147472ad4672754cd6a3c8be8616690.png';
    }else {
      image = source ?
        getApiMediaUrl(`${width}${height}`, imageType, image, source) :
        getAgavaUrl(width, height, imageType, 1, 1, 1, image);
    }

    return image;
  }

  handleLoadError() {
    this.setState(() => ({
      hasError: true
    }));
  }

  render() {
    const {className, alt} = this.props;
    const handleLoad = this.props.handleLoad;
    const handleError = this.props.handleError ?
      this.props.handleError : this.handleLoadError.bind(this);

    return (
      <img className={className}
           src={!this.state.hasError ?
            this.imageSrc : 'http://cdn-media.etagi.com/content/no_photo/photos.png'}
           onLoad={handleLoad ? handleLoad : () => {}}
           onError={handleError ? handleError : () => {}}
        alt={alt || ''} ref='image'/>
    );
  }

}

export default Image;
