/**
 * Media Slider component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, union, clone, includes} from 'lodash';
import mediaHelpers from '../../utils/mediaHelpers';
import classNames from 'classnames';
import Swiper from 'swiper';
import CheckBoxSelect from '../../shared/CheckBoxSelect';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';

/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import Rating from '../../shared/Rating';

/*global data*/

import withCondition from '../../decorators/withCondition';

@withCondition()
class MediaSlider extends Component {

  constructor(props) {
    super(props);
    let activeView;
    const controlsOverlay = parseInt(props.controlsOverlay);
    const {layouts, photos, tours, videos} = data.object.media;
    const seasons = ['winter', 'spring', 'summer', 'autumn'];
    const initialFilter = [];
    let curSeason;

    this.geoInfo = {
      la: data.object.info.la_pan,
      lo: data.object.info.lo_pan,
      angle: data.object.info.angle
    };
    this.media = clone(data.object.media);
    //check for 3dlayouts
    const layouts2d = []; const layouts3d = [];

    for(const i in layouts) {
      if(layouts[i]) {
        if(layouts[i].kind === '3dlayout') {
          layouts3d.push(layouts[i]);
        } else {
          layouts2d.push(layouts[i]);
        }
      }
    }
    this.media.layouts = layouts2d;
    this.media.layouts3d = layouts3d;
    //additional check for main_photo
    if(data.object.info.main_photo &&
      data.object.info.main_photo !== '0') {
      let mainPhotoIdx = -1;

      for(const i in photos) {
        if(photos[i] &&
          photos[i].filename === data.object.info.main_photo) {
          mainPhotoIdx = i;
        }
      }
      if(mainPhotoIdx > 0) {
        this.media.photos = union([photos[mainPhotoIdx]], photos);
      }
    }
    //adding extraSlide from props to photos
    if(props.extraSlide) {
      const extraSlide = {
        filename: props.extraSlide,
        season: null,
        kind: null
      };

      if(this.media.photos) {
        this.media.photos.push(extraSlide);
      } else {
        this.media.photos = [extraSlide];
      }
    }
    if(parseInt(props.show_photo) && photos && photos.length !== 0) {
      activeView = 'photos';
    } else if(parseInt(props.show_tour) && tours && tours.length !== 0) {
      activeView = 'tours';
    } else if(parseInt(props.show_layout) && layouts && layouts.length !== 0) {
      activeView = 'layouts';
    } else if(parseInt(props.show_video) && videos && videos.length !== 0) {
      activeView = 'videos';
    } else if(parseInt(props.show_street) &&
              this.geoInfo.la !== undefined &&
              this.geoInfo.lo !== undefined) {
      activeView = 'districts';
    } else {
      activeView = 'blank';
    }
    const width = document.getElementById(props.mountNode).offsetWidth;

    this.thumbsCount = Math.floor((width - 176) / 84) - 2;
    this.initSwiper.bind(this);
    this.destroySwiper.bind(this);
    this.initStreetView.bind(this);
    this.getFilter.bind(this);
    this.filterView.bind(this);
    const seasonCollection = this.getFilter(activeView, 'season');

    if(props.filtering === '1') {
      curSeason = seasons[Math.floor((new Date()).getMonth() / 3) % 4];
      if(includes(map(seasonCollection, 'id'), curSeason)) {
        initialFilter.push(curSeason);
      }
      if(includes(map(seasonCollection, 'id'), 'undef')) {
        initialFilter.push('undef');
      }
    }
    this.state = {
      activeIndex: 0,
      activeView: activeView,
      width: width,
      height: (Math.floor(width * 10.5 / 16) + (controlsOverlay ? 0 : 102)),
      isFullscreen: false,
      collectionSeason: seasonCollection,
      collectionKind: this.getFilter(activeView, 'kind'),
      filterSeason: initialFilter,
      filterKind: [],
      filteredMedia: this.filterView(activeView, 'season', initialFilter)
    };
  }

