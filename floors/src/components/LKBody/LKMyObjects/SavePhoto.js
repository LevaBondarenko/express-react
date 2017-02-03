/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import {loadImage} from '../../../utils/requestHelpers';
import api from '../../../api/apiLK';
//import CheckButton from '../../../shared/CheckButton';
import {filter, toArray, map, union, size, isEmpty} from 'lodash';
import Image from '../../../shared/Image';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import WidgetsActions from '../../../actions/WidgetsActions';
import ga from '../../../utils/ga';

class SavePhoto extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    type: PropTypes.string,
    item: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      drag: false,
      photos: this.preparePhotos(props),
      isLoading: false
    };
  }

  preparePhotos(props) {
    const photos = props.item ? map(props.item[props.type], item => {
      return {id: item.id, filename: item.file ? item.file : item.filename};
    }) : [];

    return photos;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({photos: this.preparePhotos(nextProps)}));
  }

  handleLoad = (event) => {
    const {type} = this.props;
    const input = document.getElementById(type);

    input.click();
    event.preventDefault();
  };

  onDrop = (event) => {
    const {photos} = this.state;
    const {handleChange, type} = this.props;
    let files = event.dataTransfer ?
      event.dataTransfer.files : event.target.files;

    files = toArray(files);
    files = filter(files, file => {
      return file.type === 'image/png' ||
        file.type === 'image/jpeg' || file.type === 'image/webp' ?
          file : false;
    });
    if (isEmpty(files)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка загрузки фото, необходимо изображение в формате jpg, gif, png.', // eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      const tasks = [], uploads = [];

      map(files, file => {
        tasks.push(loadImage(file));
      });
      this.setState({
        isLoading: true
      });

      switch (type) {
      case 'photos':
        ga('upload', 'lk_myobjects_add_zagruzit_foto');
        break;
      case 'layouts':
        ga('upload', 'lk_myobjects_add_zagrusit_planirovky');
        break;
      default: null;

      }

      Promise.all(tasks).then(response => {
        map(response, file => {
          uploads.push(api.uploadMedia(file.file, file.result, `m_${type}`));
        });
        Promise.all(uploads).then(response => {
          if(response) {
            this.setState({
              photos: toArray(union(photos, response)),
              isLoading: false
            });
            handleChange(false, {
              field: type,
              type: 'textarea',
              value: toArray(union(photos, response))
            }, true);
            WidgetsActions.set('notify',[{
              msg: type === 'photos' ? 'Фотографии загружены.' : 'Планировки загружены.', // eslint-disable-line max-len
              type: 'info'
            }]);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка загрузки фото, если ошибка повторяется - обратитесь в службу поддержки', // eslint-disable-line max-len
              type: 'dang'
            }]);
          }
        }, error => {
          WidgetsActions.set('notify',[{
            msg: `Ошибка загрузки фото (${error.err}), если ошибка повторяется - обратитесь в службу поддержки`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        });
      });
    }

    event.preventDefault();
  };

  allowDrop = (event) => {
    event.preventDefault();
  };

  onDragEnter = () => {
    this.setState(() => ({drag: true}));
  }

  onDragLeave = () => {
    this.setState(() => ({drag: false}));
  }

  toggleButton = () => {
    //console.log(event.target);
  };

  handleRemove = (event) => {
    let {photos} = this.state;
    const {itemkey} = event.target.dataset;
    const {handleChange, type} = this.props;

    photos = filter(photos, (photo, key) => {
      return key !== parseInt(itemkey) ? photo : false;
    });

    this.setState({
      photos: photos
    });

    handleChange(false, {
      field: type,
      type: 'textarea',
      value: photos
    }, true);

  };

  getPhotos = () => {
    const {photos} = this.state;
    const {type} = this.props;
    const content = photos && photos.map((item, key) => {
      const imageProps = {
        image: item.filename,
        visual: type,
        width: 160,
        height: 160
      };

      return (
        <Col xs={3} key={key}>
          <div className='photoItem'>
            <div className='photoItem--img'>
              <Image className='img-responsive' {...imageProps}/>
            </div>
            <div className='photoItem--control clearfix'>
              <div className='photoItem--control__main'>
                <div className="msearcher">
                  <div className='msearcher--checkbox clearfix'>
                  </div>
                </div>
              </div>
              <div className='photoItem--control__remove'>
                <i onClick={this.handleRemove} data-itemkey={key}
                  className='fa fa-trash'></i>
              </div>
            </div>
          </div>
        </Col>
      );
    });

    return content;
  };

  get getDropTitle() {
    const {type} = this.props;
    const content = type === 'photos' ? (
      <span className='dropzone-title clearfix'>
        <i className='drop-icon' />
        <span className='dropzone-title__text'>
          Перетащите сюда фотографии или<br/>
          выберите файл с компьютера</span>
      </span>
    ) : (
      <span className='dropzone-title clearfix'>
        <i className='drop-layout' />
        <span className='dropzone-title__text'>
          Перетащите сюда планировку или<br/>
          выберите файл с компьютера</span>
      </span>
    );

    return content;
  };

  get savedMargin() {
    const {photos} = this.state;

    return size(photos) > 0 ? {marginTop: '34px'} : {marginTop: '0px'};
  }

  get reverseSavedMargin() {
    const {photos} = this.state;

    return size(photos) > 0 ? {marginTop: '0px'} : {marginTop: '34px'};
  }

  render() {
    const {type} = this.props;
    const {isLoading} = this.state;

    return(
      <div>
        <input type='file' id={type}
          accept=".jpg,.jpeg,.gif,.png"
          multiple={true}
          className='hidden'
          onChange={this.onDrop}/>
        <div className='lkbody-addPhoto-dropzone'>
          <div className='dropzone-target'
            onClick={this.handleLoad}
            onDrop={this.onDrop}
            onDragOver={this.allowDrop}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave} />
          {this.getDropTitle}
        </div>
        <div className='lkbody-addPhoto-loaded' style={this.savedMargin}>
          <Row>
            <Col xs={10}>
              <Row>
                {this.getPhotos()}
              </Row>
            </Col>
            <Col xs={2} className='text-center lk-loading'>
            {(isLoading ?
              <i className='fa fa-spinner fa-spin fa-2x'
                style={this.reverseSavedMargin}/> : false)}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default SavePhoto;
