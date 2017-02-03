/**
 * GalleryViewer widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './GalleryViewer.scss';
import Fingerprint2 from 'fingerprintjs2';
import classNames from 'classnames';
import UserAgentData from 'fbjs/lib/UserAgentData';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {size, map} from 'lodash';
import {getFromBack} from '../../utils/requestHelpers';
import {scrollTo, findPos} from '../../utils/Helpers';
import GalleryViewerList from './GalleryViewerList';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';
import WidgetsActions from '../../actions/WidgetsActions';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class GalleryViewer extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: PropTypes.string,
    galleryId: PropTypes.string,
    gallery: PropTypes.array,
    galleryLen: PropTypes.number,
    perPage: PropTypes.number,
    selected: PropTypes.string,
    gaEvents: PropTypes.object,
    actions: PropTypes.object,
    filter: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ])
  };

  static defaultProps = {
    gallery: [],
    perPage: 6,
    gaEvents: {}
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      gallery: props.gallery,
      galleryLen: props.galleryLen,
      containerWidth: 1172, //@todo: переделать на получени актуальной ширины контейнера
      fingerprint: null,
      filter: null,
      selected: props.selected ? props.selected : null,
      showSocials: null
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    const {fingerprint, galleryLen} = this.state;
    const {perPage, objectName} = this.props;
    const self = this;

    if(canUseDOM && !fingerprint) {
      new Fingerprint2().get(result => {
        self.setState(() => ({fingerprint: result}));
        self.getImages(perPage - 1, 0, true);
      });
    }
    if(canUseDOM && size(window.location.hash) > 1) {
      this.setState(() => ({selected: window.location.hash.replace('#', '')}));
    }
    this.props.actions.updateInObjectsState(
      [objectName, 'count'], () => (galleryLen));
    this.processProps(this.props);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {filter} = this.state;
    const {filter: newFilter} = props;

    if(newFilter !== null && filter !== newFilter) {
      this.setState(() => ({
        filter: newFilter || '',
        gallery: [],
        galleryLen: 0
      }));
      setTimeout(() => { this.getImages(); }, 100);
    }
  }

  getImages = (limit = false, offset = false, replace = false) => {
    const {galleryId, perPage, objectName} = this.props;
    const {fingerprint, gallery, filter, selected} = this.state;

    limit = limit ? limit : (size(gallery) ? perPage : perPage - 1);
    offset = offset === false ? size(gallery) : offset;

    getFromBack({
      action: 'gallery_action',
      subAction: 'images',
      gallery_id: galleryId, //eslint-disable-line camelcase
      user_hash: fingerprint,  //eslint-disable-line camelcase
      limit: size(filter) ? 1 : limit,
      offset: size(filter) ? 0 : offset,
      id: size(filter) ? filter : null,
      order: size(selected) ?
        `(i.hash = '${selected}') desc, i.id desc` :
        null
    }).then(response => {
      if(response.ok) {
        const newState = {galleryLen: response.count};

        if(replace) {
          newState.gallery = response.images;
        } else {
          newState.gallery = gallery.concat(response.images);
        }
        this.setState(() => (newState));
        this.props.actions.updateInObjectsState(
          [objectName, 'count'], () => (response.count));
      } else {
        this.showError();
      }
    }, error => {
      this.showError(error.code);
    });
  }

  showError = msg => {
    WidgetsActions.set('notify',[{
      msg: size(msg) ?
        `Ошибка получения данных: ${msg}` : 'Ошибка получения данных',
      type: 'warn'
    }]);
  }

  loadNext = () => {
    const {gaEvents} = this.props;

    size(gaEvents.gaEventListNext) &&
      ga('button', gaEvents.gaEventListNext);
    this.getImages();
  }

  getTargetId = ancestor => {
    while((!ancestor.dataset || !ancestor.dataset.id) &&
      (ancestor = ancestor.parentNode)) {};
    if(ancestor && ancestor.dataset && ancestor.dataset.id) {
      return {id: ancestor.dataset.id, detailed: ancestor.dataset.detailed};
    } else {
      return {id: false};
    }
  }

  itemToggle = e => {
    const {id} = this.getTargetId(e.target);
    const {selected} = this.state;
    const {gaEvents} = this.props;

    if(id) {
      const oldId = selected;
      const newId = selected === id ? null : id;
      const {pathname} = window.location;
      const path = (/^\/([^\/]*)\/.*\/*$/).exec(pathname);

      this.setState({
        selected: newId
      }, () => {
        this.galleryScroll(newId ? `detailed-${newId}` : `item-${oldId}`);
      });
      window.history.pushState(
        null,
        null,
        newId ? `/${path[1]}/${newId}/` : `/${path[1]}/`
      );

      size(gaEvents.gaEventPhotoOpen) &&
        ga('button', gaEvents.gaEventPhotoOpen);
    }
  }

  itemVote = e => {
    const {id, detailed} = this.getTargetId(e.target);
    const {fingerprint, gallery} = this.state;
    const {gaEvents} = this.props;

    if(id) {
      getFromBack({
        action: 'gallery_action',
        subAction: 'vote',
        vote: 1,
        hash: btoa(`${id}${fingerprint}`)
      }).then(response => {
        if(response.ok) {
          const {affectedImage} = response;
          const selIdx = map(gallery, 'hash').indexOf(affectedImage.hash);

          gallery[selIdx] = affectedImage;
          this.setState(() => ({gallery: gallery}));
          if(parseInt(affectedImage.votes_user)) {
            this.setState(() => ({
              showSocials: affectedImage.id
            }));
            size(gaEvents.gaEventListVote) && !detailed &&
              ga('button', gaEvents.gaEventListVote);
            size(gaEvents.gaEventPhotoVote) && detailed &&
              ga('button', gaEvents.gaEventPhotoVote);
          } else {
            size(gaEvents.gaEventListDeVote) && !detailed &&
              ga('button', gaEvents.gaEventListDeVote);
            size(gaEvents.gaEventPhotoDeVote) && detailed &&
              ga('button', gaEvents.gaEventPhotoDeVote);
          }
        } else {
          this.showError();
        }
      }, error => {
        this.showError(error.code);
      });
    }
  }

  itemAdd = () => {
    this.galleryScroll('galleryuploader--wrapper');
  }

  socialsToggle = e => {
    const {id} = this.getTargetId(e.target);
    const {showSocials} = this.state;
    const {gaEvents} = this.props;

    if(id) {
      this.setState(() => ({
        showSocials: showSocials === id ? null : id
      }));
      size(gaEvents.gaEventListShareToggle) &&
        ga('button', gaEvents.gaEventListShareToggle);
    }
  }

  galleryScroll = selector => {
    const elementScrollTop = findPos(selector);

    if (elementScrollTop) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
          document.documentElement :
          document.body;

      setTimeout(() => {
        scrollTo(elementTop, elementScrollTop, 600)
          .then(emptyFunction, emptyFunction);
      }, 0);
    }
  }

  render() {
    const {
      gallery, selected, containerWidth, galleryLen, showSocials, filter
    } = this.state;
    const {gaEvents} = this.props;

    return (
      <div className={s.root} ref='container'>
        <GalleryViewerList
          items={gallery}
          selected={selected}
          containerWidth={containerWidth}
          showSocials={showSocials}
          socialsToggle={this.socialsToggle}
          itemToggle={this.itemToggle}
          itemVote={this.itemVote}
          itemAdd={this.itemAdd}
          gaEvents={gaEvents}/>
        <div className={s.showMore}>
          <button
            disabled={size(gallery) >= galleryLen || size(filter)}
            className={classNames(s.showMoreButton, 'form-control')}
            onClick={this.loadNext}>
            Показать еще фото
          </button>
        </div>
      </div>
    );
  }

}

export default connect(
  (state, ownProps) => {
    const {objectName} = ownProps;

    return {
      filter: state.objects.get(objectName) ?
        state.objects.get(objectName).toJS().filter : null
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(GalleryViewer);
