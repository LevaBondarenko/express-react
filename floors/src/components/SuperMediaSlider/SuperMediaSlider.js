/**
 * Super Media Slider component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*global data*/
/*eslint camelcase: [2, {properties: "never"}]*/

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, size, map, union, difference, includes, groupBy, find,
  sortBy, filter, join, findIndex, isEqual} from 'lodash';
import {getTitle, getAdress} from '../../utils/Helpers';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import emptyFunction from 'fbjs/lib/emptyFunction';
import jsep from 'jsep';
/**
 *  styles
 */
import s from './SuperMediaSlider.scss';
/**
 * components
 */
import Modal from 'react-bootstrap/lib/Modal';
import Switcher from '../SuperMediaSlider/Switcher';
import Slider from '../SuperMediaSlider/Slider';
import Infrastructure from '../SuperMediaSlider/Infrastructure';
import Layout3d from '../SuperMediaSlider/Layout3d';
import FullScreenButton from '../SuperMediaSlider/FullScreenButton';

import userStore from '../../stores/UserStore';
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';
import Conditions from '../../core/Conditions';

const ModalBody = Modal.Body;

class SuperMediaSlider extends Component {
  static propTypes = {
    mediaSource: React.PropTypes.string,
    show_photo: React.PropTypes.string,
    show_tours: React.PropTypes.string,
    show_layouts: React.PropTypes.string,
    show_layout3d: React.PropTypes.string,
    show_video: React.PropTypes.string,
    show_building: React.PropTypes.string,
    show_demo: React.PropTypes.string,
    show_district: React.PropTypes.string,
    show_infrastructure: React.PropTypes.string,
    mountNode: React.PropTypes.string,
    extraSlides: React.PropTypes.array,
    height: React.PropTypes.number,
    context: React.PropTypes.shape({
      insertCss: React.PropTypes.func,
    }),
  };

  static defaultProps = {
    mediaSource: '-1'
  };

  constructor(props) {
    super(props);

    this.media = {};
    if (data.object && data.object.media) {
      this.media = clone(data.object.media);
      this.media.building = filter(this.media.building,
        media => media.media_date !== null);
      this.media.layout3d = find(this.media.layouts,
        layout => layout.kind === '3dlayout');
      this.media.layouts = filter(this.media.layouts,
        layout => layout.kind !== '3dlayout');
    }
    this.checkViews = [
      'infrastructure',
      'tours',
      'videos',
      'layout3d',
      'district'
    ];

    this.geoInfo = {
      la: data.object.info.la_pan,
      lo: data.object.info.lo_pan,
      angle: data.object.info.angle
    };

    const {photos, demos, layouts, layout3d, tours, videos, building} =
      this.media;
    const initialFilter = [];
    let activeView, filteredMedia;

    if(parseInt(props.show_demo) && demos && demos.length !== 0) {
      activeView = 'demos';
    } else if (parseInt(props.show_photo) && photos && photos.length !== 0) {
      activeView = 'photos';
    } else if(parseInt(props.show_tours) && tours && tours.length !== 0) {
      activeView = 'tours';
    } else if (parseInt(props.show_layouts) && layouts &&
    layouts.length !== 0) {
      activeView = 'layouts';
    } else if (parseInt(props.show_layout3d) && layout3d) {
      activeView = 'layout3d';
    } else if (parseInt(props.show_building) && building &&
    building.length !== 0) {
      activeView = 'building';
    } else if (parseInt(props.show_video) && videos && videos.length !== 0) {
      activeView = 'videos';
    } else if(parseInt(props.show_district) &&
              this.geoInfo.la !== undefined &&
              this.geoInfo.lo !== undefined) {
      activeView = 'district';
    } else if (parseInt(props.show_infrastructure)) {
      activeView = 'infrastructure';
    }

    const defaultStateModesInit = {
      activeSlideIndex: 0,
      sliderTransform: 0,
      timelineTransform: 0,
      firstTransform: 0,
      activeGroup: '',
      displayFilter: false,
      needInit: true,
      needTransform: true
    };
    const defaultStateModes = {
      activeSlideIndex: 0,
      sliderTransform: 0,
      timelineTransform: 0,
      firstTransform: 0,
      activeGroup: '',
      displayFilter: false,
      needInit: false,
      needTransform: false
    };

    if (activeView === 'photos') {
      const seasonCollection = this.getFilter(activeView, 'season');
      const seasons = ['winter', 'spring', 'summer', 'autumn'];
      const curSeason = seasons[Math.floor((new Date()).getMonth() / 3) % 4];

      if (includes(map(seasonCollection, 'id'), curSeason)) {
        initialFilter.push(curSeason);
      }
      if (includes(map(seasonCollection, 'id'), 'undef')) {
        initialFilter.push('undef');
      }
    }
    filteredMedia = this.filterMedia(activeView, 'season', initialFilter);
    filteredMedia = activeView  === 'building' ?
      sortBy(filteredMedia, item =>
            item.media_date.substring(0,7)) :
      filteredMedia;

    const extraSlides = filter(props.extraSlides, slide =>
      slide.condition && Conditions.checkCondition(jsep(slide.condition))
    );

    this.state = {
      isFullScreen: false,
      activeView: activeView,
      filteredMedia: filteredMedia,
      collectionSeason: this.getFilter(activeView, 'season'),
      collectionKind: this.getFilter(activeView, 'kind'),
      filterSeason: initialFilter,
      filterKind: [],
      timelineMedia: activeView  === 'building' ?
        groupBy(this.filterMedia(activeView, 'season', initialFilter),
          item => item.media_date.substring(0,7)) :
        [],
      views: {
        photos: defaultStateModesInit,
        tours: defaultStateModes,
        layouts: defaultStateModesInit,
        building: defaultStateModesInit,
        videos: defaultStateModes,
        demos: defaultStateModesInit
      },
      transition: 0,
      sliderHeight: this.props.height,
      extraSlides: extraSlides || []
    };

    if (canUseDOM) {
      this.state.width = document.getElementById(props.mountNode).offsetWidth;
      this.thumbsWidth = this.getThumbsWidth();
      if (this.state.sliderHeight * 1.5 > this.state.width) {
        this.state.sliderHeight = this.state.width / 1.5;
      }
    }
  }

