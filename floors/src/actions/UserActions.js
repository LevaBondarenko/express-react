/**
 * User actions
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import request from 'superagent';
import Dispatcher from '../core/Dispatcher';
import UserTypes from '../constants/UserTypes';
import userStore from '../stores/UserStore';
import {objPropsConvert, declOfNum} from '../utils/Helpers';
import {getObjects, getFromBack} from '../utils/requestHelpers';
import {
  includes, clone, without, size, difference, omit, unionBy, assignIn, indexOf,
  forEach, filter, union, reject, find
} from 'lodash';
import {mergeInObjectsState} from '../actionCreators/ObjectsActions';
import WidgetsActions from '../actions/WidgetsActions';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import ga from '../utils/ga';
import Helpers from '../utils/Helpers';

const moment = canUseDOM ? require('moment') : {};
const Basil = canUseDOM ? require('basil.js') : {};

/* global data */

export default {

  store: null,
  msgSocket: null,
  socProps: {
    facebook: {
      title: 'facebook',
      class: 'btn-blue',
      icon: 'fa fa-facebook'
    },
    vk: {
      title: 'вконтакте',
      class: 'btn-lightblue',
      icon: 'fa fa-vk'
    },
    odnoklassniki: {
      title: 'одноклассники',
      class: 'btn-orange',
      icon: 'fa fa-odnoklassniki'
    },
    google: {
      title: 'google+',
      class: 'btn-red',
      icon: 'fa fa-google'
    }
  },

  fieldsWeights: {
    f: 10,
    i: 7,
    o: 5,
    phone: 15,
    email: 10,
    sex: 5,
    birthday: 10,
    country: 3,
    city: 10,
    photo: 8
  },

  objClasses: {
    0: 'flats',
    1: 'flats',
    2: 'nh_flats',
    3: 'flats',
    4: 'cottages',
    5: 'cottages',
    6: 'cottages',
    7: 'cottages',
    8: 'cottages'
  },

  objTypes: {
    0: 'flat',
    1: 'flat',
    2: 'flat',
    3: 'room',
    4: 'house',
    5: 'cottage',
    6: 'garden',
    7: 'townhouse',
    8: 'land'
  },

  objClassRu: {
    1: 'квартира',
    3: 'комната',
    2: 'квартира',
    8: 'участок',
    6: 'дача',
    4: 'дом',
    5: 'коттедж',
    7: 'таунхаус'
  },

  tickStatuses: {
    ['object deleted']: 'Удалена',
    ['ticket deleted']: 'Удалена',
    ['object activated']: 'Активна',
    ['ticket completed']: 'Завершена',
    ['object completed']: 'Завершена',
    ['canceled']: 'Отменена',
  },

  login(login, password, lkSettings) {
    const self = this;

    request
      .post('/backend/')
      .send({action: 'user_login', login: login, password: password})
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          if(res.body.ok) {
            const basil = new Basil({namespace: 'etagi_com'});
            const cookieDomain = window.location.host.replace(/^[^.]*/, '');
            const newStoreData = assignIn(res.body.data, lkSettings);

            basil.set('auth_hash', res.body.data.userInfo.auth_hash, {
              domain: cookieDomain,
              namespace: '',
              storages: ['cookie'],
              expireDays: 1
            });
            res.body.data && self.fill(newStoreData);
            self.closeForm();
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Логин или пароль не верны',
              type: 'dang'
            }]);
            self.showWrong();
          }
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Логин или пароль не верны',
            type: 'dang'
          }]);
          self.showWrong();
        }
      });
  },

  register(phone, email, password, lkSettings, profilePath = false, i = false) {
    const self = this;
    const cityId = data.options ? data.options.cityId : 23;
    const userData = {
      action: 'user_create',
      phone: phone,
      email: email,
      password: password,
      login: phone ? phone : email
    };

    password === -1 && (userData.autopassword = 1);
    i && (userData.i = i);

    request
      .post('/backend/')
      .send(userData)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          if(res.body.data) {
            const basil = new Basil({namespace: 'etagi_com'});
            const cookieDomain = window.location.host.replace(/^[^.]*/, '');
            const newStoreData = assignIn(res.body.data, lkSettings);

            basil.set('auth_hash', res.body.data.userInfo.auth_hash, {
              domain: cookieDomain,
              namespace: '',
              storages: ['cookie'],
              expireDays: 1
            });
            res.body.data && self.fill(newStoreData);
            self.updateUser({city: cityId});
            if(profilePath) {
              window.location = profilePath;
            }
            ga('pageview', '/virtual/registration');
            self.closeForm();
          } else if(res.body.autoregister) {
            self.set('isAuthorized', false);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка создания пользователя, попробуйте еще раз позже',
              type: 'dang'
            }]);
          }
        } else if(res.body.result === 'В данных объекта имеются ошибки' &&
          res.body.validate_errors.match(/.*уже занят./)) {
          self.showReusedContact(phone, email);
        } else {
          let msg = `Ошибка обновления данных: ${res.body.result}`;
          const validateErrors = res.body.validate_errors || false;

          msg += validateErrors ? `: ${validateErrors}` : '';
          WidgetsActions.set('notify',[{
            msg: msg,
            type: 'dang'
          }]);
        }
      });
  },

  logout() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_FLUSH
    });
    this.clearLocalCachedData();
    this.msgSocketClose();
    request
      .post('/backend/')
      .send({action: 'user_logout'})
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Произошла ошибка',
            type: 'dang'
          }]);
        } else if(!res.body.ok) {
          WidgetsActions.set('notify',[{
            msg: 'Произошла ошибка',
            type: 'dang'
          }]);
        } else {
          const notifyBlock = (
            <div>
              <div className='notify-header'>Система</div>
              <div className='notify-body'>
                <span>Успешный выход из системы</span>
              </div>
            </div>
          );

          WidgetsActions.set('notify',[{
            msg: notifyBlock,
            type: 'custom',
            time: 15
          }]);
        }
      });
  },

  updateUser(data) {
    const self = this;

    request
      .post('/backend/')
      .send(
        assignIn(objPropsConvert(data, false), {action: 'user_update'})
      )
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка обновления данных. Попробуйте обновить страницу.',
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          const convertedData = objPropsConvert(res.body.data, true);

          self.fill(convertedData);
          this.updateLocalCachedData(convertedData);
          WidgetsActions.set('notify',[{
            msg: 'Данные успешно сохранены',
            type: 'info'
          }]);
        } else {
          let msg = `Ошибка обновления данных: ${res.body.result}`;
          const validateErrors = res.body.validate_errors || false;

          msg += validateErrors ? `: ${validateErrors}` : '';
          WidgetsActions.set('notify',[{
            msg: msg,
            type: 'dang'
          }]);
          if(res.body.result.match(/User with auth_hash.*is not found/)) {
            Dispatcher.handleViewAction({
              actionType: UserTypes.USER_FLUSH
            });
            this.clearLocalCachedData();
          }
        }
      });
  },

  changePassword(oldpswd, newpswd) {
    const self = this;

    request
      .post('/backend/')
      .send({action: 'user_changepassword', oldpswd: oldpswd, newpswd: newpswd})
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка обновления данных. Попробуйте обновить страницу.',
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          if(res.body.passwordCorrect === false) {
            WidgetsActions.set('notify',[{
              msg: 'Старый пароль введен не верно',
              type: 'dang'
            }]);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Пароль изменен',
              type: 'info'
            }]);
            res.body.data && self.fill(res.body.data);
          }
        } else {
          res.body.data && self.fill(res.body.data);
        }
      });
  },

  fill(data) {
    const combinedData = {};
    const cachedData = this.getLocalCachedData();

    cachedData && assignIn(combinedData, cachedData);
    data && assignIn(combinedData, objPropsConvert(data, true));
    if(size(combinedData)) {
      Dispatcher.handleViewAction({
        property: null,
        actionType: UserTypes.USER_SET,
        data: combinedData
      });
    }
    if(!size(combinedData) || !combinedData.userInfo) {
      const self = this;

      request
        .post('/backend/')
        .send({action: 'user_get_all'})
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .end((err, res) => {
          if(err) {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
              type: 'dang'
            }]);
          } else if(res.body.ok) {
            const convertedData = objPropsConvert(res.body.data, true);

            Dispatcher.handleViewAction({
              property: null,
              actionType: UserTypes.USER_SET,
              data: convertedData
            });
            if(res.body.data.isAuthorized) {
              self.updateLocalCachedData(convertedData);
              self.loadModules(
                data.modules,
                res.body.data.userInfo.personal_managers
              );
              self.msgSocketInit();
              self.applyDelayedActions();
            }
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
              type: 'dang'
            }]);
          }
        });
    } else if(combinedData.isAuthorized) {
      this.loadModules(
        userStore.get('modules'),
        combinedData.userInfo.personalManagers,
        combinedData
      );
      this.updateLocalCachedData(combinedData);
      this.msgSocketInit();
      this.applyDelayedActions();
    }
  },

  set(id, data) {
    this.updateLocalCachedData(id === null ? data : {id: data});
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: id,
      data: data
    });
  },

  get(what, params = {}) {
    params.action = 'user_get';
    params.what = what;
    request
      .post('/backend/')
      .send(params)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err || !res || !res.body || (!res.body.ok &&
          res.body.result &&
          !res.body.result.match(/User with auth_hash.*is not have/))) {
           //не показываем сообщение об ошибке если у юзера просто нет еще избранного, подписок или еще чего-то
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных (${what}) с сервера. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          const existData = userStore.get()[res.body.data.name] || null;
          const receivedData = {
            [res.body.data.name]: res.body.data.name === 'manager' ?
              (existData ?
                union(existData, [res.body.data.objects]) :
                [res.body.data.objects]
              ) : res.body.data.objects
          };
          const needConvert =
            ['booking', 'payment'].indexOf(res.body.data.name) !== -1;

          this.updateLocalCachedData(needConvert ?
            objPropsConvert(receivedData, true) : receivedData);
          Dispatcher.handleViewAction({
            property: null,
            actionType: UserTypes.USER_SET,
            data: needConvert ?
              objPropsConvert(receivedData, true) : receivedData
          });
        }
      });
  },

  create(data, what) {
    request
      .post('/backend/')
      .send(assignIn(data, {action: 'user_create', what: what}))
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка обновления данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          const receivedData = res.body.data.name ?
            {[res.body.data.name]: res.body.data.objects} :
            objPropsConvert(res.body.data, true);

          this.updateLocalCachedData(receivedData);
          Dispatcher.handleViewAction({
            property: null,
            actionType: UserTypes.USER_SET,
            data: receivedData
          });
        } else {
          if(res.body.result.match(/User with auth_hash.*is not found/)) {
            Dispatcher.handleViewAction({
              actionType: UserTypes.USER_FLUSH
            });
            this.clearLocalCachedData();
          }
          WidgetsActions.set('notify',[{
            msg: `Ошибка обновления данных: ${res.body.result}.`,
            type: 'dang'
          }]);
        }
      });
  },

  update(data, what) {
    request
      .post('/backend/')
      .send(assignIn(data, {action: 'user_update', what: what}))
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка обновления данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          const receivedData = res.body.data.name ?
            {[res.body.data.name]: res.body.data.objects} :
            objPropsConvert(res.body.data, true);

          this.updateLocalCachedData(receivedData);
          Dispatcher.handleViewAction({
            property: null,
            actionType: UserTypes.USER_SET,
            data: receivedData
          });
        } else {
          if(res.body.result.match(/User with auth_hash.*is not found/)) {
            Dispatcher.handleViewAction({
              actionType: UserTypes.USER_FLUSH
            });
            this.clearLocalCachedData();
          }
          WidgetsActions.set('notify',[{
            msg: `Ошибка обновления данных: ${res.body.result}.`,
            type: 'dang'
          }]);
        }
      });
  },

  del(what) {
    request
      .post('/backend/')
      .send({action: 'user_delete', what: what})
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка обновления данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else if(res.body.ok) {
          const receivedData = res.body.data.name ?
            {[res.body.data.name]: res.body.data.objects} :
            objPropsConvert(res.body.data, true);

          this.updateLocalCachedData(receivedData);
          Dispatcher.handleViewAction({
            property: null,
            actionType: UserTypes.USER_SET,
            data: receivedData
          });
        } else {
          if(res.body.result.match(/User with auth_hash.*is not found/)) {
            Dispatcher.handleViewAction({
              actionType: UserTypes.USER_FLUSH
            });
            this.clearLocalCachedData();
          }
          WidgetsActions.set('notify',[{
            msg: `Ошибка обновления данных: ${res.body.result}.`,
            type: 'dang'
          }]);
        }
      });
  },

  cacheObjects(oclass, oids) {
    const cache = userStore.get('objectsCache') || {};

    if(cache[oclass]) {
      const existing = [];

      for(const i in oids) {
        if(oids[i] &&
          (!cache[oclass][oids[i]] || cache[oclass][oids[i]] !== 'not found')) {
          existing.push(oids[i]);
        }
      }
      oids = difference(oids, existing);
    }
    const params = {class: oclass, object_id: oids, city_id: 'all', limit: 100}; //eslint-disable-line camelcase

    size(oids) && getObjects(params).then(response => {
      const {objects} = response;
      const newCache = clone(cache);

      if(!newCache[oclass]) {
        newCache[oclass] = {};
      }
      for(const i in objects) {
        if(objects[i]) {
          newCache[oclass][objects[i].object_id] = objects[i];
          oids = without(oids, parseInt(objects[i].object_id));
        }
      }

      for(const i in oids) {
        if(oids[i]) {
          newCache[oclass][oids[i]] = 'not found';
        }
      }

      this.updateLocalCachedData({objectsCache: newCache});
      Dispatcher.handleViewAction({
        property: null,
        actionType: UserTypes.USER_SET,
        data: {
          objectsCache: newCache
        }
      });
    });
  },

  loadModules(modules, managers, cachedData = {}) {
    for(const i in modules) {
      if(modules[i] && !cachedData[i] &&
        indexOf([
          'profile',
          'contructor',
          'help',
          'mainpage',
          'analytics',
          'mytickets'
        ], i) === -1) {
        if(i === 'messages') {
          this.get(i, {limit: 1000});
        } else {
          this.get(i);
        }
        if(i === 'myauctions') {
          this.get('lots');
        }
      }
    }
    //this.get('survey');
    if(!cachedData.manager) {
      forEach(managers, manager => {
        const managerId = manager.managerId ?
          manager.managerId : manager.manager_id;

        this.get(`manager/${managerId}`);
      });
    }
    !cachedData.documents && this.get('documents');
  },

  updateFavorites(action, oid, oclass, params = {}) {
    if(includes(['del', 'add'], action) && oid && oclass) {
      params.action = `user_${action}_favorite`;
      params.oid = oid;
      params.class = oclass;
      request
        .post('/backend/')
        .send(params)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .end((err, res) => {
          if(err) {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка обновления данных. Попробуйте обновить страницу',
              type: 'dang'
            }]);
          } else if(res.body.ok) {
            const receivedData = {[res.body.data.name]: res.body.data.objects};

            this.updateLocalCachedData(receivedData);
            Dispatcher.handleViewAction({
              property: null,
              actionType: UserTypes.USER_SET,
              data: receivedData
            });
          } else {
            if(res.body.result.match(/User with auth_hash.*is not found/)) {
              Dispatcher.handleViewAction({
                actionType: UserTypes.USER_FLUSH
              });
              this.clearLocalCachedData();
            }
            WidgetsActions.set('notify',[{
              msg: 'Ошибка обновления данных. Попробуйте обновить страницу',
              type: 'dang'
            }]);
          }
        });
    } else {
      throw ('Not enough data for favorites manipulation');
    }
  },

  uploadDocument(params) {
    getFromBack(
      assignIn(params, {action: 'user_upload_doc'})
    ).then(response => {
      if(response.ok) {
        const notifyBlock = (
          <div>
            <div className='notify-header'>Система</div>
            <div className='notify-body'>
              <span>Документ загружен</span>
            </div>
          </div>
        );
        const receivedData = {[response.data.name]: response.data.objects};

        this.updateLocalCachedData(receivedData);
        Dispatcher.handleViewAction({
          property: null,
          actionType: UserTypes.USER_SET,
          data: receivedData
        });
        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 10
        }]);
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          Dispatcher.handleViewAction({
            actionType: UserTypes.USER_FLUSH
          });
          this.clearLocalCachedData();
        }
        WidgetsActions.set('notify',[{
          msg:
            'Ошибка отправки запроса. Обновите страницу и попробуйте еще раз',
          type: 'dang'
        }]);
      }
    }, error => {
      WidgetsActions.set('notify',[{
        msg: `Ошибка отправки запроса: ${error.code}. Обновите страницу и попробуйте еще раз`, //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
  },

  updateBankProfile(params) {
    getFromBack(
      assignIn(params, {action: 'user_update', what: 'mortgage_profile'})
    ).then(response => {
      if(response.ok) {
        const mortgage = userStore.get('mortgage');

        mortgage.profile = assignIn(mortgage.profile, response.profile);

        this.updateLocalCachedData({mortgage: mortgage});
        Dispatcher.handleViewAction({
          property: null,
          actionType: UserTypes.USER_SET,
          data: {mortgage: mortgage}
        });
        /*
         * пока не будем сообщать о сохранении клиенту
        const notifyBlock = (
          <div>
            <div className='notify-header'>Система</div>
            <div className='notify-body'>
              <span>Сохранено</span>
            </div>
          </div>
        );

        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 10
        }]);*/
      } else {
        WidgetsActions.set('notify',[{
          msg:
            'Ошибка отправки запроса. Обновите страницу и попробуйте еще раз',
          type: 'dang'
        }]);
      }
    }, error => {
      WidgetsActions.set('notify',[{
        msg: `Ошибка отправки запроса: ${error.code}. Обновите страницу и попробуйте еще раз`, //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
  },

  sendBankProfile() {
    getFromBack(
      {action: 'user_send_mortgage_profile'}
    ).then(response => {
      if(response.ok) {
        this.fill(response.data);
      } else {
        WidgetsActions.set('notify',[{
          msg:
            'Ошибка отправки запроса. Обновите страницу и попробуйте еще раз',
          type: 'dang'
        }]);
      }
    }, error => {
      WidgetsActions.set('notify',[{
        msg: `Ошибка отправки запроса: ${error.code}. Обновите страницу и попробуйте еще раз`, //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
  },

  updateMortgage(progId, action) {
    switch(action) {
    case 'refuse':
      this.update({status: 'refuse_client'}, `mortgage/${progId}`);
      break;
    case 'activate':
      this.update({status: 'NULL'}, `mortgage/${progId}`);
      break;
    case 'delete':
      this.del(`mortgage/${progId}`);
      break;
    default:
      //do nothing
    }
  },

  forceMortgageUpdate() {
    this.forceRefresh();
    this.get('mortgage');
  },

  updateBooking(objId, action) {
    const supportedActions = [
      'set',
      'cancel',
      'delete',
      'settle',
      'not_settle',
      'late',
      'select'
    ];

    if(supportedActions.indexOf(action) !== -1 && objId > 0) {
      const requestAction = action === 'set' ? action : 'update';
      const dataSend = {
        action: `user_${requestAction}_booking`,
        object_id: objId //eslint-disable-line camelcase
      };

      switch(action) {
      case 'delete':
        dataSend.state = 0;
        break;
      case 'select':
        dataSend.state = 3;
        break;
      case 'settle':
        dataSend.state = 9;
        break;
      case 'not_settle':
        dataSend.state = 10;
        break;
      case 'late':
        dataSend.state = 11;
        break;
      default:
        //do nothing
      }

      action === 'set' && this.updateFavorites('add', objId, 'rent');

      getFromBack(dataSend).then(response => {
        if(response.ok) {
          this.fill(response.data);
        } else {
          WidgetsActions.set('notify',[{
            msg:
              'Ошибка отправки запроса. Обновите страницу и попробуйте еще раз',
            type: 'dang'
          }]);
        }
      }, error => {
        WidgetsActions.set('notify',[{
          msg: `Ошибка отправки запроса: ${error.code}. Обновите страницу и попробуйте еще раз`, //eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    } else {
      throw ('Not enough data for booking manipulation');
    }
  },

  forceRefresh() {
    getFromBack({
      action: 'user_get_all', force: 1
    }).then(response => {
      if(response.ok) {
        this.fill(response.data);
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
          type: 'warn'
        }]);
      }
    });
  },

  showLogin() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_LOGIN
    });
  },

  showRegister() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_REGISTER
    });
  },

  showSurvey() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_SURVEY
    });
  },

  showRestore() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_RESTORE
    });
  },

  showWrong() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_WRONG
    });
  },

  showHelp() {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: 'showForm',
      data: UserTypes.FORM_HELP
    });
  },

  showReusedContact(phone, email) {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: null,
      data: {
        showForm: UserTypes.FORM_RESTORE,
        userInfo: {phone: phone, email: email}
      }
    });
  },

  showBid(bidOnObject) {
    Dispatcher.handleViewAction({
      actionType: UserTypes.USER_SET,
      property: null,
      data: {showForm: UserTypes.FORM_BID, bidOnObject: bidOnObject}
    });
  },

  showInvite() {
    if(!userStore.get('isAuthorized')) {
      if(userStore.get('showForm') === UserTypes.FORM_NONE) {
        Dispatcher.handleViewAction({
          actionType: UserTypes.USER_SET,
          property: 'showForm',
          data: UserTypes.FORM_INVITE
        });
      } else if(userStore.get('showForm') !== UserTypes.FORM_INVITE) {
        this.scheduleShowInvite();
      }
    }
  },

  scheduleShowInvite() {
    const basil = new Basil({namespace: 'etagi_com'});

    // показываем окно приглашения в личный кабинет только
    // если ранее был выбран город
    const cityChosen = !!Helpers.getCookie('selected_city');
    const doNotShowCities = !!Helpers.getCookie('doNotShowCities');

    if(!basil.get('noInvite')) {
      const self = this;
      const invite = userStore.get('invite');
      const date = new Date();
      let timeout = basil.get('inviteShowed') ?
        basil.get('inviteShowed') - date.getTime() :
        invite.first * 1000;

      if (timeout > invite.period * 1000) {
        basil.set('inviteShowed', date.getTime() + invite.period * 1000);
        timeout = basil.get('inviteShowed') - date.getTime();
      }

      timeout = !timeout ? invite.first * 1000 : (
        timeout > invite.period * 1000 ? invite.period * 1000 :
         timeout);

      cityChosen && doNotShowCities && timeout && setTimeout(() => {
        self.showInvite();
      }, timeout);
    }
  },

  closeForm() {
    if(!userStore.get('isAuthorized')) {
      Dispatcher.handleViewAction({
        actionType: UserTypes.USER_FLUSH
      });
    } else {
      Dispatcher.handleViewAction({
        actionType: UserTypes.USER_SET,
        property: 'showForm',
        data: UserTypes.FORM_NONE
      });
    }
    const hash = window.location.hash ?
      window.location.hash.replace('#', '') : null;

    if(hash === 'register') {
      window.location.hash = '';
    }
  },

  getIntegrity() {
    let integrity = 0;
    const model = userStore.get();
    const weights = this.fieldsWeights;

    for(const i in weights) {
      if(weights[i]) {
        if((model.userInfo[i] &&
          !(i === 'i' && model.userInfo[i] === 'Пользователь')) &&
          !(i === 'sex' && (!model.userInfo[i] || model.userInfo[i] === 3))) {
          integrity += weights[i];
        }
      }
    }
    return integrity;
  },

  applyDelayedActions() {
    const actions = this.getDelayedActions();

    forEach(actions, action => {
      this[action.method](action.data);
    });
  },

  getDelayedActions() {
    const basil = new Basil({namespace: 'etagi_com'});
    const actions = basil.get('lkDelayedActions');
    const now = parseInt(moment().format('X'));
    const filteredActions = filter(actions, item => {
      return now < item.expired;
    });

    basil.set('lkDelayedActions', null);
    return filteredActions;
  },

  addDelayedAction(action) {
    const basil = new Basil({namespace: 'etagi_com'});
    const actions = basil.get('lkDelayedActions') || [];

    action.expired = parseInt(moment().add(5, 'minutes').format('X'));
    actions.push(action);
    basil.set('lkDelayedActions', actions);

    return true;
  },

  putToWSS(data) {
    WidgetsActions.set(null, data);
  },

  putToReduxObjects(data) {
    this.store && this.store.dispatch(mergeInObjectsState(data));
  },

  assignStore(store) {
    this.store = store;
  },

  getLocalCachedData() {
    const basil = new Basil({namespace: 'etagi_com'});
    const data = basil.get('lkData');
    const compareData = {objs2compare: basil.get('objs2compare')};
    const fullData = assignIn(data, compareData);
    const now = parseInt(moment().format('X'));

    if(fullData && now > fullData.expired) {
      this.clearLocalCachedData();
      return null;
    } else {
      return fullData;
    }
  },

  updateLocalCachedData(newData) {
    const basil = new Basil({namespace: 'etagi_com'});
    const existsData = basil.get('lkData') || {};
    const combinedData = assignIn(existsData, newData);

    combinedData.expired = parseInt(moment().add(1, 'hours').format('X'));
    basil.set('lkData', combinedData);
    return true;
  },

  clearLocalCachedData() {
    const basil = new Basil({namespace: 'etagi_com'});

    basil.set('lkData', null);
    return true;
  },

  deleteFromLocalCachedData(id) {
    const basil = new Basil({namespace: 'etagi_com'});
    const existsData = basil.get('lkData') || {};
    const combinedData = omit(existsData, id);

    combinedData.expired = parseInt(moment().add(1, 'hours').format('X'));
    basil.set('lkData', combinedData);
    return true;
  },

  msgSocketInit(lastMsgId = 0, wsto = 5000) {
    const model = userStore.get();

    if(this.msgSocket !== null) {
      return true;
    }
    this.msgSocket = new WebSocket(`wss://interactive.etagi.com/s/?user=${model.userInfo.authHash}&wsto=${wsto}`);
    this.msgSocket.onopen = () => {
      this.msgSocketSend(JSON.stringify({lastMsgId: lastMsgId}));
    };
    this.msgSocket.onclose = () => {
      console.log('msgSocketDisconneted'); //eslint-disable-line no-console
      this.msgSocket = null;
    };
    this.msgSocket.onerror = e => {
      console.log('msgSocketError', e); //eslint-disable-line no-console
    };
    this.msgSocket.onmessage = msg => {
      const data = JSON.parse(msg.data);

      if(data.isAuthorized === false) {
        Dispatcher.handleViewAction({
          actionType: UserTypes.USER_FLUSH
        });
        this.clearLocalCachedData();
        const notifyBlock = (
          <div>
            <div className='notify-header'>Система</div>
            <div className='notify-body'>
              <span>Вы вышли из системы</span>
            </div>
          </div>
        );

        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 15
        }]);
      } else if(size(data.newMsgs)) {
        const oldMsgs = userStore.get('messages');
        const msgs = unionBy(data.newMsgs, oldMsgs, 'id');

        this.updateLocalCachedData({messages: msgs});
        Dispatcher.handleViewAction({
          property: null,
          actionType: UserTypes.USER_SET,
          data: {messages: msgs}
        });
      }
    };
  },

  msgSocketClose() {
    if(this.msgSocket !== null) {
      this.msgSocket.close();
    }
    return true;
  },

  msgSocketSend(msg) {
    if(this.msgSocket !== null) {
      this.msgSocket.send(msg);
    }
    return true;
  },

  inCompare(oid, oclass) {
    if (canUseDOM) {
      const objs = userStore.get('objs2compare');

      return objs ? !!find(objs, obj => {
        return parseInt(obj.id) === parseInt(oid) &&
        obj.class === oclass;
      }) : false;
    } else {
      return false;
    }
  },

  updateCompare(inCompare, oid, oclass) {
    const basil = new Basil({namespace: 'etagi_com'});
    let objs = basil.get('objs2compare');
    const count = inCompare ? size(objs) - 1 : size(objs) + 1;
    const countDeclension = declOfNum(count,
      ['объект', 'объекта', 'объектов']);
    const notifyBlock = (<div>
        <div className='notify-header'>
          {inCompare ? 'Удалено из сравнения' : 'Добавлено к сравнению'}
        </div>
        <div className='notify-body'>
          <span>Объект </span>
          <span>{oid}</span>
          <span> {inCompare ? 'удален' : 'добавлен'} из списка<br/>
            объектов для сравнения</span><br/>
          <span>Всего в списке:</span><br/>
          <span>{count}</span>&nbsp;
          <span>{countDeclension}</span>
          <span> недвижимости</span><br/>
          <a className='notify-link' href='/compare/'>Сравнить</a>
        </div>
      </div>);

    if (inCompare) {
      objs = reject(objs, obj => {
        return parseInt(obj.id) === parseInt(oid) &&
          obj.class === oclass;
      });
      basil.set('objs2compare', objs);
    } else {
      if(objs && size(objs)) {
        objs.push({id: parseInt(oid), class: oclass});
      } else {
        objs = [{id: parseInt(oid), class: oclass}];
      }
      basil.set('objs2compare', objs);
    }

    Dispatcher.handleViewAction({
      property: null,
      actionType: UserTypes.USER_SET,
      data: {objs2compare: objs}
    });

    WidgetsActions.set('notify',[{
      msg: notifyBlock,
      type: 'custom',
      time: 30
    }]);
  },

  inFavorite(oid, oclass) {
    const favorites = userStore.get('favorites');

    return favorites ? !!find(favorites, favItem => {
      return parseInt(favItem.id) === parseInt(oid) &&
      favItem.class === oclass;
    }) : false;
  }
};