  initStreetView() {
    if(window.google && window.google.maps) {
      if(this.msPanorama) {
        this.msPanorama.setVisible(true);
      } else {
        this.msPanorama = new window.google.maps.StreetViewPanorama(
            document.getElementById('street-view'),
          {
            position: {
              lat: parseFloat(this.geoInfo.la),
              lng: parseFloat(this.geoInfo.lo)
            },
            pov: {
              heading: this.geoInfo.angle ?
                parseFloat(this.geoInfo.angle) : 0,
              pitch: 0
            },
            zoom: 1,
            addressControl: false,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_TOP
            },
            panControlOptions: {
              position: window.google.maps.ControlPosition.TOP_RIGHT
            }
          });
      }
    }
  }

  initSwiper() {
    const preSelector = this.state.isFullscreen ?
      '.slider-ms-fullscreen ' : '.slider-ms ';

    this.msPanorama && this.msPanorama.setVisible(false);
    this.galleryTop = new Swiper(`${preSelector}.gallery-top`, {
      lazyLoading: this.state.activeView === 'tours',
      preloadImages: false,
      simulateTouch: false,
      keyboardControl: this.state.isFullscreen,
      spaceBetween: 10,
      slidePerView: 1,
      loop: this.showControls,
      loopedSlides: this.showControls ? this.state.filteredMedia.length : 0,
      loopAdditionalSlides: 0,
      nextButton: `${preSelector}.button-fs-right`,
      prevButton: `${preSelector}.button-fs-left`,
      onSlideChangeEnd: () => {this.slideChange();},
      onInit: () => {this.slideChange();}
    });
    if(!this.state.isFullscreen) {
      this.galleryThumbs = new Swiper(`${preSelector}.gallery-thumbs`, {
        preloadImages: false,
        autoplay: this.autoPlay ? 4000 : 0,
        keyboardControl: true,
        spaceBetween: 10,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: this.showControls,
        loopedSlides: this.showControls ? this.state.filteredMedia.length : 0,
        loopAdditionalSlides: 0,
        slideToClickedSlide: true,
        nextButton: `${preSelector}.button-right`,
        prevButton: `${preSelector}.button-left`
      });
      this.galleryTop.params.control = this.galleryThumbs;
      this.galleryThumbs.params.control = this.galleryTop;
      this.autoPlay && this.galleryThumbs.startAutoplay();
      this.galleryThumbs.update(true);
    }
    this.galleryTop.update(true);
    this.state.activeIndex &&
      this.galleryTop.slideTo(this.state.activeIndex);
  }

  destroySwiper() {
    if(this.galleryTop) {
      this.galleryTop.destroy && this.galleryTop.destroy(true, false);
      this.galleryTop = null;
    }
    if(this.galleryThumbs) {
      this.galleryThumbs.destroy && this.galleryThumbs.destroy(true, false);
      this.galleryThumbs = null;
    }
  }

  getFilter(view, type) {
    let filter = {undef: 0};
    const aMedia = this.media[view];
    const dict = {
      season: {
        autumn: 'осень',
        spring: 'весна',
        winter: 'зима',
        summer: 'лето',
        undef: 'внесезонные'
      },
      kind: {
        photo: 'фото',
        fasad: 'фасад',
        wide: 'вид из окна',
        porch: 'подъезд',
        areal: 'двор',
        map: 'карта',
        conf: 'конфиденциально',
        undef: 'остальные'
      }
    };

    for(const i in aMedia) {
      if(aMedia[i]) {
        if(aMedia[i][type]) {
          if(filter[aMedia[i][type]]) {
            filter[aMedia[i][type]]++;
          } else {
            filter[aMedia[i][type]] = 1;
          }
        } else {
          filter['undef']++;
        }
      }
    }
    if(!filter.undef) {
      delete filter.undef;
    }
    filter = map(filter, (item, key) => {
      return {
        id: key,
        name: `${(dict[type][key] !== undefined ? dict[type][key] : key)} (${item})` //eslint-disable-line max-len
      };
    });

    return filter;
  }

  filterView(view, type, values) {
    const filtered = [], aMedia = this.media[view];

    if(values && values.length) {
      for(const i in aMedia) {
        if(aMedia[i]) {
          if(includes(values, aMedia[i][type]) ||
            (aMedia[i][type] === null && includes(values, 'undef'))) {
            filtered.push(aMedia[i]);
          }
        }
      }
      return filtered;
    } else {
      return aMedia;
    }
  }


  componentDidMount() {
    const activeView = this.state.activeView;

    if(activeView === 'districts') {
      this.initStreetView();
    } else if(activeView === 'photos' ||
      activeView === 'layouts' ||
      activeView === 'tours' ||
      activeView === 'videos') {
      this.initSwiper();
    }
  }

  componentDidUpdate() {
    const activeView = this.state.activeView;

    if(activeView === 'districts') {
      this.initStreetView();
    } else if(activeView === 'photos' ||
      activeView === 'layouts' ||
      activeView === 'tours' ||
      activeView === 'videos') {
      setTimeout(() => { this.initSwiper(); }, 0);
    }
  }

  slideChange() {
    const pager = document.getElementById('ms-pager-count');
    const length =
      this.state.filteredMedia ? this.state.filteredMedia.length : 0;
    let activeIndex = this.galleryTop ? this.galleryTop.activeIndex + 1 : 1;

    while(activeIndex > length && length > 0) {
      activeIndex -= length;
    }
    pager && (pager.textContent = activeIndex);
  }

  handleSwitch(e) {
    e.target.dataset.view !== this.state.activeView && this.setState({
      activeIndex: 0,
      activeView: e.target.dataset.view,
      collectionSeason: this.getFilter(e.target.dataset.view, 'season'),
      collectionKind: this.getFilter(e.target.dataset.view, 'kind'),
      filterSeason: [],
      filterKind: [],
      filteredMedia: this.filterView(e.target.dataset.view, 'season', [])
    });
  }

  toggleFullscreen() {
    const isFullscreen = !this.state.isFullscreen;
    const controlsOverlay = parseInt(this.props.controlsOverlay);

    ReactDOM.findDOMNode(this.refs.buttonFullscreen).blur();
    this.msPanorama && this.msPanorama.setVisible(false);
    delete this.msPanorama;

    const width = isFullscreen ?
      Math.floor(document.body.clientWidth - 340) :
      document.getElementById(this.props.mountNode).offsetWidth;
    const height = isFullscreen ?
        Math.floor(document.body.clientHeight - 56) :
        (Math.floor(width * 10.5 / 16) + (controlsOverlay ? 0 : 102));

    this.setState({
      activeIndex: this.galleryThumbs && this.galleryThumbs.activeIndex > 0 ?
        this.galleryThumbs.activeIndex : 0,
      isFullscreen: isFullscreen,
      width: width,
      height: height
    });
  }

  close() {
    const width = document.getElementById(this.props.mountNode).offsetWidth;
    const controlsOverlay = parseInt(this.props.controlsOverlay);

    this.msPanorama && this.msPanorama.setVisible(false);
    delete this.msPanorama;
    this.setState({
      activeIndex: this.galleryThumbs && this.galleryThumbs.activeIndex > 0 ?
        this.galleryThumbs.activeIndex : 0,
      isFullscreen: false,
      width: width,
      height: (Math.floor(width * 10.5 / 16) + (controlsOverlay ? 0 : 102))
    });
  }

  filterChanged(e) {
    const s = e.filter === 'filterSeason' ?
      {filter: 'filterKind', values: []} :
      {filter: 'filterSeason', values: []};

    this.setState(() => ({
      [e.filter]: e.values,
      [s.filter]: s.values,
      filteredMedia: this.filterView(this.state.activeView,
        e.filter.slice(6).toLowerCase(), e.values)
    }));
  }

  onImageLoadError(e) {
    const source = parseInt(this.props.mediaSource);
    const noPhotoSrc = (source ?
      mediaHelpers.getApiMediaUrl(
        'content',
        'no_photo',
        'photos.png',
        source) :
      mediaHelpers.getAgavaUrl(
        this.state.width,
        this.state.height,
        this.state.activeView,
        1,
        0,
        0,
        'no_photo'));

    if(e.target.src.split(':')[1] !== noPhotoSrc) {
      e.target.src = noPhotoSrc;
      e.target.style.width = '100%';
      e.target.style.height = '90%';
      e.target.parentNode.style.background = 'none';
    }
  }

  onThumbLoadError(e) {
    const p = e.target.parentNode;

    p.className = `${p.className} image-error`;
  }

  render() {
    const {photos, layouts, layouts3d, tours, videos} = this.media;
    const {filteredMedia, activeView, isFullscreen} = this.state;
    const geoInfo = this.geoInfo, props = this.props;
    const controlsOverlay = parseInt(this.props.controlsOverlay);
    const fs = this.props.fullscreen === '1';
    const sliderClass = isFullscreen ? 'slider-ms-fullscreen' : 'slider-ms';
    let slider, slides, thumbs;
    let source = parseInt(this.props.mediaSource);
    let modalContent, mainContent;

    if(source < 0) {
      source = data.options.mediaSource;
    }
    const backClass = (!this.state.isFullscreen && !controlsOverlay) ||
      ((activeView === 'tours' || activeView === 'videos') &&
      !this.state.isFullscreen);

    this.destroySwiper();
    this.showControls = filteredMedia &&
      filteredMedia.length > this.thumbsCount;
    const seasonFilter = this.state.collectionSeason.length < 2 ? '' : (
      <div className='filter'>
        <CheckBoxSelect
          onChange={this.filterChanged.bind(this)}
          name='filterSeason'
          label='Сезон'
          width='230px'
          collection={this.state.collectionSeason}
          selection={this.state.filterSeason}
        />
      </div>
    );
    const kindFilter = this.state.collectionKind.length < 2 ? '' : (
      <div className='filter'>
        <CheckBoxSelect
          onChange={this.filterChanged.bind(this)}
          name='filterKind'
          label='Тип фото'
          width='230px'
          collection={this.state.collectionKind}
          selection={this.state.filterKind}
        />
      </div>
    );
    const filter = this.props.filtering === '1' && activeView !== 'districts' &&
      (this.state.collectionKind.length > 1 ||
        this.state.collectionSeason.length > 1) ? (
          <div
            className='filter-panel'
            style={{width: `${this.state.width}px`}}>
            <div className={
              classNames('backgroundFilter', {'white-back': backClass})
            } />
            {seasonFilter}
            {kindFilter}
          </div>
        ) : '';
    const modeSwitcher =
      (<div className='control-mode-ms'>
        {parseInt(props.show_photo) && photos && photos.length !== 0 ?
          <button
            data-view='photos'
            className={activeView === 'photos' ? 'active' : ''}
            onClick={this.handleSwitch.bind(this)}>
            {`Фотографии (${photos.length})`}
          </button> :
          ''
        }
        {parseInt(props.show_tour) && tours && tours.length !== 0 ?
          <button
            data-view='tours'
            className={activeView === 'tours' ? 'active' : ''}
            onClick={this.handleSwitch.bind(this)}>
            {`3D-тур (${tours.length})`}
          </button> :
          ''
        }
        {parseInt(props.show_layout) && layouts && layouts.length !== 0 ?
          <button
            data-view='layouts'
            className={activeView === 'layouts' ? 'active' : ''}
            onClick={this.handleSwitch.bind(this)}>
            {`Планировки (${layouts.length})`}
          </button> :
          ''
        }
        {parseInt(props.show_3dlayout) && layouts3d && layouts3d.length !== 0 ?
          <button
            data-view='layouts3d'
            className={activeView === 'layouts3d' ? 'active' : ''}
            onClick={this.handleSwitch.bind(this)}>
            3D-планировка
          </button> :
          ''
        }
        {parseInt(props.show_video) && videos && videos.length !== 0 ?
          <button
            data-view='videos'
            className={activeView === 'videos' ? 'active' : ''}
            onClick={this.handleSwitch.bind(this)}>
            {`Видео (${videos.length})`}
          </button> :
          ''
        }
        {parseInt(props.show_street) && geoInfo &&
          geoInfo.la !== undefined && geoInfo.lo != undefined &&
          geoInfo.la !== null && geoInfo.lo !== null &&
          parseFloat(geoInfo.la) > 0 && parseFloat(geoInfo.lo) > 0 ?
            <button
              data-view='districts'
              className={activeView === 'districts' ? 'active' : ''}
              onClick={this.handleSwitch.bind(this)}>
              Виды района
            </button> :
          ''
        }
        {data.object.info.ratings && !this.state.isFullscreen ? (
          <Rating id={data.object.info.object_id}
            content={data.object.info.ratings}
            context={this.props.context}
            className="ms"
            condition={data.options.minRating}
            show={parseInt(this.props.ratings)}/>
        ) : null}
      </div>);


    if(activeView === 'photos' || activeView === 'layouts') {
      this.autoPlay = true;
      slides = map(filteredMedia, (slide, key) => {

        const urlImg = (slide.filename.indexOf('https:') === 0 ||
          slide.filename.indexOf('http:') === 0) ? slide.filename :
          (source ?
            mediaHelpers.getApiMediaUrl(
              isFullscreen ? '12801024' : '1024768',
              activeView,
              slide.filename,
              source) :
            mediaHelpers.getAgavaUrl(
              this.state.width,
              this.state.height,
              activeView,
              1,
              0,
              1,
              slide.filename));

        return (
          <div
            key={activeView + key}
            className='swiper-slide'>
            <div className='loader' />
            <img
              src={urlImg}
              onError={this.onImageLoadError.bind(this)}/>
          </div>
        );
      });

      thumbs = isFullscreen ? <div /> : map(filteredMedia, (slide, key) => {

        const urlImg = (slide.filename.indexOf('https:') === 0 ||
          slide.filename.indexOf('http:') === 0) ? slide.filename :
          (source ?
            mediaHelpers.getApiMediaUrl(
              '100100',
              activeView,
              slide.filename,
              source) :
            mediaHelpers.getAgavaUrl(66, 66, activeView,
              1, 1, 0, slide.filename));

        return (
          <div
            key={`thumb${activeView}${key}`}
            className='swiper-slide'>
            <img
              src={urlImg}
              onError={this.onThumbLoadError.bind(this)} />
            <span className='thumb-background'>&nbsp;</span>
            <span style={{background: 'none'}}>{key + 1}</span>
          </div>
        );
      });
      slider =
        (<div className={sliderClass}
          style={{
            height: `${(this.state.height - ((!isFullscreen || controlsOverlay || filter === '') ? 0 : 56))}px`, //eslint-disable-line max-len
            width: `${this.state.width}px`,
            top: (controlsOverlay || filter === '') ? 0 : '56px'
          }}>
          <div data-id={this.props.id}
            style={{height: (controlsOverlay || isFullscreen) ? '100%' :
              `${(this.state.height) - 102}px`}}
            className="swiper-container gallery-top">
            <div className="swiper-wrapper">
              {slides}
            </div>
          </div>
          <div data-id={this.props.id}
            className="swiper-container gallery-thumbs"
            style={{
              width:
                `${(this.state.width - (isFullscreen || !fs ? 202 : 360))}px`
            }}>
            <div className="swiper-wrapper">
              {thumbs}
            </div>
          </div>
          {isFullscreen ? null : <div className={
            classNames('backgroundSlider', {'white-back': backClass})
          } />}
          <div
            id={`swnext${this.props.id}`}
            className={isFullscreen ? 'button-fs-right' : 'button-right'}
            style={isFullscreen ?
              {} : {
                display: thumbs.length > 1 ? 'block' : 'none',
                right: `${(isFullscreen || !fs ? 18 : 176)}px`
              }}/>
          <div
            id={`swprev${this.props.id}`}
            className={isFullscreen ? 'button-fs-left' : 'button-left'}
            style={isFullscreen ?
              {} : {display: thumbs.length > 1 ? 'block' : 'none'}}/>
          <button
            ref='buttonFullscreen'
            style={{display: isFullscreen || !fs ? 'none' : 'block'}}
            className={
              classNames('ms-fullscreen-button', {'white-back': backClass})
            }
            onClick={this.toggleFullscreen.bind(this)}>
              <Glyphicon glyph='resize-full'/><span> На весь экран</span>
          </button>
        </div>);
    } else if(activeView === 'tours') {
      this.autoPlay = false;
      slides = map(filteredMedia, (slide, key) => {
        const urlSwf = source ?
          mediaHelpers.getApiMediaUrl(
            'content',
            slide.kind === 'html5' ? '3d_tours_new' : '3d_tours',
            slide.filename) :
          `https://ries3.etagi.com/3d_tours/${mediaHelpers.getFilename(slide.filename)}`;
        const tourHeight =
          this.state.isFullscreen ? this.state.height : this.state.height - 102;

        return (
          <div
            key={activeView + key}
            className='swiper-slide'>
            <div className='loader' />
            {slide.kind === 'html5' ?
              (<iframe
                height={tourHeight}
                width={this.state.width}
                src={urlSwf}
              />) :
              (<object
                classID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
                codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"
                width={this.state.width}
                height={tourHeight}>
                  <param name="movie" value={urlSwf} />
                  <param name="quality" value="high" />
                  <param name="menu" value="true" />
                  <param name="allowfullscreen" value="true" />
                  <param name="wmode" value="transparent" />
                  <embed
                    src={urlSwf}
                    wmode="transparent"
                    quality="high"
                    menu="false"
                    pluginspage="https://www.macromedia.com/go/getflashplayer"
                    type="application/x-shockwave-flash"
                    width={this.state.width}
                    height={tourHeight} />
              </object>)
            }
          </div>
        );
      });

      thumbs = isFullscreen ? <div /> :  map(filteredMedia, (slide, key) => {
        const urlImg = slide.filename2 ? (source ?
          mediaHelpers.getApiMediaUrl(
            '100100',
            '3d_tours',
            slide.filename2,
            source) :
          `https://ries3.etagi.com/3d_tours/${mediaHelpers.getFilename(slide.filename2)}`) : ''; //eslint-disable-line max-len

        return (
          <div
            key={`thumb${activeView}${key}`}
            className='swiper-slide'>
            <img
              src={urlImg}
              onError={this.onThumbLoadError.bind(this)} />
            <span className='thumb-background'>&nbsp;</span>
            <span>{key + 1}</span>
          </div>
        );
      });
      slider = (
        <div className={sliderClass}
          style={{
            height: `${(this.state.height - ((!isFullscreen || controlsOverlay || filter === '') ? 0 : 56))}px`, //eslint-disable-line max-len
            width: `${this.state.width}px`,
            top: (controlsOverlay || filter === '') ? 0 : '56px'
          }}>
          <div data-id={this.props.id}
            className="swiper-container gallery-top">
            <div className="swiper-wrapper">
              {slides}
            </div>
          </div>
          <div data-id={this.props.id}
            className="swiper-container gallery-thumbs"
            style={{
              width:
                `${(this.state.width - (isFullscreen || !fs ? 202 : 360))}px`
            }}>
            <div className="swiper-wrapper">
              {thumbs}
            </div>
          </div>
          {isFullscreen ? null : <div className={
            classNames('backgroundSlider', {'white-back': backClass})
          } />}
          <div
            id={`swnext${this.props.id}`}
            className={isFullscreen ? 'button-fs-right' : 'button-right'}
            style={isFullscreen ?
              {} : {
                display: thumbs.length > 1 ? 'block' : 'none',
                right: `${(isFullscreen || !fs ? 18 : 176)}px`
              }}/>
          <div
            id={`swprev${this.props.id}`}
            className={isFullscreen ? 'button-fs-left' : 'button-left'}
            style={isFullscreen ?
              {} : {display: thumbs.length > 1 ? 'block' : 'none'}}/>
          <button
            ref='buttonFullscreen'
            style={{display: isFullscreen || !fs ? 'none' : 'block'}}
            className={
              classNames('ms-fullscreen-button', {'white-back': backClass})
            }
            onClick={this.toggleFullscreen.bind(this)}>
            <Glyphicon glyph='resize-full'/><span> На весь экран</span>
          </button>
        </div>
      );
    } else if(activeView === 'layouts3d') {
      const oid = layouts3d[0].object_id;
      const user = userStore.get();
      const hash = user.isAuthorized ? user.userInfo.authHash : '';
      const src = `${window.location.protocol}//model.etagi.com/Viewer/index?obj_id=${oid}&hash=${hash}`; //eslint-disable-line max-len

      slider = (
        <div className={sliderClass}
          style={{
            background: 'none',
            height: `${this.state.height}px`,
            width: `${this.state.width}px`
          }}>
          <iframe
            id='frm'
            height='100%'
            width='100%'
            src={src}/>
        </div>
      );
    } else if(activeView === 'videos') {
      this.autoPlay = false;
      slides = map(filteredMedia, (slide, key) => {
        const urlVideo =
          `//video.etagi.com/embed/${slide['ries_id']}/?full=1`;
        const videoHeight =
          this.state.isFullscreen ? this.state.height : this.state.height - 102;

        return (
            <div key={activeView + key} className='swiper-slide'>
              <iframe width={this.state.width} height={videoHeight}
                src={urlVideo} />
            </div>
        );
      });

      thumbs = map(this.media[activeView], (slide, key) => {
        return (
          <div
            key={`thumb${activeView}${key}`}
            className='swiper-slide'>
            <div className='thumb-video'
              style={{width: '100%', height: '100%'}}/>
            <span className='thumb-background'>&nbsp;</span>
            <span style={{background: 'none'}}>{key + 1}</span>
          </div>
        );
      });
      slider =
        (<div className={sliderClass}
          style={{
            height: `${(this.state.height - ((!isFullscreen || controlsOverlay || filter === '') ? 0 : 56))}px`, //eslint-disable-line max-len
            width: `${this.state.width}px`,
            top: (controlsOverlay || filter === '') ? 0 : '56px'
          }}>
          <div data-id={this.props.id}
            className="swiper-container gallery-top">
            <div className="swiper-wrapper">
              {slides}
            </div>
          </div>
          <div data-id={this.props.id}
            className="swiper-container gallery-thumbs"
            style={{
              width:
                `${(this.state.width - (isFullscreen || !fs ? 202 : 360))}px`
            }}>
            <div className="swiper-wrapper">
              {thumbs}
            </div>
          </div>
          {isFullscreen ? null : <div className={
            classNames('backgroundSlider', {'white-back': backClass})
          } />}
          <div
            id={`swnext${this.props.id}`}
            className="button-right"
            style={{
              display: thumbs.length > 1 ? 'block' : 'none',
              right: `${(isFullscreen && !fs ? 18 : 176)}px`
            }}/>
          <div
            id={`swprev${this.props.id}`}
            className="button-left"
            style={{display: thumbs.length > 1 ? 'block' : 'none'}}/>
          <button
            ref='buttonFullscreen'
            style={{display: isFullscreen || !fs ? 'none' : 'block'}}
            className={
              classNames('ms-fullscreen-button', {'white-back': backClass})
            }
            onClick={this.toggleFullscreen.bind(this)}>
              <Glyphicon glyph='resize-full'/><span> На весь экран</span>
          </button>
        </div>);
    } else if(activeView === 'districts' || activeView === 'blank') {
      slider =
        (<div className={sliderClass}
          style={{
            background: 'none',
            height: `${this.state.height}px`,
            width: `${this.state.width}px`,
            zIndex: -2
          }}
        >
        </div>);
    }

    if(isFullscreen) {
      modalContent =
        (<div className='ms-fullscreen-container'>
          {modeSwitcher}
          {filter}
          <div
            id='street-view'
            className='street-view'
            style={{
              height: `${this.state.height}px`,
              width: `${this.state.width}px`,
              opacity: activeView === 'districts' ? 1 : 0
            }}
          />
          {slider}
          <div
            className='ms-pager'
            style={{
              bottom: (controlsOverlay || filter === '') ? '6px' : '-50px',
              display: (activeView === 'photos' || activeView === 'layouts') ?
                'block' : 'none'
            }}>
            <span id='ms-pager-count'/>
            <span>{` / ${(filteredMedia ? filteredMedia.length : 0)}`}</span>
          </div>
          <span
            className='fullscreen-close'
            onClick={this.close.bind(this)}>&times;</span>
          <div className="clear" />
        </div>);
      mainContent =
        (<div id='slider' className="media-slider clearfix">
          <div className="clear" />
          <Modal
            className='ms-fullscreen'
            show={isFullscreen}
            onHide={this.close.bind(this)}
          >
            {modalContent}
          </Modal>
        </div>);
    } else {
      modalContent = <div className='ms-fullscreen-container' />;
      mainContent =
        (<div
          id='slider'
          style={{
            marginBottom: (controlsOverlay || filter === '') ? 0 : '56px'
          }}
          className="media-slider clearfix">
          {modeSwitcher}
          {filter}
          <div
            id='street-view'
            className='street-view'
            style={{height: `${this.state.height}px`}}/>
          {slider}
          <div className="clear" />
          <Modal
            className='ms-fullscreen'
            show={isFullscreen}
            onHide={this.close.bind(this)}
          >
            {modalContent}
          </Modal>
        </div>);
    }

    return mainContent;
  }
}

MediaSlider.propTypes = {
  controlsOverlay: React.PropTypes.string,
  extraSlide: React.PropTypes.string,
  show_photo: React.PropTypes.string, // eslint-disable-line camelcase
  show_tour: React.PropTypes.string, // eslint-disable-line camelcase
  show_layout: React.PropTypes.string, // eslint-disable-line camelcase
  show_3dlayout: React.PropTypes.string, // eslint-disable-line camelcase
  show_street: React.PropTypes.string, // eslint-disable-line camelcase
  show_video: React.PropTypes.string, // eslint-disable-line camelcase
  mediaSource: React.PropTypes.string,
  mountNode: React.PropTypes.string,
  filtering: React.PropTypes.string,
  ratings: React.PropTypes.string,
  fullscreen: React.PropTypes.string,
  ratings: React.PropTypes.string,
  id: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ]).isRequired,
  context: React.PropTypes.shape({
    insertCss: React.PropTypes.func,
  }),
};
MediaSlider.defaultProps = {
  mediaSource: '-1',
  controlsOverlay: '1',
  fullscreen: '0',
  filtering: '0',
  ratings: '1',
  show_video: '0' // eslint-disable-line camelcase
};

export default MediaSlider;
