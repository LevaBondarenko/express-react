/**
 * Geo Location Block for mobile widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {PropTypes} from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GeoLocationBlock.scss';

const GeoLocationBlock = (props) => {
  const {cities, nearestCity, action} = props;

  return (
    <div className={s.root}>
      <span className={s.close} onClick={action} data-action='geoCancel'/>
      {nearestCity ? (
        <div className={s.nearestCity}>
          <div className={s.mapMarker}/>
          <div className={s.cityContainer}>
            <span>Ищете недвижимость в</span>
            <span>{cities[nearestCity].office.name_prepositional}?</span>
          </div>
          <div className={s.actions}>
            <a className={s.yes}
              onClick={action}
              data-action='geoAccept'>
              Да, верно
            </a>
            <a className={s.no}
              onClick={action}
              data-action='geoDecline'>
              Нет, сменить город
            </a>
          </div>
        </div>
      ) : (
        <div className={s.wait}>
          <span>Определение местоположения</span>
          <div className={classNames(s.loader, 'loader-inner', 'ball-pulse')}>
            <div/><div/><div/>
          </div>
        </div>
      )}
    </div>
  );
};

GeoLocationBlock.propTypes = {
  cities: PropTypes.object,
  nearestCity: PropTypes.number,
  geoFailed: PropTypes.bool,
  action: PropTypes.func
};

export default withStyles(s)(GeoLocationBlock);
