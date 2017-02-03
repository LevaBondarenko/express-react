/**
 * Map widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */


/*global ymaps*/

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {last, includes, map, isArray, size} from 'lodash';
import request from 'superagent';

import MapMainModal from '../Map/MapMainModal';
import MapStatistics from '../Map/MapStatistics';

import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../actions/WidgetsActions';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import mss from '../../stores/ModularSearcherStore';

/*global ymaps*/
let myMap;

/*eslint camelcase: [2, {properties: "never"}]*/
class Map extends Component {
  static propTypes = {
    coords: PropTypes.string,
    city_id: PropTypes.string,
    city_name: PropTypes.string,
    options: PropTypes.object
  };

  constructor(props) {
    super(props);

    const mapSize = props.options.mapSize ? props.options.mapSize : '2';

    this.state = {
      collection: mss.get('collections').district_id,
      selectedData: [],
      color: '#49bd3b',
      colorHover: '#49bd3b',
      colorActive: '#e31f30',
      colorStroke: '#393f48',
      colorStrokeActive: '#393f48',
      mapSize: mapSize
    };
    this.init = this.init.bind(this);
    this.ic = this.ic.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMouseenter = this.handleMouseenter.bind(this);
    this.handleMouseleave = this.handleMouseleave.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (size(nextState.collection) !== size(this.state.collection)) {
      myMap && myMap.geoObjects && this.ic(nextState.collection);
      return false;
    }

    let lastAdded;
    const lastAddedId = last(nextState.selectedData);

    if(myMap && myMap.geoObjects) {
      myMap.geoObjects.each(geoObject => {
        const district = geoObject.myDistrictsIds || 0;

        if (geoObject.myDistrictsIds === lastAddedId) {
          lastAdded = geoObject;
        }
        if (includes(nextState.selectedData, district.toString())) {
          geoObject.options.set('fillColor', nextState.colorActive);
          geoObject.myColor = nextState.colorActive;
          geoObject.myClickColor = nextState.color;
          geoObject.myCheck = !geoObject.myCheck;
          geoObject.myStrokeColor = nextState.colorStrokeActive;
        } else {
          geoObject.options.set('fillColor', nextState.color);
          geoObject.myColor = nextState.color;
          geoObject.myClickColor = nextState.colorActive;
          geoObject.myCheck = !geoObject.myCheck;
          geoObject.myStrokeColor = nextState.colorStroke;
        }
      });

      if (typeof lastAdded !== 'undefined' && lastAdded !== '') {
        myMap.panTo(lastAdded.geometry.getBounds()[0]);
      }
    }

    return false;
  }

