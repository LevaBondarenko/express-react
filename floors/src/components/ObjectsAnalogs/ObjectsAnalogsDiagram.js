import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {declOfNum} from '../../utils/Helpers';
import Highstock from 'react-highcharts';
import {clone} from 'lodash';
import {connect} from 'react-redux';

class ObjectsAnalogsDiagram extends Component {
  static propTypes = {
    diagramHeight: PropTypes.string,
    currency: PropTypes.object,
    titleX: PropTypes.string,
    titleY: PropTypes.string,
    fieldX: PropTypes.string,
    fieldY: PropTypes.string,
    roundX: PropTypes.string,
    roundY: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  getCource = () => {
    const {currency} = this.props;

    return currency.nominal / currency.value;
  };


  render() {
    /* global data */
    const props = this.props;
    const cource = this.getCource();
    const {fieldX, fieldY, roundX, roundY} = this.props;
    let config = {};

    const {object_id: selfId} = data.options.object || {};
    const baseObject = clone(data.options.object) || {};

    baseObject.price =
      Math.round(baseObject.price * cource).toString();
    let selfX = parseFloat(baseObject[fieldX]);
    let selfY = parseFloat(baseObject[fieldY]);
    let max = 1;
    const s1 = [], s2 = [], s3 = [], matrix = [];

    if(roundX === '1') {
      selfX = Math.round(selfX / 1000);
    }
    if(roundY === '1') {
      selfY = Math.round(selfY / 1000);
    }
    const groupsX = parseInt(props.groupsX);
    const groupsY = parseInt(props.groupsY);
    const deviationX = fieldX === 'price' ?
      props.deviationX * cource :
      props.deviationX;
    const deviationY = fieldY === 'price' ?
      props.deviationY * cource :
      props.deviationY;
    const devX = props.roundX === '1' ?
      Math.round(parseFloat(deviationX) / 1000) :
      parseFloat(deviationX);
    const devY = props.roundY === '1' ?
      Math.round(parseFloat(deviationY) / 1000) :
      parseFloat(deviationY);
    const stepX = devX * 2 / groupsX;
    const stepY = devY * 2 / groupsY;
    const objs = props.objects;

    for(const i in objs) {
      if(objs[i] && objs[i].object_id !== selfId) {
        let x, y;
        const obj = clone(objs[i]);

        obj.price = Math.round(obj.price * cource).toString();
        if(props.roundX === '1') {
          x = Math.round(parseFloat(obj[fieldX]) / 1000);
        } else {
          x = parseFloat(obj[fieldX]);
        }
        if(props.roundY == '1') {
          y = Math.round(parseFloat(obj[fieldY]) / 1000);
        } else {
          y = parseFloat(obj[fieldY]);
        }

        const X = Math.floor((x - (selfX - devX)) / stepX);

        const Y = Math.floor((y - (selfY - devY)) / stepY);

        if(!matrix[X]) {
          matrix[X] = [];
          matrix[X][Y] = {count: 1, ids: [objs[i].object_id]};
        } else if(!matrix[X][Y]) {
          matrix[X][Y] = {count: 1, ids: [objs[i].object_id]};
        } else {
          matrix[X][Y].count++;
          matrix[X][Y].ids.push(objs[i].object_id);
          max = Math.max(matrix[X][Y].count, max);
        }
      }
    }

    for(const x in matrix) {
      if(matrix[x]) {
        for(const y in matrix[x]) {
          if(matrix[x][y]) {
            const X = x * stepX + selfX - devX;
            const Y = y * stepY + selfY - devY;
            const link = matrix[x][y].ids.join('&object_id[]=');

            if(matrix[x][y].count === 1) {
              s1.push({x: X, y: Y, z: 1, l: link});
            } else if(matrix[x][y].count <= max / 2) {
              s2.push({x: X, y: Y, z: matrix[x][y].count, l: link});
            } else {
              s3.push({x: X, y: Y, z: matrix[x][y].count, l: link});
            }
          }
        }
      }
    }

    config = {
      title: {
        text: ''
      },
      xAxis: {
        allowDecimals: false,
        startOnTick: true,
        endOnTick: true,
        gridLineWidth: 1,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return this.value;
          }
        },
        maxPadding: 0.2
      },
      yAxis: {
        allowDecimals: false,
        startOnTick: true,
        endOnTick: true,
        gridLineWidth: 1,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return this.value;
          }
        },
        maxPadding: 0.2
      },
      chart: {
        height: this.props.diagramHeight,
        type: 'scatter',
        plotBorderWidth: 1
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        borderRadius: 10,
        borderWidth: 0,
        shared: true,
        formatter: function() {
          const decls = ['предложение', 'предложения', 'предложений'];

          return this.point.z ?
          `<span><a target="_black" href="${props.searchUrl}?object_id[]=${this.point.l}">${this.point.z} ${declOfNum(this.point.z, decls)} (в новом окне)</a></span>` : // eslint-disable-line max-len
          '<span>Выбранная квартира</span>';
        },
        useHTML: true
      },
      series: [
        {
          stickyTracking: true,
          marker: {
            radius: 3,
            symbol: 'circle'
          },
          color: '#B31521',
          allowPointSelect: true,
          data: s1
        },
        {
          stickyTracking: true,
          marker: {
            radius: 4,
            symbol: 'circle'
          },
          color: '#B31521',
          allowPointSelect: true,
          data: s2
        },
        {
          stickyTracking: true,
          marker: {
            radius: 5,
            symbol: 'circle'
          },
          color: '#B31521',
          allowPointSelect: true,
          data: s3
        },
        {
          stickyTracking: true,
          marker: {
            radius: 4,
            symbol: 'circle'
          },
          color: '#3EAB47',
          allowPointSelect: true,
          data: [{
            x: selfX,
            y: selfY,
            z: 0
          }]
        }
      ]
    };
    return (
      <div>
        <Highstock config = {config} />
        <span>Ось <span>X</span>-{this.props.titleX}</span><br />
        <span>Ось <span>Y</span>-{this.props.titleY}</span>
      </div>
    );
  }
}



function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current,
  };
}

export default connect(mapStateToProps)(ObjectsAnalogsDiagram);
