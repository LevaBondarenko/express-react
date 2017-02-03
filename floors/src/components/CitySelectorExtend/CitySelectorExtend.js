/**
 * City Select Extend component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Button from 'react-bootstrap/lib/Button';
import shallowCompare from 'react-addons-shallow-compare';
import classNames from 'classnames';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';
import Modal from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import s from './CitySelectorExtend.scss';
import {filter, sortBy, find, map, uniqBy} from 'lodash';
import CitySelectorList from './CitySelectorList';
import CitySelectorCountry from './CitySelectorCountry';
import Helpers from '../../utils/Helpers';
import emptyFunction from 'fbjs/lib/emptyFunction';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

const ModalBody = Modal.Body;

/* global data */

class CitySelectorExtend extends Component {
  static propTypes = {
    id: PropTypes.string,
    storeProperty: PropTypes.string,
    'selected_city': PropTypes.object,
    cities: PropTypes.array,
    countries: PropTypes.array,
    redirect: React.PropTypes.string,
    display: React.PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  };



  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedCity: data.options.selectedCity,
      cities: [],
      selectedCountry: {},
      coords: {},
      open: false,
      query: '',
      firstToggle: false
    };

    if(parseInt(props.redirect) && data.object.info && canUseDOM) {
      if(data.object.infocity_id &&
        parseInt(data.object.info.city_id) !==
        parseInt(props.selected_city.city_id)) {
        for(const i in props.cities) {
          if(props.cities[i] && parseInt(props.cities[i].city_id) ===
            parseInt(data.object.info.city_id)) {
            window.location.host = props.cities[i].site;
          }
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    WidgetsActions.set(this.props.storeProperty || this.props.id,
      this.props.selected_city);
    wss.onChange(this.onChange);

    const actualCountries = [];
    const uniqCities = uniqBy(
      sortBy(this.props.cities, item => { return -item.should_have_site; }),
      'city_id'
    );
    let maxCities = 0;

    map(this.props.countries, (country) => {
      const hasCities = filter(uniqCities, item => {
        return item.country_id === country.id && (
          (parseInt(item.should_have_site) && item.site && item.office_phone) ||
          item.city_id === this.state.selectedCity.city_id
        );
      });

      if (hasCities.length) {
        maxCities < hasCities.length && (maxCities = hasCities.length);
        actualCountries.push(country);
      }
    });

    const selectedCountry = find(
      actualCountries,
      {id: parseInt(this.state.selectedCity.country_id)}
    );
    let open = this.props.display === '1' ?
        (Helpers.getCookie('selected_city') ? false : true) : false;

    open = window.location.host.includes('mtproxy') &&
      window.location.host.includes('yandex') ? false : open;

    this.setState(() => ({
      maxCities: maxCities,
      countries: actualCountries,
      open: open,
      selectedCity: wss.get()[this.props.storeProperty || this.props.id] ||
        this.props.selected_city,
      cities: uniqCities,
      selectedCountry: wss.get()['selectedCountry'] || selectedCountry,
    }));
    window.addEventListener('hashchange', this.onHashChange, false);
    this.onHashChange();
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
    this.removeCss();

  }

  onChange = () => {
    this.setState({
      selectedCity: wss.get()[this.props.storeProperty || this.props.id] ||
        this.props.selected_city
    });
  };

  onHashChange =() => {
    const hash = canUseDOM && window.location.hash ?
            window.location.hash.replace('#', '') : null;

    if(hash === 'cityselect') {
      window.location.hash = '';
      this.toggleModal();
    }
  };

  toggleModal = () => {
    if (this.state.open && canUseDOM) {
      const cookieDomain = window.location.host.replace(/^[^.]*/, '');
      const cityDomain =
        this.state.selectedCity.site.split('.')[0].replace(/%\d*\s*"/g, '');


      Helpers.setCookie('selected_city', cityDomain, {
        domain: cookieDomain,
        expireDays: 30,
        path: '/'
      });
    }

    this.setState({
      open: !this.state.open,
      firstToggle: this.state.firstToggle ? this.state.firstToggle : true
    });

    if(!this.state.firstToggle) {
      const selectedCountry = find(
        this.state.countries,
        {id: parseInt(this.state.selectedCity.country_id)}
      );

      WidgetsActions.set('selectedCountry', selectedCountry);
    }
  };

  toggleCountry = (event, country = false) => {
    const countryId = event ? event.target.dataset.country : country;
    const {query} = this.state;

    if(query === '') {
      this.setState({
        selectedCountry: filter(this.state.countries,
            country => country.id === parseInt(countryId))[0]
      },
        this.filterList(query, countryId)
      );
    }

    if(event) {
      event.preventDefault();
    }
  };


  searchCity = (event) => {
    const query = event.target.value;

    this.setState({query: query},
      this.filterList(query)
    );
  };

  filterList = (query) => {
    let newCitiesList = [];
    const uniqCities = uniqBy(
      sortBy(this.props.cities, item => { return -item.should_have_site; }),
      'city_id'
    );

    if (query.length && query.length === 1) {
      newCitiesList = filter(uniqCities, city => {
        if (
          city.name
            .toString()
            .toLowerCase()
            .charAt(0) === query.toLowerCase()) {
          return city;
        }
      });
    } else {
      newCitiesList = filter(uniqCities, city => {
        if (
          city.name
            .toString()
            .toLowerCase()
            .indexOf(query.toLowerCase()) !== -1) {
          return city;
        }
      });
    }

    this.setState({
      currentCity: newCitiesList[0] ? newCitiesList[0] : {},
      cities: query.length ?
        newCitiesList : sortBy(uniqCities, city => city.name)
    });
  };

  selectCity() {
    const city = arguments[0].id ?
      filter(this.state.cities, city => city.city_id === arguments[0].id)[0] :
      this.state.selectedCity;
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');
    const cityDomain = city.site.split('.')[0].replace(/%\d*\s*"/g, '');

    Helpers.deleteCookie('selected_city');
    Helpers.setCookie('selected_city', cityDomain, {
      domain: cookieDomain,
      expireDays: 30,
      path: '/'
    });


    const selectedCity = this.state.selectedCity;
    const isMyCity = city.city_id === selectedCity.city_id;

    this.setState({
      query: ''
    });
    this.toggleCountry(false, city.country_id);
    if (!isMyCity) {
      if (city.site) {
        window.location.href = Helpers.getEnv() === 'dev' ?
          `//${city.site.replace('.com', '.dev')}` : `//${city.site}`;;
      }
    } else {
      this.setState({
        open: false
      });
    }
  }

  get cities() {
    const cityNames = [];
    const cities = filter(this.state.cities, city => {
      if (cityNames.indexOf(city.name) === -1) {
        if (parseInt(city.should_have_site) && city.site && city.office_phone) {
          cityNames.push(city.name);
          return city;
        }
      }
    });

    if (!this.state.query) {
      cities.unshift(this.state.selectedCity);
    }

    return cities;
  }

  get isMobile() {
    if(canUseDOM && (window.innerWidth <= 1024 || Helpers.isMobile())) {
      return true;
    } else {
      return false;
    }
  }

  get filterCities() {
    const keys = [], cgroups = [];
    const {
      cities, selectedCountry: {id: countryId}, query
    } = this.state;
    let filteredCount = 0;

    for (const i in cities) {
      if (cities.hasOwnProperty(i)) {
        if(parseInt(cities[i].should_have_site) && cities[i].site &&
          cities[i].office_phone) {
          const lt = cities[i].name.charAt(0);

          if(query !== '' ||
            parseInt(countryId) === parseInt(cities[i].country_id)) {
            filteredCount++;
            if(cgroups[lt]) {
              cgroups[lt].push({
                name: cities[i].name,
                id: cities[i].city_id,
                site: cities[i].site
              });
            } else {
              cgroups[lt] = [{
                name: cities[i].name,
                id: cities[i].city_id,
                site: cities[i].site
              }];
              keys.push(lt);
            }
          }
        }
      }
    }

    keys.sort();

    return {
      cgroups: cgroups,
      keys: keys,
      filteredCount
    };
  }

  render() {
    const {name} = this.state.selectedCity || {};
    const isMobile = this.isMobile;
    const filterCities = this.filterCities;
    const {maxCities} = this.state;
    const cityHeight = Math.ceil(maxCities / 3) * 29; //it's a magic number, don't change it

    return (
      <div className={s.root}>
        <Button onClick={this.toggleModal}
          bsStyle='link'
          className={s.btn}>
          Город <span className={s.btn__name}>{name}</span>
        </Button>
        <Modal
          className={classNames({
            [s.modalWrap]: true,
            [s.mobileModalWrap]: isMobile,
            wide: true
          })}
          show={this.state.open}
          onHide={this.toggleModal} >
          <button onClick={this.toggleModal} className="etagi--closeBtn">
            <span aria-hidden="true">&times;</span>
          </button>
          <ModalBody>
            <div className={s.citySelectorWrapper}>
              <div className={s.citySelector__header}>
                <div className={s.citySelector__title}>
                  Выберите город из списка
                </div>
                <div className={s.citySelector__input}>
                  <input type="text"
                      id='textSearch'
                      ref='textSearch'
                      className='form-etagi form-bordered form-100percent'
                      placeholder='Поиск по городам'
                      value={this.state.query}
                      onChange={this.searchCity} />
                </div>
              </div>
              <div ref="citySelector_cities"
                className={s.citySelector__cities}>
                <Row>
                  <Col xs={isMobile ? 5 : 3}>
                    <div className={s.citySelector__subheader}>
                      <h3>
                        Страна
                      </h3>
                    </div>
                    <CitySelectorCountry countries={this.state.countries}
                      countryId={this.state.selectedCountry.id}
                      toggleCountry={this.toggleCountry}
                      query={this.state.query}/>
                  </Col>
                  <Col xs={isMobile ? 7 : 9}>
                    <div className={s.citySelector__subheader}>
                      <h3>
                        Город
                      </h3>
                    </div>
                    <div>
                    <CitySelectorList
                      filterCities={filterCities}
                      isMobile={isMobile}
                      selectedCity={this.state.selectedCity}
                      countryId={this.state.selectedCountry.id}
                      selectCity={this.selectCity.bind(this)}
                      cityHeight={cityHeight}/>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default CitySelectorExtend;
