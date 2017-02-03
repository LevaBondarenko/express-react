/**
 * Switcher component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
/**
 *  components
 */
import ButtonList from '../SuperMediaSlider/ButtonList';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Switcher.scss';

class Switcher extends Component {
  static  propTypes = {
    parentProps: React.PropTypes.object,
    parentState: React.PropTypes.object,
    geoInfo: React.PropTypes.object,
    media: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ]),
    handleSwitch: React.PropTypes.func,
    filterChanged: React.PropTypes.func,
    checkSeasons: React.PropTypes.func,
    clearSeasons: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {show_photo, show_tours, show_layouts, show_layout3d, show_building,
      show_video, show_infrastructure, show_demo, show_district} =
      this.props.parentProps;
    const {photos, demos, tours, layouts, layout3d, videos, building} =
      this.props.media;
    const {activeView, filterKind, filterSeason, collectionSeason,
      filteredMedia, isFullScreen} = this.props.parentState;
    const filteredSize = filterKind.length + filterSeason.length;
    const buttonListLabel = activeView === 'photos' && filteredSize &&
    collectionSeason.length !== filterSeason.length &&
    (filteredMedia.length > 1 || collectionSeason.length > 1) ?
      `Фотографии (${size(filteredMedia)} из ${size(photos)})` :
      `Фотографии (${size(photos)})`;
    const buttonStyle = isFullScreen ?
      s.switcher__button__fs : s.switcher__button;
    const buttonActiveStyle = isFullScreen ?
      s.switcher__button__fs__active : s.switcher__button__active;
    const geoInfo = this.props.geoInfo;

    return (
      <div style={{display: isFullScreen ? 'flex' : 'block'}}>
        {parseInt(show_demo) && demos && demos.length !== 0 ?
          <button
            key='switcher-demos'
            data-view='demos'
            className={activeView === 'demos' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
            {`Демо-квартиры (${demos.length})`}
          </button> :
          ''
        }
        {parseInt(show_photo) && photos && photos.length !== 0 ?
          <ButtonList
            parentState={this.props.parentState}
            key='switcher-photos'
            dataView='photos'
            className={activeView === 'photos' ?
              buttonActiveStyle : buttonStyle}
            name={buttonListLabel}
            clearSeasons={this.props.clearSeasons}
            checkSeasons={this.props.checkSeasons}
            handleSwitch={this.props.handleSwitch}
            filterChanged={this.props.filterChanged}
          /> :
          ''
        }
        {parseInt(show_tours) && tours && tours.length !== 0 ?
          <button
            key='switcher-tours'
            data-view='tours'
            className={activeView === 'tours' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              {`3D-туры (${tours.length})`}
          </button> :
          ''
        }
        {parseInt(show_layouts) && layouts && layouts.length !== 0 ?
          <button
            key='switcher-layouts'
            data-view='layouts'
            className={activeView === 'layouts' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              {`Планировки (${layouts.length})`}
          </button> :
          ''
        }
        {parseInt(show_layout3d) && layout3d ?
          <button
            key='switcher-layout3d'
            data-view='layout3d'
            className={activeView === 'layout3d' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              3D-планировка
          </button> :
          ''
        }
        {parseInt(show_building) && building && building.length !== 0 ?
          <button
            key='switcher-building'
            data-view='building'
            className={activeView === 'building' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              {`Ход строительства (${building.length})`}
          </button> :
          ''
        }
        {parseInt(show_video) && videos && videos.length !== 0 ?
          <button
            key='switcher-videos'
            data-view='videos'
            className={activeView === 'videos' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              Видео
          </button> :
          ''
        }
        {parseInt(show_district) && geoInfo &&
            geoInfo.la !== undefined && geoInfo.lo != undefined &&
            geoInfo.la !== null && geoInfo.lo !== null &&
            parseFloat(geoInfo.la) > 0 && parseFloat(geoInfo.lo) > 0 ?
          <button
            key='switcher-district'
            data-view='district'
            className={activeView === 'district' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              Виды района
          </button> :
          ''
        }
        {parseInt(show_infrastructure) ?
          <button
            key='switcher-infrastructure'
            data-view='infrastructure'
            className={activeView === 'infrastructure' ?
              buttonActiveStyle : buttonStyle}
            onClick={this.props.handleSwitch}>
              Карта
          </button> :
          ''
        }
      </div>
    );
  }
}

export default withStyles(s)(Switcher);
