/**
 * Search subscribe widget container component
 *
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import moment from 'moment/moment';
import {extend, clone} from 'lodash';
import ga from '../../utils/ga';

import mss from '../../stores/ModularSearcherStore';
import userStore from '../../stores/UserStore';

import UserActions from '../../actions/UserActions';
import FilterSettingsStore from '../../stores/FilterSettingsStore';

import SearchSubscribeForm from './SearchSubscribeForm';

/* global data */


class SearchSubscribe extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    })
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
      subscribed: false,
      wasUnauthorized: false
    };
  }

  componentDidMount() {
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    this.setState({
      isAuthorized: userStore.get('isAuthorized'),
    });
  }

  subscribe = (event) => {
    const {isAuthorized, wasUnauthorized} = this.state;
    const model = clone(extend(
      mss.get(), FilterSettingsStore.get('filterFields')
    ));
    const objClass = model.class;
    const classTypes = {
      cottages: 'realty_out',
      flats: 'realty',
      nh_flats: 'zastr', // eslint-disable-line camelcase
      offices: 'commerce',
      rent: 'realty_rent'
    };
    const eventName = classTypes[objClass];

    event.preventDefault();
    if (isAuthorized) {
      const dateFormatted =
      (new Date(
        `${moment().format('YYYY-MM-DD')}T10:00:00+0500`
      ))
        .toLocaleString('ru', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      const subscriptionName = `Подписка от ${dateFormatted}`;

      model.city_id = model.city_id || data.options.cityId || 23; // eslint-disable-line camelcase
      model.count = null;
      model.count_houses = null; // eslint-disable-line camelcase
      model.collections = null;
      model.count = null;
      model.order = null;
      model.class = null;
      model.isLoading = null;
      model.date_create_min = null; // eslint-disable-line camelcase

      UserActions.create(
        {
          filter: JSON.stringify(model, (key, value) => {
            if(typeof value === 'number') {
              return value.toString();
            }
            if(value) {
              return value;
            }
          }),
          name: subscriptionName,
          class: objClass,
          notifications: 1,
          notifications_email: 1 //eslint-disable-line camelcase
        },
        'searches'
      );

      if (wasUnauthorized) {
        this.setState({
          wasUnauthorized: false
        });

        ga('event', `site_search_${eventName}_podpiski_unauthorized_success`);
      } else {
        ga('event', `site_search_${eventName}_podpiski_authorized_success`);
      }

      this.setState({
        subscribed: true
      });

      setTimeout(() => {
        this.setState({
          subscribed: false
        });
      }, 3000);
    } else {
      this.setState({
        wasUnauthorized: true
      });

      UserActions.showLogin();
      ga('event', `site_search_${eventName}_podpiski_unauthorized`);
    }
  }

  render() {

    return (
      <SearchSubscribeForm
       subscribe={this.subscribe}
       {...this.props}
       {...this.state} />
    );
  }
}

export default SearchSubscribe;
