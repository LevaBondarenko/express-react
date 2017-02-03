/**
 * City Select List component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import s from './CitySelectorList.scss';
import classNames from 'classnames';
import {map} from 'lodash';
import GeminiScrollbar from 'react-gemini-scrollbar';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

class CitySelectorList extends Component {
  static propTypes = {
    cities: PropTypes.array,
    selectedCity: PropTypes.object,
    countryId: PropTypes.number,
    selectCity: PropTypes.func,
    query: PropTypes.string,
    cityHeight: PropTypes.number,
    isMobile: PropTypes.bool,
    filterCities: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  mapCGroup(cgroup) {
    return map(cgroup, city => {
      const classnames = classNames({
        [s.citySelector__list__link]: true,
        [s.activeLink]: city.id === this.props.selectedCity.city_id
      });

      return (
        <noindex key={`${city.id}`}>
          <a rel='nofollow'
              className={classnames}
              onClick={this.props.selectCity.bind(this, city)}>
            <span>
              {city.name.split(', ')[0]}
            </span>
          </a>
        </noindex>
      );
    });
  }

  get citiesList() {
    const {cgroups, keys, filteredCount} = this.props.filterCities;
    const {cityHeight} = this.props;
    let result = [];

    if(filteredCount) {
      const maxCitiesInCol = Math.floor(cityHeight / 29); //it's a another magic number, don't change it
      let citiesInCol = 0;

      keys.forEach(key => {
        const cgroup = cgroups[key];
        const citiesToMaxCol = maxCitiesInCol - citiesInCol;

        if(citiesToMaxCol === 0 || cgroup.length <= citiesToMaxCol) {
          result.push(
            <div className='clearfix' key={key}>
              <span className={s.citySelector__list__char}>{key}</span>
              {this.mapCGroup(cgroup)}
            </div>
          );
          citiesInCol = citiesToMaxCol ? (citiesInCol + cgroup.length) : 0;
        } else {
          result.push(
            <div className='clearfix' key={key}>
              <span className={s.citySelector__list__char}>{key}</span>
              {this.mapCGroup(cgroup.slice(0, citiesToMaxCol))}
            </div>
          );
          result.push(
            <div className='clearfix' key={`${key}-1`}>
              <span className={s.citySelector__list__char}>{key}</span>
              {this.mapCGroup(cgroup.slice(citiesToMaxCol))}
            </div>
          );
          citiesInCol = cgroup.length - citiesToMaxCol;
        }
      });
    } else {
      result = (
        <div className="citySelector_nothingFound">Ничего не найдено</div>
      );
    }

    return result;
  }

  get scrollHeight() {
    return canUseDOM && window.innerHeight > 600 ?
      (canUseDOM && window.innerHeight > 750 ? 500 :
        window.innerHeight - 250) :
        120;
  }

  render() {
    const {isMobile} = this.props;

    return (
      <div>
        {window.innerHeight <= 700 && !isMobile ? (
          <GeminiScrollbar
            style={{height: `${this.scrollHeight}px`}}
            ref='citiesList'>
            <div className={s.citySelector__list}>
               {this.citiesList}
            </div>
          </GeminiScrollbar>
        ) : (
          <div
            style={{height: isMobile ? null : `${this.props.cityHeight}px`}}
            className={classNames({
              [s.citySelector__list]: true,
              [s.citySelector__list__mobile]: isMobile
            })}>
              {this.citiesList}
          </div>
        )}
       </div>
    );
  }
}

export default withStyles(s)(CitySelectorList);
