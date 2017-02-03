/**
 * MapObjectM presentational component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './MapObjectMView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import CompactDropdown from '../../shared/CompactDropdown';

/* global ymaps */
class MapObjectMView extends Component {
  static propTypes = {
    compactDDTitle: PropTypes.string,
    context: PropTypes.object,
    defaultZoomYa: PropTypes.string,
    maxZoomYa: PropTypes.string,
    minZoomYa: PropTypes.string,
    objectInfo: PropTypes.object,
    props: PropTypes.object,
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

  init = () => {
    const {
      defaultZoomYa,
      maxZoomYa,
      minZoomYa,
      objectInfo,
      stepYa
    } = this.props;
    const {la, lo} = objectInfo;
    const icons = {
      home: '//cdn-media.etagi.com/static/site/0/0d/0d2425265fa6a8de29610c060e472d38009595ac.png', // eslint-disable-line max-len
    };
    const fullscreenControl = new ymaps.control.FullscreenControl({ // buttons section
      options: {
        position: {
          right: 10,
          top: 10
        }
      }
    });
    const geolocationControl = new ymaps.control.GeolocationControl({
      options: {
        position: {
          right: 10,
          top: 109
        }
      }
    });
    const routeEditor = new ymaps.control.RouteEditor({
      options: {
        position: {
          left: 10,
          top: 10
        }
      }
    });
    const zoomControl = new ymaps.control.ZoomControl({
      options: {
        position: {
          right: 10,
          top: 43
        },
        size: 'small',
        zoomStep: parseInt(stepYa)
      }
    });

    this.myMap = new ymaps.Map('ymapsMobileObjectMap', {
      center: [la, lo],
      controls: [],
      zoom: parseInt(defaultZoomYa)
    }, {
      suppressMapOpenBlock: true
    });

    this.myMap.controls.add(fullscreenControl);
    this.myMap.controls.add(geolocationControl);
    this.myMap.controls.add(routeEditor);
    this.myMap.controls.add(zoomControl);

    const homePlacemark = new ymaps.Placemark(this.myMap.getCenter(), {}, {
      balloonShadow: false,
      iconLayout: 'default#image',
      iconImageHref: icons.home,
      iconImageSize: [31, 39],
      iconImageOffset: [-16, -45],
      visible: true
    });

    this.myMap.geoObjects.add(homePlacemark);

    this.myMap.options.set('maxZoom', parseInt(maxZoomYa));
    this.myMap.options.set('minZoom', parseInt(minZoomYa));
  }

  render() {
    const {compactDDTitle, context, objectInfo} = this.props;
    const {la, lo} = objectInfo;

    return (
      <div>
        {la && lo ?
          (<CompactDropdown
           collapsed={true}
           context={context}
           title={compactDDTitle}
           titleClassName={style.mapObjectM__compactDDTitle}>
            <div className={style.mapObjectM}>
              <div id='ymapsMobileObjectMap' />
            </div>
          </CompactDropdown>) :
          null
        }
      </div>
    );
  }
}

export default withStyles(style)(MapObjectMView);
