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
import s from './CitySelectorCountry.scss';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map} from 'lodash';

class CitySelectorCountry extends Component {
  static propTypes = {
    countryId: PropTypes.number,
    countries: PropTypes.array,
    toggleCountry: PropTypes.func,
    query: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {countryId, query, toggleCountry, countries} = this.props;

    return (
      <div className={s.citySelector__countries}>
        {map(countries, country => {
          const classnames = classNames({
            [s.citySelector__list__disabled]: query !== '',
            [s.citySelector__list__link]: query === '',
            [s.activeLink]: query === '' && country.id === countryId
          });

          return (<a key={country.id}
              className={classnames}
              onClick={toggleCountry}
              data-country={country.id}
              href='#'>
            {country.name}
          </a>);
        })}
      </div>
    );
  }
}

export default withStyles(s)(CitySelectorCountry);
