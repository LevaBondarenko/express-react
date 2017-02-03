/**
 * LK Body component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, values, isEqual, includes, size} from 'lodash';
import {getObjects, getFromBack} from '../../utils/requestHelpers';
import LKMainPage from '../LKBody/LKMainPage';
import LKProfile from '../LKBody/LKProfile';
import LKMyObjects from '../LKBody/LKMyObjects';
import LKMyTickets from '../LKBody/LKMyTickets';
import LKFavorites from '../LKBody/LKFavorites';
import LKBooking from '../LKBody/LKBooking';
import LKSearches from '../LKBody/LKSearches';
import LKAuctions from '../LKBody/LKAuctions';
import LKMessages from '../LKBody/LKMessages';
import LKMortgage from '../LKBody/LKMortgage';
import LKLayoutModels from '../LKBody/LKLayoutModels';
import {Locations, Location, NotFound} from 'react-router-component';

/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';

class LKBody extends Component {

  constructor(props) {
    super(props);
    const hash =  window.location.hash ?
      window.location.hash.replace('#', '') : '/';

    this.onHashChange = this.onHashChange.bind(this);
    this.state = {
      bankProfileSettings: {},
      bankProfileSettingsRequested: false,
      availModules: [],
      page: hash !== '/accessDenied/' ? hash : '/',
      favorites: [],
      myauctions: [],
      objects: {}, //objects for favorites :)
      objectsCache: {} //cache for any objects in LK
    };
  }

  onHashChange() {
    const hash = window.location.hash ?
      window.location.hash.replace('#', '') : null;

    if(hash !== this.state.page && hash !== '/accessDenied/') {
      this.setState(() => ({
        page: hash
      }));
    }
  }

  componentWillMount() {
    window.addEventListener('hashchange', this.onHashChange);
    this.onChange();
  }

  componentDidMount() {
    userStore.onChange(this.onChange);
    this.getFavObjects();
    this.cacheAuctionObjects();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState, this.state);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHashChange);
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    const uStore = userStore.get();
    const meta = uStore.userMeta;
    const availModules = meta.availModules ? meta.availModules.split(',') : [];

    this.setState(() => ({
      availModules: availModules,
      isAuthorized: uStore.isAuthorized,
      user: uStore.userInfo,
      meta: uStore.userMeta,
      socials: uStore.userSocials,
      survey: uStore.survey,
      favorites: uStore.favorites,
      forReview: uStore.forReview,
      booking: uStore.booking,
      payment: uStore.payment,
      paymentsUrl: uStore.paymentsUrl,
      paymentsScid: uStore.paymentsScid,
      messages: uStore.messages,
      mortgage: uStore.mortgage,
      documents: uStore.documents,
      searches: uStore.searches,
      myauctions: uStore.myauctions,
      myobjects: uStore.myobjects,
      lots: uStore.lots,
      pIntegrity: UserActions.getIntegrity(),
      modules: uStore.modules,
      objectsCache: uStore.objectsCache,
      expired: uStore.expired
    }));
    if(!uStore.isAuthorized) {
      setTimeout(() => {
        WidgetsActions.set('lkMortgageProfileUploads', null);
      }, 0);
    }
  }

  onProfileUpdate = (data) => {
    UserActions.updateUser(data);
  }

  onPasswordChange(data) {
    UserActions.changePassword(data.oldPassword, data.newPassword);
  }

  componentDidUpdate(prevProps, prevState) {
    if(size(this.state.favorites) !== size(prevState.favorites)) {
      this.getFavObjects();
    }
    if(size(this.state.myauctions) !== size(prevState.myauctions)) {
      this.cacheAuctionObjects();
    }
  }

  cacheAuctionObjects() {
    const classes = UserActions.objClasses;
    const oids = {};
    const lots = this.state.myauctions;

    for(const i in lots) {
      if(lots[i]) {
        const oclass = classes[parseInt(lots[i].object.type_id)];

        if(!oids[oclass]) {
          oids[oclass] = [];
        }
        oids[oclass].push(lots[i].object.ries_id);
      }
    }
    for(const i in oids) {
      if(oids[i]) {
        UserActions.cacheObjects(i, oids[i]);
      }
    }
  }

  getFavObjects() {
    setTimeout(() => {
      const oids = {}, {favorites, booking} = this.state;
      let params = false;

      //clean old objects list
      this.setState(() => ({objects: {}}));
      //grouping ids of objects by classes for separate requests
      //preparing favorites data for merging with objects data
      for(const i in favorites) {
        if(favorites[i]) {
          if(oids[favorites[i].class]) {
            oids[favorites[i].class].push(favorites[i].id);
            oids[`${favorites[i].class}_na`].push(favorites[i].id);
          } else {
            oids[favorites[i].class] = [favorites[i].id];
            oids[`${favorites[i].class}_na`] = [favorites[i].id];
          }
        }
      }
      //adding ids of rent-objects from booking
      for(const i in booking) {
        if(booking[i]) {
          const boid = booking[i].objectId;

          if(oids.rent) {
            if(oids.rent.indexOf(boid) === -1) {
              oids.rent.push(boid);
            }
          } else {
            oids.rent = [boid];
          }
        }
      }
      //requests for objects separated by objects classes
      for(const i in oids) {
        if(oids[i]) {
          params = {
            limit: 100,
            order: 'object_id',
            class: i,
            city_id: 'all', // eslint-disable-line camelcase
            object_id: oids[i] // eslint-disable-line camelcase
          };
          this.getObjects(params);
        }
      }
    }, 0);
  }

  getObjects(params) {
    getObjects(params).then(response => {
      const favType = params.class.replace(/(.*_na)$/, 'sold');
      const {objects} = response;
      const newObjects = clone(this.state.objects);

      for(const i in objects) {
        if(objects[i]) {
          if(favType === 'nh_flats') {
            const nhFlats = values(objects[i].flats)[0];

            for(const j in nhFlats) {
              if(nhFlats[j]) {
                const obj = nhFlats[j];

                obj.jkSlugUrl = objects[i].slugUrl;
                if(newObjects[favType]) {
                  newObjects[favType][obj.object_id] = obj;
                } else {
                  newObjects[favType] = {[obj.object_id]: obj};
                }
              }
            }
          } else {
            const obj =  objects[i];

            if(favType === 'rent') {
              obj.class = 'rent';
            }
            if(newObjects[favType]) {
              newObjects[favType][obj.object_id] = obj;
            } else {
              newObjects[favType] = {[obj.object_id]: obj};
            }
          }
        }
      }

      this.setState(() => ({
        objects: newObjects
      }));
    }, error => {
      error;
    });
  }

  get accessPage() {
    const {availModules, isAuthorized, page} = this.state;
    const module = page ? /^\/(\w*)\//.exec(page) : '/';

    if(isAuthorized &&
      (!module || includes(availModules, module[1]))) {
      window.location.hash = `#${this.state.page}`;
    } else {
      window.location.hash = '#/accessDenied/';
    }
  }

  requestBankProfileSettings = () => {
    const {bankProfileSettingsRequested} = this.state;

    if(!bankProfileSettingsRequested) {
      this.setState(() => ({bankProfileSettingsRequested: true}));
      getFromBack({
        action: 'get_bankprofile_settings'
      }, 'get').then(response => {
        if(response.ok) {
          this.setState({
            bankProfileSettings: response.data
          });
        }
      });
    }
  }

  onBankProfileUpdate = params => {
    UserActions.updateBankProfile(params);
  }

  onUploadDocument = params => {
    UserActions.uploadDocument(params);
  }

  onProfileSend = () => {
    UserActions.sendBankProfile();
  }



  render() {
    // http://local.wordpress.dev/my/#/profile/ -- example
    return (
      <div className='lkbody'>
        <Locations contextual hash
          onBeforeNavigation={this.accessPage}>
          <Location path='/' handler={
              <LKMainPage {...this.props} {...this.state}/>
          } />
          <Location path='/profile/' handler={
              <LKProfile
                onProfileUpdate={this.onProfileUpdate}
                onPasswordChange={this.onPasswordChange}
                {...this.state}
                {...this.props}/>
          } />
          <Location path={/^\/mytickets\/(all|active|inactive|)/}
            urlPatternOptions={['ticketFilter']}
            handler={<LKMyTickets {...this.state} {...this.props} />} />
          <Location path='/myobjects/'
            handler={<LKMyObjects {...this.state} {...this.props} />} />
          <Location path={/^\/myobjects\/(add)/}
            urlPatternOptions={['action']}
            handler={<LKMyObjects {...this.state} {...this.props} />} />
          <Location path={/^\/myobjects\/(\d*)\/*(edit)*/}
              urlPatternOptions={['objectId', 'action']}
              handler={<LKMyObjects {...this.state} {...this.props} />} />
          <Location path='/favorites/' handler={
              <LKFavorites {...this.state} {...this.props} />
          } />
          <Location path={/^\/booking\/(\d*)\/*(paymentOk|paymentFail)*/}
              urlPatternOptions={['bookingId', 'paymentState']}
              handler={<LKBooking {...this.state} {...this.props} />} />
          <Location path={/^\/mortgage\/(\w*)\/*(\d*)*/}
              urlPatternOptions={['subPage', 'subId']}
              handler={(
                <LKMortgage
                  {...this.state}
                  {...this.props}
                  requestBankProfileSettings={this.requestBankProfileSettings}
                  onBankProfileUpdate={this.onBankProfileUpdate}
                  onUploadDocument={this.onUploadDocument}
                  onProfileSend={this.onProfileSend}/>
              )} />
          <Location path={/^\/searches\/(\d*)/} urlPatternOptions={['period']}
            handler={
              <LKSearches {...this.state} {...this.props} />
          } />
          <Location path={/^\/myauctions\/(\d*)/}
            urlPatternOptions={['auctionId']}
            handler={
              <LKAuctions {...this.state} {...this.props} />
          } />
          <Location path={/^\/messages\/(\d*)/}
            urlPatternOptions={['msgId']}
            handler={
              <LKMessages {...this.state} {...this.props} />
          } />
          <Location path='/contructor/' handler={
              <LKLayoutModels {...this.state} {...this.props} />
          } />
          <Location path='/accessDenied/' handler={
            <div className='notFound'>
              <p>В настоящее время модуль для Вас не доступен</p>
            </div>
          } />
        <NotFound handler={
            <div className='notFound'>
              <p>Страница не найдена.<br/>Проверьте правильность адреса.</p>
            </div>
          } />
        </Locations>
      </div>
    );
  }
}

export default LKBody;
