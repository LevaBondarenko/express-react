/**
 * MapAnalytics presentational component
 *
 * @ver 0.0.1
 *
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './MapAnalyticsView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/* global ymaps */
class MapAnalyticsView extends Component {
  static propTypes = {
    defaultZoomYa: PropTypes.string,
    mapData: PropTypes.object,
    maxZoomYa: PropTypes.string,
    minZoomYa: PropTypes.string,
    step: PropTypes.array,
    stepYa: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.myMap = {};
  }

  componentDidMount() {
    ymaps.ready(() => {
      setTimeout(
        this.init(), 0
      );
    });
  }

  componentDidUpdate() {
    this.myMap.destroy();

    setTimeout(
      this.init(), 0
    );
  }

  init = () => {
    const {
      defaultZoomYa,
      mapData: {
        coords,
        dataArr
      },
      maxZoomYa,
      minZoomYa,
      stepYa
    } = this.props;

    this.myMap = new ymaps.Map('poligon_map', {
      center: [coords[1], coords[0]],
      controls: ['zoomControl'],
      zoom: parseInt(defaultZoomYa)
    }, {
      suppressMapOpenBlock: true
    });

    this.myMap.controls.add('zoomControl', {
      left: 200,
      top: 200,
      visible: true,
      zoomStep: parseInt(stepYa)
    });

    this.myMap.options.set('minZoom', minZoomYa);
    this.myMap.options.set('maxZoom', maxZoomYa);
    this.myMap.behaviors.disable('dblClickZoom');
    this.myMap.geoObjects.removeAll();

    const AllPolygons = [];

    Object.keys(dataArr).map(key => {
      const {
        cityId,
        coordinates,
        districtId,
        id,
        level,
        name,
        parentId,
        properties,
        settings,
        styleProps
      } = dataArr[key];
      const {
        fillColor: color,
        opacity,
        strokeColor,
        strokeStyle
      } = styleProps;

      AllPolygons[id] = new ymaps.Polygon(
        [coordinates],
        properties,
        styleProps
      );

      AllPolygons[id].myCoordinates = coordinates;
      AllPolygons[id].myDistrictsIds = districtId;
      AllPolygons[id].myСityID = cityId;
      AllPolygons[id].myId = id;
      AllPolygons[id].myStrokeColor = strokeColor;
      AllPolygons[id].myStrokeWidth = '3';
      AllPolygons[id].myStrokeStyle = strokeStyle;
      AllPolygons[id].myOpacity = opacity;
      AllPolygons[id].myHoverColor = color;
      AllPolygons[id].myColor = color;
      AllPolygons[id].myIsEdit = 0;
      AllPolygons[id].myClickColor = color;
      AllPolygons[id].myCheck = false;
      AllPolygons[id].mySetting = settings;
      AllPolygons[id].myHame = name;
      AllPolygons[id].myLvl = level;
      AllPolygons[id].myParent = parentId;

      this.myMap.geoObjects.add(AllPolygons[id]);
    });
  }

  render() {
    const {mapData: {step}} = this.props;

    return (
      <div className={style.mapAnalytics}>
        <div id='pm_main_MA' className={style.mapAnalytics__map}>
            <div id='poligon_map' />
        </div>
        <div className={style.mapAnalytics__legend}>
          <p>Обозначения:</p>
          <div>
            <div className={style.mapAnalytics__legend__color00F} />
            <span>
              {step[0]}
            </span>
          </div>
          <div>
            <div className={style.mapAnalytics__legend__color0FF} />
            <span>
              {step[1]}
            </span>
          </div>
          <div>
            <div className={style.mapAnalytics__legend__color0F0} />
            <span>
              {step[2]}
            </span>
          </div>
          <div>
            <div className={style.mapAnalytics__legend__colorFF0} />
            <span>
              {step[3]}
            </span>
          </div>
          <div>
            <div className={style.mapAnalytics__legend__colorF00} />
            <span>
              {step[4]}
            </span>
          </div>
          <div>
            <div className={style.mapAnalytics__legend__colorF00more} />
            <span>
              {step[5]}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(MapAnalyticsView);
