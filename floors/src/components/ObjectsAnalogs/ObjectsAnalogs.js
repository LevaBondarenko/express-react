/**
 * Object's Analogs component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getObjects} from '../../utils/requestHelpers';
import {map, size} from 'lodash';
import ObjectsAnalogsDiagram from './ObjectsAnalogsDiagram';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../actions/WidgetsActions';

/*global data*/

class ObjectsAnalogs extends Component {

  static propTypes = {
    deviationX: React.PropTypes.string,
    deviationY: React.PropTypes.string,
    fieldX: React.PropTypes.string,
    fieldY: React.PropTypes.string,
    titleX: React.PropTypes.string,
    titleY: React.PropTypes.string,
    title: React.PropTypes.string,
    searchUrl: React.PropTypes.string,
    maxObjects: React.PropTypes.string,
    diagramHeight: React.PropTypes.string,
    showLink: React.PropTypes.string,
    dataSource: React.PropTypes.string,
    like: React.PropTypes.array
  };

  constructor(props) {
    super(props);
    const filter = {};
    let devX, devY;
    const like = props.like;
    const dataSource = parseInt(props.dataSource) || 0;
    let analogObjects = data.object.info.analogs || [];

    like.push({
      param: props.fieldX,
      percent: props.deviationX.indexOf('%') !== -1,
      deviation: props.deviationX.indexOf('%') !== -1 ?
        props.deviationX.slice(0, -1) :
        props.deviationX
    });
    like.push({
      param: props.fieldY,
      percent: props.deviationY.indexOf('%') !== -1,
      deviation: props.deviationY.indexOf('%') !== -1 ?
        props.deviationY.slice(0, -1) :
        props.deviationY
    });
    for(const l in like) {
      if(like[l]) {
        const param = like[l].param;
        const percent = like[l].percent;
        let deviation = parseFloat(like[l].deviation);

        if(percent) {
          deviation = Math.floor(
            parseInt(data.object.info[param]) * deviation / 100
          );
        }

        if(param !== 'distance') {
          filter[`${param}_min`] =
            parseInt(data.object.info[param]) - deviation;
          filter[`${param}_max`] =
            parseInt(data.object.info[param]) + deviation;
        } else {
          filter.distance = deviation;
          filter.la = data.object.info.la;
          filter.lo = data.object.info.lo;
        }
        if(param === props.fieldX) {
          devX = deviation;
        }
        if(param === props.fieldY) {
          devY = deviation;
        }
        filter.class = data.object.info.table;
        filter['city_id'] = data.options.cityId;
      }
    }
    filter.limit = props.maxObjects;

    if (dataSource === 1 && typeof(data.object.info) === 'object') {
      analogObjects = analogObjects.slice(1, -1);
      analogObjects = analogObjects && analogObjects.length > 0 ?
        analogObjects.split(',') : null;
      if (analogObjects) {
        const filterNew = {};

        filterNew['object_id'] = analogObjects;
        filterNew.class = data.object.info.table;
        getObjects(filterNew).then((response) => {
          if (response.objects) {
            this.setState(() => ({
              objects: response.objects,
              isLoading: false
            }));
          } else {
            getObjects(filter).then((response) => {
              this.setState(() => ({
                objects: response.objects,
                isLoading: false
              }));
            }, (error) => {
              error; //do nothing
            });
          }
        }, (error) => {
          error; //do nothing
        });
      }
    }

    if (!analogObjects || dataSource === 0) {
      getObjects(filter).then((response) => {
        this.setState(() => ({
          objects: response.objects,
          isLoading: false
        }));
      }, (error) => {
        error; //do nothing
      });
    }
    this.state = {
      filter: filter,
      deviationX: devX,
      deviationY: devY,
      objects: [],
      isLoading: true
    };
  }

  show() {
    const storeValue = this.props.searchUrl.split('.');

    WidgetsActions.set(storeValue[0], storeValue[1]);
  }

  render() {
    const isLoading = this.state.isLoading;
    let  link = '';

    const style = {
      margin: '1rem',
      marginTop: 0,
      height: isLoading || size(this.state.objects) < 1 ? '200px' : 'auto'
    };

    if(this.props.showLink === '1') {
      const ids = map(this.state.objects, o => o.object_id);

      link = (
        <a
          target='_blank'
          href={
            `${this.props.searchUrl}?object_id[]=${ids.join('&object_id[]=')}`
          }
          onClick={this.show.bind(this)}>
          Показать (в новом окне)
        </a>
      );
    }

    return isLoading || size(this.state.objects) ? (
      <div style={style}>
        <h4>{this.props.title} {isLoading ? null : link}</h4>
        {isLoading ?
          <div
            className="loader-inner ball-clip-rotate preloader">
            <div style={{
              borderColor: '#3eab47 !important',
              borderBottomColor: 'transparent !important'
            }} />
          </div> :
          <ObjectsAnalogsDiagram
            {...this.props}
            objects={this.state.objects}
            deviationX={this.state.deviationX}
            deviationY={this.state.deviationY} />}
      </div>
    ) : (
      <div style={style}/>
    );
  }
}

export default ObjectsAnalogs;
