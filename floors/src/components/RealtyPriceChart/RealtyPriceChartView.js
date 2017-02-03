/**
 * Realty price chart widget presentational component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RealtyPriceChartView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Highstock from 'react-highcharts';

const RealtyPriceChartView = (props) => {
  const {
    highchartData: {
      configChart,
      highchartsOptions,
      noData
    }
  } = props;

  Highstock.Highcharts.setOptions(highchartsOptions);

  return (
    <div className={style.realtyPriceChart}>
      {!noData ?
        <Highstock config={configChart} /> :
        'За данный период данные отсутствуют'
      }
    </div>
  );

};

export default withStyles(style)(RealtyPriceChartView);

RealtyPriceChartView.propTypes = {
  highchartData: PropTypes.object
};
