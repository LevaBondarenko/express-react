/**
 * Order widget class
 *
 * @ver 0.0.1
 * @author tatarchuk
 */
/*eslint camelcase: [2, {properties: "never"}]*/
import React, {Component, PropTypes} from 'react';
import {each} from 'lodash';
import moment from 'moment/moment';

import Highcharts from 'react-highcharts';

class Analytics extends Component {

  static propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    inform: PropTypes.string,
    data: PropTypes.object,
    name_1: PropTypes.string,
    name_2: PropTypes.string,
    notice: PropTypes.string
  };

  render() {
    const self = this;
    const aType = this.props.type;
    const aTitle = this.props.title;
    const aInform = this.props.inform;
    const xAxis = [];
    const yAxis = [];
    let offsetBottom;
    let config;

    switch (aType) {
    case 'column':
      each(this.props.data.first, v => {
        yAxis.push(v.key);
        xAxis.push(+v.value);
      });
      offsetBottom = {'marginBottom': '5rem'};
      config = {
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            pointWidth: 16,
            color: '#595562',
            states: {
              hover: {
                enabled: false
              }
            }
          }
        },
        chart: {
          type: 'column',
          height: 150
        },
        title: {
          text: ''
        },
        tooltip: {
          backgroundColor: '#fff',
          borderWidth: 0,
          style: {
            color: '#595562'
          },
          headerFormat: '<table>',
          pointFormat: '<tr><td style="text-align: right">' +
            '<b>{point.y} %</b></td></tr>',
          footerFormat: '</table>'
        },
        xAxis: {
          categories: yAxis,
          lineColor: '#494e58',
          tickWidth: 0
        },
        credits: {
          enabled: false
        },
        series: [{
          data: xAxis
        }, {
          type: 'spline',
          data: xAxis,
          lineWidth: 0,
          tooltip: {
            backgroundColor: '#ccc',
            borderWidth: 0,
            style: {
              color: '#fff'
            },
            headerFormat: '<table>',
            pointFormat: '<tr><td style="text-align: right">' +
              '<b>{point.y} %</b></td></tr>',
            footerFormat: '</table>'
          },
          marker: {
            lineWidth: 2,
            lineColor: '#fff',
            fillColor: '#ccc',
            radius: 7
          }
        }],
        yAxis: {
          labels: {
            formatter: function() {
              return this.value;
            }
          },
          title: {
            text: null
          },
          gridLineDashStyle: 'longdash'
        },
        exporting: {enabled: false}
      };
      break;
    case 'circle':
      each(this.props.data.first, v => xAxis.push([v.key, +v.value]));
      config = {
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          symbolPadding: 10,
          lineHeight: 40,
          itemMarginTop: 3,
          itemMarginBottom: 3
        },
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: 0,
          backgroundColor: 'transparent',
          plotShadow: false,
          height: 200
        },
        title: {
          text: ''
        },
        tooltip: {
          backgroundColor: '#fff',
          borderWidth: 0,
          style: {
            color: '#333'
          },
          headerFormat: '<table>',
          pointFormat: '<tr><td style="text-align: right">' +
          '{point.name} <b>{point.percentage:.1f}%</b></td></tr>',
          footerFormat: '</table>'
        },
        credits: {
          enabled: false
        },
        labels: {
          html: '<p>3434223</p>',
          style: {
            color: '#3E576F'
          }
        },
        plotOptions: {

          pie: {
            colors: ['#595562', '#cccccc', '#a6adbc', '#767e8d'],
            point: {
              events: {
                legendItemClick: function() {
                  return false;
                },
                unselect: function() {
                  let percentInt = '';
                  let namePie = '';

                  each(this.series.data, v => {
                    if (v.selected) {
                      percentInt = v.percentage.toFixed(1);
                      namePie = v.name;
                    }
                  });
                  const span = `<span class="pieChartName" title="${namePie}">${namePie}</span><span class="pieChartPercent">${percentInt}%</span>`; // eslint-disable-line max-len

                  $(`#analytics_${self.props.id} .pieChartInfoText`).html(span);
                },
                select: function() {
                  let persent = '';
                  let namePie = '';

                  each(this.series.data, v => {
                    if (v.selected) {
                      persent = v.percentage.toFixed(1);
                      namePie = v.name;
                    }
                  });

                  persent = persent > 0 ? persent : this.percentage.toFixed(1);
                  namePie = namePie ? namePie : this.name;

                  var chart = this.series.chart;

                  const textX = chart.plotLeft + (chart.plotWidth * 0.5);
                  const textY = chart.plotTop + (chart.plotHeight * 0.5);
//
                  var span = `<span style="font-size: 14px; width: 35px; display: block; position: relative; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" title="${namePie}">${namePie}</span><span style="font-size: 16px;">${persent}%</span>`; // eslint-disable-line max-len

                  $(`#analytics_${self.props.id} .pieChartInfoText`).html(span);

                  span = $('.pieChartInfoText');
                  span.css('left', textX + (span.width() * -0.5));
                  span.css('top', textY + (span.height() * -0.5));
                }
              }
            },

            allowPointSelect: true,
            cursor: 'pointer',
            showInLegend: true,
            dataLabels: {
              enabled: false
            },
            startAngle: 0,
            endAngle: 360,
            center: ['50%', '50%'],
            innerSize: '60%',
            size: '75%',
            states: {
              hover: {
                lineWidthPlus: 2
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Browser share',
          data: xAxis
        }],
        exporting: {enabled: false}

      };

      break;
    case 'chart':
      var i = 1;

      each(this.props.data, v => {
        xAxis[i] = [];
        each(v, v2 => {
          yAxis.push(moment(v2.key).locale('ru').format('MMMM \'YY'));
          xAxis[i].push(+v2.value);
        });
        i++;

      });

      config = {
        title: {
          text: ''
        },
        xAxis: {
          categories: yAxis,
          lineColor: '#494e58',
          tickWidth: 0
        },
        yAxis: {

          title: {
            text: null
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }],
          labels: {
            align: 'right',
            format: '{value:.,0f}'
          },
          gridLineDashStyle: 'longdash'
        },
        chart: {
          height: 200
        },
        credits: {
          enabled: false
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'top',
          borderWidth: 0
        },
        series: [{
          name: this.props.name_1,
          data: xAxis[1],
          color: '#595562',
          tooltip: {
            backgroundColor: '#ccc',
            borderWidth: 0,
            style: {
              color: '#fff'
            },
            headerFormat: '<table>',
            pointFormat: '<tr><td style="text-align: right">' +
              '<b>{point.y} руб</b></td></tr>',
            footerFormat: '</table>'
          },
          marker: {
            lineWidth: 2,
            lineColor: '#595562',
            fillColor: '#fff',
            radius: 4,
            symbol: 'circle',
            states: {
              hover: {
                fillColor: '#595562',
                radiusPlus: 0
              }
            }
          }
        }, {
          name: this.props.name_2,
          data: xAxis[2],
          color: '#ccc',
          tooltip: {
            backgroundColor: '#ccc',
            borderWidth: 0,
            style: {
              color: '#fff'
            },
            headerFormat: '<table>',
            pointFormat: '<tr><td style="text-align: right">' +
              '<b>{point.y} руб</b></td></tr>',
            footerFormat: '</table>'
          },
          marker: {
            lineWidth: 2,
            lineColor: '#ccc',
            fillColor: '#fff',
            radius: 4,
            symbol: 'circle',
            states: {
              hover: {
                fillColor: '#ccc',
                radiusPlus: 0
              }
            }
          }
        }],
        exporting: {enabled: false}
      };
      break;
    default :
      config = '';
    }

    const textChart = this.props.notice ?
      (<div className="analytics--chartDescription">
        <p className="text--alert">
          <span>{this.props.notice}</span>
        </p>
      </div>) : <span />;

    const tooltipChart = aType === 'circle'  ?
      <span className="pieChartInfoText" /> : null;

    return (
      <div>
        <div className="analytics--titlegroup" style={offsetBottom}>
          <h3 >{aTitle}</h3>
          <h4>{aInform}</h4>
        </div>
        <div style={{position: 'relative'}}>
          {tooltipChart}
          <Highcharts config = {config} />
        </div>
        {textChart}
      </div>
    );
  }
}

export default Analytics;