  componentDidMount() {
    ymaps.ready(this.init);
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange() {
    this.setState(() => ({
      collection: mss.get('collections').district_id,
      selectedData: mss.get('district_id')
    }));
  }

  init() {
    const {collection} = this.state;
    let coords = this.props.coords.split(',');

    coords = coords.map(item => parseFloat(item));
    myMap = new ymaps.Map('mainMapWidget', {
      center: [coords[1], coords[0]],
      zoom: 11,
      controls: ['zoomControl']
    });

    myMap.controls.add('zoomControl', {
      zoomStep: 4,
      visible: true,
      left: 200,
      top: 200
    });
    collection.length && this.ic(collection);
    myMap.options.set('minZoom', 10);
    myMap.options.set('maxZoom', 14);
    myMap.behaviors.disable('dblClickZoom');
    myMap.behaviors.disable('scrollZoom');

  }

  handleChange(event) {
    if (event.get('target').mySetting[2]) {
      const t = event.get('target').myColor;

      event
        .get('target')
        .options
        .set('fillColor', event.get('target').myClickColor);
      event
        .get('target')
        .options
        .set('strokeColor', event.get('target').myStrokeColor);
      event
        .get('target')
        .myColor = event.get('target').myClickColor;
      event
        .get('target')
        .myClickColor = t;
      event
        .get('target')
        .myCheck = !event.get('target').myCheck;
    }
    ModularSearcherActions.toggle(
      'district_id',
      event.get('target').myDistrictsIds
    );
  }

  handleMouseenter(event) {
    event
      .get('target')
      .options
      .set('fillColor', event.get('target').myHoverColor);
  }

  handleMouseleave(event) {
    event
      .get('target')
      .options
      .set('fillColor', event.get('target').myColor);
  }

  ic(collection) {
    const AllPolygons = [];
    const modelCitiesIds = mss.get('city_id');
    const modelCityId = isArray(modelCitiesIds) ? modelCitiesIds :
      [modelCitiesIds];
    const citiesIds = modelCitiesIds ? modelCityId : [this.props.city_id];
    const distrIds = map(collection, distr => distr.id);
    const self = this;
    const args = {
      action: 'get_map_areas',
      city: citiesIds,
      districtsIds: distrIds,
      lvl: self.state.mapSize
    };

    request
      .post('/backend/')
      .query(args)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if(err || (!res || !res.ok || res.error)) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          const data = JSON.parse(res.text);

          myMap.geoObjects.removeAll();

          for (let i = 0; i < data.length; i++) {
            var properties = {};

            if (data[i].settings[0]) {
              properties.hintContent = data[i].name;
            }

            if (data[i].settings[1]) {
              properties.balloonContent = data[i].balloonContent;
            }

            AllPolygons[data[i].id] = new ymaps.Polygon(
                [data[i].coordinates],
                properties, {
                  fillColor: self.state.color,
                  strokeWidth: '3',
                  strokeColor: self.state.colorStroke,
                  strokeStyle: data[i].params.strokeStyle,
                  opacity: data[i].params.opacity
                }
            );

            AllPolygons[data[i].id].myCoordinates = data[i].coordinates;
            AllPolygons[data[i].id].myDistrictsIds = data[i].district_id;
            AllPolygons[data[i].id].myСityID = data[i].city_id;
            AllPolygons[data[i].id].myId = data[i].id;
            AllPolygons[data[i].id].myStrokeColor = self.state.colorStroke;
            AllPolygons[data[i].id].myStrokeWidth = '3';
            AllPolygons[data[i].id].myStrokeStyle =
             data[i].params.strokeStyle;
            AllPolygons[data[i].id].myOpacity = '0.62';
            AllPolygons[data[i].id].myHoverColor = self.state.colorActive;
            AllPolygons[data[i].id].myColor = self.state.color;
            AllPolygons[data[i].id].myIsEdit = 0;
            AllPolygons[data[i].id].myClickColor = self.state.colorActive;
            AllPolygons[data[i].id].myCheck = false;
            AllPolygons[data[i].id].mySetting = data[i].settings;
            AllPolygons[data[i].id].myHame = data[i].name;
            AllPolygons[data[i].id].myLvl = data[i].level;
            AllPolygons[data[i].id].myParent = data[i].parent_id;
            if (data[i].settings[3]) {
              AllPolygons[data[i].id]
                .events
                .add('mouseenter', self.handleMouseenter);
              AllPolygons[data[i].id]
                .events
                .add('mouseleave', self.handleMouseleave);
            }
            if (data[i].settings[2]) {
              AllPolygons[data[i].id].events.add('click', self.handleChange);

            }

            if (includes(
                  self.state.selectedData, data[i].district_id.toString()
                )
              ) {

              AllPolygons[data[i].id]
                .options
                .set('fillColor', self.state.colorActive);
              AllPolygons[data[i].id].myColor = self.state.colorActive;
              AllPolygons[data[i].id].myClickColor = self.state.color;
              AllPolygons[data[i].id].myCheck =
               !AllPolygons[data[i].id].myCheck;
            }
            myMap.geoObjects.add(AllPolygons[data[i].id]);
          }
        }
      });
  }

  render() {
    const divStyle = {
      width: '100%',
      height: '400px'
    };

    return (
      <div className='mainMapWidget'>
        <div id='mainMapWidget' style={divStyle}/>
        <div className='container-wide'>
          <Row>
            <Col xs={12} md={8}>
              <MapMainModal />
            </Col>
            <Col xs={12} md={4}>
              <MapStatistics
                cityName={this.props.city_name}/>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Map;
