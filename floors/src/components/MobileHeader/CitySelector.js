/**
 * CitySelector for mobile widget class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {forEach, orderBy} from 'lodash';
import s from './CitySelector.scss';
import ContextType from '../../utils/contextType';
import FormControl from 'react-bootstrap/lib/FormControl';

class CitySelector extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    cities: PropTypes.object,
    city: PropTypes.object,
    action: PropTypes.func
  };

  static defaultProps = {
    city: {},
    cities: {}
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      selectedCountry: props.city.country_id
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  onChange = e => {
    const {value, dataset: {field}} = e.target;

    this.setState(() => ({[field]: value}));
  }

  get lists() {
    const {filter, selectedCountry} = this.state;
    const {cities} = this.props;
    const countryList = [], countryIds = [];
    let cityList = [];

    forEach(cities, (item, key) => {
      if(item.office && item.office.should_have_site) {
        let show = false;

        if(filter.length) {
          show = item.name.toLowerCase().indexOf(filter.toLowerCase()) === 0;
        } else {
          show = item.country === parseInt(selectedCountry);
        }
        show && cityList.push({
          id: key,
          name: item.name.split(',')[0],
          site: item.office.site
        });
        if(countryIds.indexOf(item.country) === -1) {
          countryList.push({id: item.country, name: item.country_name});
          countryIds.push(item.country);
        }
      }
    });
    cityList = orderBy(cityList, 'name');
    return {cityList: cityList, countryList: countryList};
  }

  render() {
    const {selectedCountry, filter} = this.state;
    const {cityList, countryList} = this.lists;
    const {action} = this.props;

    return (
      <div className={classNames('mobile-modal', s.root)}>
        <div className={s.title}>Выберите город</div>
        <div className={s.countrySelector}>
          <FormControl
            disabled={filter.length > 0}
            data-field='selectedCountry'
            onChange={this.onChange}
            className={s.countrySelectorControl}
            componentClass="select"
            value={selectedCountry}>
            {countryList.map(item => {
              return (
                <option value={item.id} key={`countryId:${item.id}`}>
                  {item.name}
                </option>
              );
            })}
          </FormControl>
        </div>
        <div className={s.filter}>
          <FormControl
            data-field='filter'
            onChange={this.onChange}
            className={s.filterControl}
            componentClass="input"
            value={filter}
            placeholder='Введите название города'/>
        </div>
        <div className={s.list}>
          {cityList.length > 0 ? cityList.map(item => {
            return (
              <a key={`cityId:${item.id}`} data-action='cityChange'
                data-value={item.id} onClick={action}>
                {item.name}
              </a>
            );
          }) : (
            <div className={s.cityNotFound}>
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CitySelector;
