/**
 * MobileSlider widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Image from '../../shared/Image';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import s from './MobileSlider.scss';
import ContextType from '../../utils/contextType';
import {map, size} from 'lodash';
import Carousel from 'nuka-carousel';
import classNames from 'classnames';

class MobileSlider extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    media: PropTypes.object,
    showTabs: PropTypes.number
  };

  static defaultProps = {
    showTabs: 1
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    const media = this.props.media || {};
    const currentType = media['photos'] ?
      'photos' : Object.keys(media)[0];

    const filteredMedia = {};

    for (const type in media) {
      if (media.hasOwnProperty(type)) {
        filteredMedia[type] = media[type]
          .filter(item => item.kind !== '3dlayout');
      }
    }

    this.state = {
      slideIdx: 1,
      currentType: currentType,
      media: filteredMedia,
      fullScreen: false
    };
    this.typeTranslations = {
      photos: 'Фото',
      layouts: 'Планировки',
    };
    this.tabsOrder = [
      'photos', 'layouts'
    ];

  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  changeMediaType = (tab) => {
    this.setState({
      ...this.state,
      currentType: tab,
      slideIdx: 1,
      reInitSlider: true
    });
  }

  getSlides = () => {
    const {currentType, fullScreen} = this.state;

    return this.state.media[currentType] ?
      this.state.media[currentType].map((item, idx) => {
        const imageProps = {
          image: item.filename,
          visual: currentType,
          width: (canUseDOM && document.body.clientWidth < 768 &&
            !fullScreen) ?
            300 : 640,
          height: (canUseDOM && document.body.clientWidth < 768 &&
            !fullScreen) ?
            267 : 480,
          className: this.state.slideIdx !== idx + 1 ? s.faded : s.active
        };

        return (
        <a href="#" onClick={this.toggleFullScreen} key={`slide_${idx}`}>
          <Image {...imageProps} />
        </a>
        );
      }) : [];
  }

  toggleFullScreen = event => {
    event.preventDefault();

    this.setState({
      fullScreen: !this.state.fullScreen
    });
  }

  getSliderTabs = () => {
    const tabs = map(this.tabsOrder, (tab, key) => {

      const classes = classNames({
        [s.switcherItem]: true,
        [s.switcherItemActive]: tab === this.state.currentType
      });

      return this.props.media[tab] ? (
        <div className={classes}
             key={`tab_${key}`}>
          <div className={key !== 0 ? s.borderWrapper : ''}>
            <a href="#" onClick={(event) => {
              event.preventDefault();
              this.changeMediaType(tab);
            }}>
              {this.typeTranslations[tab]} ({this.state.media[tab].length})
            </a>
          </div>
        </div>
      ) : null;
    });

    return (
      <div className={s.mediaSwitcher}>
        {tabs}
      </div>
    );
  }

  componentDidMount() {
    if (canUseDOM) {
      window.onresize = (e) => {
        this.setState({
          totalWidth: e.target.innerWidth,
        });
      };
    }
  }

  render() {
    const {currentType} = this.state;
    const imgProps = {
      image: '',
      visual: currentType,
      width: (canUseDOM && document.body.clientWidth < 768 &&
        !this.state.fullScreen) ?
        300 : 640,
      height: (canUseDOM && document.body.clientWidth < 768 &&
        !this.state.fullScreen) ?
        267 : 480,
      error: true
    };

    if (!size(this.state.media)) {
      return (
        <div className={s.imageWrapper} style={{
          width: this.state.fullScreen ? 267 : 145
        }}>
          <Image {...imgProps}/>
        </div>
      );
    }

    const classes = classNames({
      [s.root]: true,
      [s['mobile-modal']]: this.state.fullScreen,
      [s['condition-effect-slide']]: this.state.fullScreen,
      [s['fullscreen']]: this.state.fullScreen,
      fullScreenNorm: this.state.fullScreen
    });

    if (size(this.state.media[currentType]) === 1) {
      imgProps.image = this.props.media[currentType][0].filename;
      imgProps.error = false;

      return (
        <div className={classes}>
          {
            this.state.fullScreen ? (
              <div className={s.closeFullScreen}>
                <a href="#" onClick={this.toggleFullScreen}>
                  <img
                    src="//cdn-media.etagi.com/content/media/site/3/3f/3f6e58c49060c32bbaca3f90a773c97e726b1272.svg" // eslint-disable-line
                    alt="Закрыть"
                  />
                </a>
              </div>
            ) : null
          }
          {
            this.state.media && this.props.showTabs ?
              this.getSliderTabs() : null
          }
          <div className={s.imageWrapper}>
            <a href="#" onClick={this.toggleFullScreen}>
              <Image {...imgProps}/>
            </a>
          </div>
        </div>
      );
    }

    const dec = [
      {
        component: () => {
          return null;
        }
      }
    ];
    let cellAlign = 'center';
    let slideWidth = `${canUseDOM ? document.body.clientWidth / 2 : 0}px`;

    if (size(this.state.media[currentType]) === 2) {
      cellAlign = 'left';
      slideWidth = `${canUseDOM ? document.body.clientWidth / 4 * 3 : 0}px`;
    }

    if (this.state.fullScreen) {
      slideWidth = `${canUseDOM ? document.body.clientWidth / 4 * 3 : 0}px`;
    }

    return (
      <div className={classes} ref="root">
        {
          this.state.fullScreen ? (
            <div className={s.closeFullScreen}>
              <a href="#" onClick={this.toggleFullScreen}>
                <img
                  src="//cdn-media.etagi.com/content/media/site/3/3f/3f6e58c49060c32bbaca3f90a773c97e726b1272.svg" //eslint-disable-line
                  alt="Закрыть"
                />
              </a>
            </div>
          ) : null
        }
        {
          this.state.media && this.props.showTabs ?
          this.getSliderTabs() : null
        }
        <div className={s.sliderWrapper} id='slider-wrapper'>
          <div className={s.countWrapper}>
            <div className={s.count}>
              {this.state.slideIdx}/{size(this.state.media[currentType])}
            </div>
          </div>
          <Carousel
            slidesToShow={1}
            slideWidth={slideWidth}
            cellAlign={cellAlign}
            cellSpacing={1}
            wrapAround={true}
            slideIndex={this.state.reInitSlider ? 0 : null}
            afterSlide={(slideIdx) => {
              this.setState({
                slideIdx: slideIdx + 1,
                reInitSlider: false
              });
            }}
            decorators={dec}>
            {this.getSlides()}
          </Carousel>
        </div>
      </div>
    );
  }

}

export default connect(
  (state, ownProps) => {
    const {media} = state.objects.get('object') ?
      state.objects.get('object').toJS() : ownProps;

    return {
      media: media
    };
  }
)(MobileSlider);
