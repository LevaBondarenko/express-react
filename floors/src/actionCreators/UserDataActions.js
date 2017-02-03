import {getFromBack} from '../utils/requestHelpers';
import {setCookie} from '../utils/Helpers';
import {assignIn} from 'lodash';
import Immutable from 'immutable';
import {
  ADD,
  FLUSH,
  REMOVE,
  SETIN,
  UPDATEIN,
  MERGEDEEP,
  MASSUPDATEIN
} from '../constants/userdata-consts';

export function flushUserDataState() {
  return {
    type: FLUSH
  };
};

export function updateInUserDataState(path, updater) {
  return {
    type: UPDATEIN,
    path: path,
    updater: updater
  };
}

export function addUserDataState(state) {
  return {
    type: ADD,
    state
  };
}

export function removeUserDataState(namespace) {
  return {
    type: REMOVE,
    namespace: namespace
  };
}

export function setInUserDatasState(path, value) {
  return {
    type: SETIN,
    path: path,
    value: value
  };
}

export function mergeInUserDataState(object) {
  return {
    type: MERGEDEEP,
    object: object
  };
}

export function massUpdateInUserDataState(path, object) {
  return {
    type: MASSUPDATEIN,
    path: path,
    object: object
  };
}

export function initUserDataState(modules = []) {
  const data = {
    action: 'user_init_data',
    modules: modules
  };

  return dispatch => {
    return getFromBack(data, 'post', '/backend/').then(
      response => {
        if(response.ok) {
          dispatch({
            type: UPDATEIN,
            path: [],
            updater: () => (Immutable.fromJS(response.data))
          });
        }
      }
    );
  };
}

export function userLogout() {
  getFromBack({action: 'user_logout'}, 'post', '/backend/').then(
    response => {
      //@TODO replace with error handling
      if(response.ok) {
        console.log('logout success'); //eslint-disable-line no-console
      } else {
        console.log('logout failed'); //eslint-disable-line no-console
      }
    },
    error => {
      console.log('logout failed', error); //eslint-disable-line no-console
    }
  );
  return {
    type: FLUSH
  };
}

export function userLogin(login, password, modules = []) {
  return dispatch => {
    return getFromBack(
      {
        action: 'user_login',
        login: login,
        password: password,
        modules: modules
      },
      'post',
      '/backend/'
    ).then(
      response => {
        if(response.ok) {
          const cookieDomain = window.location.host.replace(/^[^.]*/, '');

          setCookie('auth_hash', response.data.userdata.auth_hash, {
            domain: cookieDomain,
            expireDays: 1,
            path: '/'
          });

          dispatch({
            type: UPDATEIN,
            path: [],
            updater: () => (Immutable.fromJS(response.data))
          });
        } else {
          console.log('login failed'); //eslint-disable-line no-console
        }
      },
      error => {
        console.log('login failed', error); //eslint-disable-line no-console
      }
    );
  };
}

export function userRegister(phone, email, password, modules = []) {
  const userData = {
    action: 'user_create',
    phone: phone,
    email: email,
    password: password,
    login: phone ? phone : email,
    modules: modules
  };

  return dispatch => {
    return getFromBack(
      userData, 'post', '/backend/'
    ).then(
      response => {
        if(response.ok) {
          const cookieDomain = window.location.host.replace(/^[^.]*/, '');

          setCookie('auth_hash', response.data.userdata.auth_hash, {
            domain: cookieDomain,
            expireDays: 1,
            path: '/'
          });

          dispatch({
            type: UPDATEIN,
            path: [],
            updater: () => (Immutable.fromJS(response.data))
          });
        } else {
          console.log('register failed'); //eslint-disable-line no-console
        }
      },
      error => {
        console.log('register failed', error); //eslint-disable-line no-console
      }
    );
  };
}

export function userDataCreate(data, what) {
  return dispatch => {
    return getFromBack(
      assignIn(data, {action: 'user_create', what: what}), 'post', '/backend/'
    ).then(response => {
      if(response.ok) {
        dispatch({
          type: UPDATEIN,
          path: [response.data.name],
          updater: () => (Immutable.fromJS(response.data.objects))
        });
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          dispatch({
            type: FLUSH
          });
        }
        console.log('create failed', response.result); //eslint-disable-line no-console
      }
    }, error => {
      console.log('create failed', error); //eslint-disable-line no-console
    });
  };
}

export function userDataUpdate(data, what) {
  return dispatch => {
    return getFromBack(
      assignIn(data, {action: 'user_update', what: what}), 'post', '/backend/'
    ).then(response => {
      if(response.ok) {
        dispatch({
          type: UPDATEIN,
          path: [response.data.name],
          updater: () => (Immutable.fromJS(response.data.objects))
        });
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          dispatch({
            type: FLUSH
          });
        }
        console.log('update failed', response.result); //eslint-disable-line no-console
      }
    }, error => {
      console.log('update failed', error); //eslint-disable-line no-console
    });
  };
}