  static childContextTypes = {
    insertCss: React.PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  sliderDidMount = () => {
    const {activeView, views, width, filteredMedia} = this.state;
    const view = clone(views[activeView]);

    if (view) {
      const filteredMediaSize = size(filteredMedia);
      const activeSlideIndex = view.activeSlideIndex;
      const prevSlide = document.querySelector('[data-st="-1"]');
      const activeSlide = document.querySelector('[data-st="0"]');

      view.firstTransform = - (prevSlide.offsetWidth -
        (width - activeSlide.offsetWidth) / 2);
      view.sliderTransform = this.getTransformValueByIndex(activeSlideIndex,
        view.firstTransform);
      view.needInit = false;
      view.activeGroup = activeView === 'building' && !view.activeGroup ?
        filteredMedia[0].media_date.substring(0, 7) : view.activeGroup;
      views[activeView] = view;

      this.thumbsWidth = this.getThumbsWidth();

      if (view.activeGroup) {
        view.timelineTransform =
          this.getThumbsTransformValuePrev(view.activeGroup);
      } else {
        if (activeSlideIndex === 0) {
          view.timelineTransform = 0;
        } else if (filteredMediaSize * 45 + 6 > width - 228) {
          view.timelineTransform = this.thumbsWidth - 45 *
            filteredMediaSize - 6;
        } else {
          view.timelineTransform = 0;
        }
      }

      this.setState({
        views: views,
        extraChange: false
      });
    }
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    userStore.onChange(this.onChange);
    mss.onChange(this.onChange);
    wss.onChange(this.onChange);
  }

  componentWillUnmount() {
    this.removeCss();
    userStore.offChange(this.onChange);
    mss.offChange(this.onChange);
    wss.offChange(this.onChange);
  }

  componentDidMount() {
    if (this.state.activeView === 'district') {
      this.initDistrict();
    }
  }

  componentDidUpdate() {
    if (this.msPanorama) {
      delete this.msPanorama;
    }
    if (this.state.activeView === 'district') {
      setTimeout(() => {
        this.initDistrict();
      }, 0);
    }
  }

  onChange = () => {
    const {views, activeView, filteredMedia} = this.state;

    if (this.checkViews.indexOf(activeView) === -1) {
      const extraSlides = filter(this.props.extraSlides, slide =>
        !slide.condition ||
        slide.condition && Conditions.checkCondition(jsep(slide.condition))
      );

      views[activeView].needInit = true;

      if (size(extraSlides) === 0 &&
      views[activeView].activeSlideIndex >= size(filteredMedia)) {
        views[activeView].activeSlideIndex = 0;
      }

      if (!isEqual(this.state.extraSlides, extraSlides)) {
        extraSlides && this.setState({
          views: views,
          transition: 0,
          extraChange: true,
          extraSlides: extraSlides || []
        });
      }
    }
  }

  getThumbsWidth() {
    const thumbsClass = `${this.props.mountNode}_thumbsContainer`;

    return document.getElementById(thumbsClass) ?
      document.getElementById(thumbsClass).offsetWidth : 0;
  }

  toggleFullScreen = () => {
    const {activeView, views, isFullScreen} = this.state;

    if (this.checkViews.indexOf(activeView) === -1) {
      views[activeView].needInit = true;
    }

    if (activeView === 'photos') {
      views[activeView].displayFilter = false;
    }

    this.setState({
      views: views,
      isFullScreen: !isFullScreen,
      transition: 0,
      width: isFullScreen ?
        document.getElementById(this.props.mountNode).offsetWidth :
        document.documentElement.offsetWidth < 1024 ? 1024 :
        document.documentElement.offsetWidth
    });
  }

  handleKey = (event) => {
    if (event.keyCode === 37) {
      this.prevSlide();
    } else if (event.keyCode === 39) {
      this.nextSlide();
    }
  }

  transformWrapper(value) {
    const wrapper = document.getElementById(
      `${this.props.mountNode}_slidesWrapper`);

    wrapper.style.transform = `translateX(${value}px)`;
    wrapper.style.msTransform = `translateX(${value}px)`;
    wrapper.style.WebkitTransform = `translateX(${value}px)`;
    wrapper.style.MozTransform = `translateX(${value}px)`;
    wrapper.style.OTransform = `translateX(${value}px)`;
    wrapper.style.transition = 'transform 0ms ease';
  }

  dragOver = (event) => {
    if (event.pageX !== 0) {
      const {views, activeView} = this.state;
      const distance = this.dragStartPosition - event.pageX;
      const prevTransform = views[activeView].sliderTransform;

      this.dragDistance = prevTransform - distance;

      if (this.dragDistance <= 0 && this.dragDistance >=
      this.lastSlide - views[activeView].firstTransform) {
        this.transformWrapper(this.dragDistance);
      }
    }
  }

  dragStart = (event) => {
    this.dragStartPosition = event.pageX;
    this.lastSlide = this.getTransformValueByIndex(
      size(this.state.filteredMedia));

    event.dataTransfer.setDragImage(event.target, -10000, -10000);
  }

  dragEnd = (event) => {
    const {views, activeView} = this.state;
    const sliderTransform = views[activeView].sliderTransform;

    if (Math.abs(sliderTransform - this.dragDistance) >=
    event.target.offsetWidth / 2) {
      if (sliderTransform > this.dragDistance) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    } else {
      this.transformWrapper(sliderTransform);
    }
  }

  clearSeasons = () => {
    const {activeView, views} = this.state;

    views[activeView].activeSlideIndex = 0;
    views[activeView].timelineTransform = 0;
    views[activeView].sliderTransform = views[activeView].firstTransform;
    views[activeView].needInit = true;

    this.setState({
      filterSeason: [],
      filteredMedia: this.filterMedia(activeView),
      views: views
    });
  }

  checkSeasons = () => {
    const {activeView, collectionSeason, views} = this.state;
    const allSeasons = map(collectionSeason, (season) => {
      return season.id;
    });

    views[activeView].activeSlideIndex = 0;
    views[activeView].timelineTransform = 0;
    views[activeView].sliderTransform = views[activeView].firstTransform;
    views[activeView].needInit = true;

    this.setState({
      filterSeason: allSeasons,
      filteredMedia: this.filterMedia(activeView, 'season', allSeasons),
      views: views
    });
  }

  handleSwitch = (event) => {
    const activeView = this.state.activeView;
    const newView = event.currentTarget.dataset.view;

    if (newView !== activeView) {
      const filteredMedia = newView  === 'building' ?
        sortBy(this.filterMedia(newView), item =>
          item.media_date.substring(0,7)) :
        this.filterMedia(newView);
      const {views, filterSeason, filterKind} = this.state;

      if (size(filterSeason) || size(filterKind)) {
        views[activeView].activeSlideIndex = 0;
        views[activeView].timelineTransform = 0;
      }
      if (this.checkViews.indexOf(activeView) === -1) {
        views[activeView].needInit = true;
      }

      if (['infrastructure', 'layout3d', 'district'].indexOf(newView) === -1) {
        views[newView].displayFilter = newView === 'photos' ?
          true : false;
      }

      this.setState({
        activeView: newView,
        views: views,
        collectionSeason: this.getFilter(newView, 'season'),
        collectionKind: this.getFilter(newView, 'kind'),
        filterSeason: [],
        filterKind: [],
        transition: 0,
        filteredMedia: filteredMedia,
        timelineMedia: newView  === 'building' ?
          groupBy(filteredMedia, item =>
            item.media_date.substring(0,7)) :
          []
      });
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

    for (const i in aMedia) {
      if (aMedia[i]) {
        if (aMedia[i][type]) {
          if (filter[aMedia[i][type]]) {
            filter[aMedia[i][type]]++;
          } else {
            filter[aMedia[i][type]] = 1;
          }
        } else {
          filter.undef++;
        }
      }
    }
    if (!filter.undef) {
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

  filterMedia(view, group, selection) {
    const filtered = [], activeMedia = this.media[view];

    if (selection && selection.length) {
      for (const i in activeMedia) {
        if (activeMedia[i]) {
          if (includes(selection, activeMedia[i][group]) ||
            (activeMedia[i][group] === null && includes(selection, 'undef'))) {
            filtered.push(activeMedia[i]);
          }
        }
      }
      return filtered;
    } else {
      return activeMedia;
    }
  }

  filterChanged = (event) => {
    const item = event.target.id.split('-');
    const group = item[0];
    const type = item[1];
    const s = group === 'Season' ?
      {filter: 'filterKind', values: []} :
      {filter: 'filterSeason', values: []};
    const selection = event.target.checked ?
      union(this.state[`filter${group}`], [type]) :
      difference(this.state[`filter${group}`], [type]);
    const {activeView, views} = this.state;
    let filteredMedia = this.filterMedia(activeView,
        group === 'Season' ? 'season' : 'kind', selection);

    filteredMedia = activeView  === 'building' ?
      sortBy(filteredMedia, item =>
        item.media_date.substring(0,7)) :
      filteredMedia;

    views[activeView].activeSlideIndex = 0;
    views[activeView].timelineTransform = 0;
    views[activeView].needInit = true;

    this.setState(() => ({
      [`filter${group}`]: selection,
      [s.filter]: s.values,
      filteredMedia: filteredMedia,
      timelineMedia: activeView  === 'building' ?
        groupBy(filteredMedia, item =>
          item.media_date.substring(0,7)) :
        [],
      views: views,
    }));
  }

  nextSlide = () => {
    const {activeView, filteredMedia, views, width, isFullScreen, extraSlides} =
      this.state;
    const view = clone(views[activeView]);
    const extraSlidesCount = size(extraSlides);
    const filteredMediaSize = size(filteredMedia);
    const fullFilteredMediaSize = extraSlidesCount && activeView === 'photos' ?
      filteredMediaSize + extraSlidesCount : filteredMediaSize;
    const prevIndex = view.activeSlideIndex;
    const timelineTransform = view.timelineTransform;

    view.activeSlideIndex = fullFilteredMediaSize <= prevIndex + 1 ?
      0 : prevIndex + 1;

    if (!view.needTransform) {
      view.sliderTransform = isFullScreen ? -50 : 0;
    } else if (fullFilteredMediaSize <= prevIndex + 1) {
      view.sliderTransform = view.firstTransform - (isFullScreen ? 50 : 0);
    } else {
      view.sliderTransform = this.getTransformValueByIndex(
        view.activeSlideIndex);
    }

    view.activeGroup = activeView === 'building' ?
      filteredMedia[view.activeSlideIndex]
      .media_date.substring(0, 7) :
      '';

    if (view.activeGroup) {
      view.timelineTransform =
        this.getThumbsTransformValueNext(view.activeGroup);
    } else {
      if (prevIndex + 1 >= filteredMediaSize) {
        view.timelineTransform = 0;
      } else if (filteredMediaSize * 45 > width - 228 &&
      this.thumbsWidth - timelineTransform < (prevIndex + 2) * 45) {
        view.timelineTransform = this.thumbsWidth - 45 *
          (prevIndex + 2) - 6;
      }
    }

    views[activeView] = view;

    this.setState({
      views: views,
      transition: fullFilteredMediaSize <= prevIndex + 1 ? 0 : 500
    });
  }

  prevSlide = () => {
    const {activeView, filteredMedia, views, width, isFullScreen, extraSlides} =
      this.state;
    const view = clone(views[activeView]);
    const extraSlidesCount = size(extraSlides);
    const filteredMediaSize = size(filteredMedia);
    const fullFilteredMediaSize = extraSlidesCount && activeView === 'photos' ?
      filteredMediaSize + extraSlidesCount : filteredMediaSize;
    const prevIndex = view.activeSlideIndex;
    const timelineTransform = view.timelineTransform;

    view.activeSlideIndex = prevIndex - 1 < 0 ?
      fullFilteredMediaSize - 1 : prevIndex - 1;

    if (!view.needTransform) {
      view.sliderTransform = isFullScreen ? -50 : 0;
    } else {
      view.sliderTransform = this.getTransformValueByIndex(
        view.activeSlideIndex);
    }

    view.activeGroup = activeView === 'building' ?
      filteredMedia[view.activeSlideIndex]
      .media_date.substring(0, 7) :
      '';

    if (view.activeGroup) {
      view.timelineTransform =
        this.getThumbsTransformValuePrev(view.activeGroup);
    } else {
      if (prevIndex === 1) {
        view.timelineTransform = 0;
      } else if (filteredMediaSize * 45 + 6 > width - 228 && prevIndex === 0) {
        view.timelineTransform = this.thumbsWidth - 45 *
          filteredMediaSize - 6;
      } else if (filteredMediaSize * 45 > width - 228 &&
      timelineTransform < - 45 * filteredMediaSize + 45 *
      (filteredMediaSize - prevIndex + 1)) {
        view.timelineTransform = - 45 * filteredMediaSize + 45 *
          (filteredMediaSize - prevIndex + 1);
      }
    }

    views[activeView] = view;

    this.setState({
      views: views,
      transition: prevIndex - 1 < 0 ? 0 : 500
    });
  }

  toSlide = (event) => {
    const {activeView, filteredMedia, views} = this.state;
    const view = clone(views[activeView]);
    const activeSlideIndex = view.activeSlideIndex;
    const nextSlide = parseInt(event.target.dataset.thumb ||
      event.target.firstChild.dataset.thumb);

    if (nextSlide !== activeSlideIndex) {
      view.sliderTransform = !view.needTransform ?
        0 : this.getTransformValueByIndex(nextSlide);
      view.activeSlideIndex = nextSlide;
      view.activeGroup = activeView === 'building' ?
        filteredMedia[view.activeSlideIndex]
        .media_date.substring(0, 7) :
        '';
      views[activeView] = view;

      if (view.activeGroup) {
        if (nextSlide > activeSlideIndex) {
          view.timelineTransform =
            this.getThumbsTransformValueNext(view.activeGroup);
        } else {
          view.timelineTransform =
            this.getThumbsTransformValuePrev(view.activeGroup);
        }
      }

      this.setState({
        views: views,
        transition: 0
      });
    }
  }

  getTransformValueByIndex(newIndex, firstTransform) {
    const {activeView, views, isFullScreen} = this.state;
    const view = clone(views[activeView]);
    const slides = document.querySelectorAll('[data-slide]');
    const firstImgWidth = slides[1].offsetWidth;
    const nextImgWidth = slides[newIndex + 1].offsetWidth;
    let transform = firstTransform ? firstTransform : view.firstTransform;

    transform -= isFullScreen ? 50 : 0;
    for (let i = 1; i < newIndex + 1; i++) {
      transform -= slides[i].offsetWidth;
    }

    if (Math.abs(firstImgWidth - nextImgWidth) <= 1 || newIndex === 0) {
      transform = transform;
    } else {
      transform -= (nextImgWidth - firstImgWidth) / 2;
    }

    return transform;
  }

  getThumbsTransformValueNext(date) {
    const thumbs = document.querySelectorAll('[data-date]');
    const index = findIndex(thumbs, thumb => thumb.dataset.date === date);
    const {views, activeView, isFullScreen} = this.state;
    const width = isFullScreen ? this.state.width - 235 :
      this.state.width - 135;
    let transform = 0;

    if (index !== 0) {
      for (let i = 0; i < index; i++) {
        transform += thumbs[i].offsetWidth;
      }
      transform = thumbs[index].offsetWidth + transform > width - 110 &&
      width - 110 - thumbs[index].offsetWidth - transform <
      views[activeView].timelineTransform ?
        width - 110 - thumbs[index].offsetWidth - transform :
        views[activeView].timelineTransform;
    } else {
      transform = 0;
    }

    return transform;
  }

  getThumbsTransformValuePrev(date) {
    const thumbs = document.querySelectorAll('[data-date]');
    const index = findIndex(thumbs, thumb => thumb.dataset.date === date);
    const {views, activeView, isFullScreen} = this.state;
    const width = isFullScreen ? this.state.width - 235 :
      this.state.width - 135;
    let transform = 0;

    for (let i = 0; i < index + 1; i++) {
      transform -= thumbs[i].offsetWidth;
    }
    if (index === size(thumbs) - 1 && Math.abs(transform) > width) {
      transform += width - 110;
    } else if (index === 0) {
      transform = 0;
    } else {
      transform += thumbs[index].offsetWidth;
      transform = transform > views[activeView].timelineTransform ?
        transform :
        views[activeView].timelineTransform;
    }

    return transform;
  }

  initDistrict() {
    if (window.google && window.google.maps) {
      const container = document
        .getElementById(`${this.props.mountNode}-district`);

      if (container) {
        this.msPanorama = new window.google.maps.StreetViewPanorama(container, {
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

  render() {
    const constructionHistory = data.object.newhouse_construction_history ||
      {};
    const mediaSource = parseInt(this.props.mediaSource) < 0 ?
      data.options.mediaSource : parseInt(this.props.mediaSource);
    const {activeView, isFullScreen, width, sliderHeight} = this.state;
    const object = data.object.info.info ?
      data.object.info.info : data.object.info;
    let imgAlt = '';

    if (data.object.info.info) {
      const altParts = [];

      activeView === 'building' && altParts.push('Ход строительства');
      activeView === 'layouts' && altParts.push('Планировка');
      object.builder_name && altParts.push(`Застройщик ${object.builder_name}`);
      object.gp && altParts.push(object.gp);
      imgAlt = join(altParts, ', ');
    } else if (data.object.info) {
      const layout = activeView === 'layouts' ? 'Планировка, ' : '';
      const name = getTitle(object.rooms, object.type_ru || object.type);
      const addr = getAdress(object.district, object.street, object.house_num);

      imgAlt = `${layout}${name}, ${addr}`;
    }

    const content = activeView &&
      (<div>
        <Switcher
          parentProps={this.props}
          parentState={this.state}
          media={this.media}
          geoInfo={this.geoInfo}
          clearSeasons={this.clearSeasons}
          checkSeasons={this.checkSeasons}
          filterChanged={this.filterChanged}
          handleSwitch={this.handleSwitch}
        />
        {activeView === 'infrastructure' ?
          <Infrastructure
            parentProps={this.props}
            parentState={this.state}
            toggleFullScreen={this.toggleFullScreen}
          /> :
          activeView === 'layout3d' ? <div>
            {canUseDOM ? <Layout3d
              layout3d={this.media.layout3d}
              sliderHeight={sliderHeight ||
                width / (isFullScreen ? 2.5 : 2)} /> : ''}
            <FullScreenButton
              buttonFloat={false}
              isFullScreen={isFullScreen}
              toggleFullScreen={this.toggleFullScreen} />
          </div> :
          activeView === 'district' ? <div>
              <div id={`${this.props.mountNode}-district`}
              style={{height: sliderHeight ||
                width / (isFullScreen ? 2.5 : 2)}}/>
              <FullScreenButton
                buttonFloat={false}
                isFullScreen={isFullScreen}
                toggleFullScreen={this.toggleFullScreen} />
            </div> :
          <Slider
            parentState={this.state}
            parentProps={this.props}
            imgAlt={imgAlt}
            constructionHistory={constructionHistory}
            mediaSource={mediaSource}
            prevSlide={this.prevSlide}
            nextSlide={this.nextSlide}
            toSlide={this.toSlide}
            handleKey={this.handleKey}
            sliderDidMount={this.sliderDidMount}
            dragStart={this.dragStart}
            dragEnd={this.dragEnd}
            dragOver={this.dragOver}
            toggleFullScreen={this.toggleFullScreen}
          />
        }
      </div>);

    return (isFullScreen ? (<div>
        <Modal
          show={isFullScreen}
          onHide={this.toggleFullScreen}
          className={s.sliderFullscreen}>
          <ModalBody>
            {content}
            <span
              className={s.fullscreenClose}
              onClick={this.toggleFullScreen}>
              &times;
            </span>
          </ModalBody>
        </Modal>
      </div>) :
      <div>
        {content}
      </div>
    );
  }
}

export default SuperMediaSlider;