export function userDataDelete(what) {
  return dispatch => {
    return getFromBack(
      {action: 'user_delete', what: what}, 'post', '/backend/'
    ).then(response => {
      if(response.ok) {
        dispatch({
          type: UPDATEIN,
          path: [response.data.name],
          updater: () => (Immutable.fromJS(response.data.objects))
        });
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          dispatch({
            type: FLUSH
          });
        }
        console.log('delete failed', response.result); //eslint-disable-line no-console
      }
    }, error => {
      console.log('delete failed', error); //eslint-disable-line no-console
    });
  };
}

export function userDataUpdateFavorites(action, oid, oclass, params = {}) {
  if(['del', 'add'].indexOf(action) > -1 && oid && oclass) {
    params.action = `user_${action}_favorite`;
    params.oid = oid;
    params.class = oclass;

    return dispatch => {
      return getFromBack(
        params, 'post', '/backend/'
      ).then(response => {
        if(response.ok) {
          dispatch({
            type: UPDATEIN,
            path: [response.data.name],
            updater: () => (Immutable.fromJS(response.data.objects))
          });
        } else {
          if(response.result.match(/User with auth_hash.*is not found/)) {
            dispatch({
              type: FLUSH
            });
          }
          console.log('update favorites failed', response.result); //eslint-disable-line no-console
        }
      }, error => {
        console.log('update favorites failed', error); //eslint-disable-line no-console
      });
    };
  } else {
    throw ('Not enough data for favorites manipulation');
  }
}

export function userDataUpdateUser(data) {
  return dispatch => {
    return getFromBack(
      assignIn(data, {action: 'user_update'}),
      'post',
      '/backend/'
    ).then(response => {
      if(response.ok) {
        const userdata = Immutable.fromJS(response.data.userInfo);
        const metadata = Immutable.fromJS(response.data.userMeta);

        dispatch({
          type: UPDATEIN,
          path: ['lastError'],
          updater: () => (Immutable.fromJS({
            error: false
          }))
        });
        dispatch({
          type: UPDATEIN,
          path: ['userdata'],
          updater: () => (userdata)
        });
        dispatch({
          type: UPDATEIN,
          path: ['metadata'],
          updater: () => (metadata)
        });
        dispatch({
          type: UPDATEIN,
          path: ['isAuthorized'],
          updater: () => (response.data.isAuthorized)
        });
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          dispatch({
            type: FLUSH
          });
        } else {
          let msg = `Ошибка обновления данных: ${response.result}`;
          const validateErrors = response.validate_errors || false;

          msg += validateErrors ? `: ${validateErrors}` : '';
          dispatch({
            type: UPDATEIN,
            path: ['lastError'],
            updater: () => (Immutable.fromJS({
              error: true,
              message: msg
            }))
          });
        }
      }
    }, error => {
      const {data} = error.res.body || {};
      let msg = null;

      switch(data) {
      case 'phone format is invalid':
        msg = 'Телефон введен не верно';
        break;
      default:
        msg = 'Ошибка обновления данных профиля. Проверьте введенные данные';
      }

      dispatch({
        type: UPDATEIN,
        path: ['lastError'],
        updater: () => (Immutable.fromJS({
          error: true,
          message: msg
        }))
      });
    });
  };
}

export function userDataChangePassword(oldpswd, newpswd) {
  return dispatch => {
    return getFromBack(
      {action: 'user_changepassword', oldpswd: oldpswd, newpswd: newpswd},
      'post',
      '/backend/'
    ).then(response => {
      if(response.ok) {
        if(response.passwordCorrect === false) {
          dispatch({
            type: UPDATEIN,
            path: ['lastError'],
            updater: () => (Immutable.fromJS({
              error: true,
              message: 'Старый пароль введен не верно'
            }))
          });
        } else if(response.data && response.data.isAuthorized) {
          dispatch({
            type: UPDATEIN,
            path: ['lastError'],
            updater: () => (Immutable.fromJS({
              error: false
            }))
          });
          dispatch({
            type: UPDATEIN,
            path: ['userdata'],
            updater: () => (Immutable.fromJS(response.data.userInfo))
          });
        }
      } else {
        if(response.result.match(/User with auth_hash.*is not found/)) {
          dispatch({
            type: FLUSH
          });
        }
        console.log('change password failed', response.result); //eslint-disable-line no-console
      }
    }, error => {
      dispatch({
        type: FLUSH
      });
      console.log('change password failed', error); //eslint-disable-line no-console
    });
  };
}

export function userDataConfirmByCode(to, code, contact, hashMode = false) {
  return dispatch => {
    getFromBack({
      action: 'user_confirmbycode',
      to: to,
      code: code,
      phone: to === 'phone' ? contact : null,
      email: to === 'email' ? contact : null,
      auth_hash: hashMode ? 1 : null //eslint-disable-line camelcase
    }).then(response => {
      if(response.ok) {
        if(hashMode && response.data) {
          dispatch({
            type: UPDATEIN,
            path: ['tempHash'],
            updater: () => (response.data)
          });
        } else if(response.data && response.data.isAuthorized) {
          dispatch({
            type: UPDATEIN,
            path: ['userdata'],
            updater: () => (Immutable.fromJS(response.data.userInfo))
          });
        }
      } else {
        dispatch({
          type: UPDATEIN,
          path: ['lastError'],
          updater: () => (Immutable.fromJS({
            error: true,
            message: response.result
          }))
        });
      }
    });
  };
}
