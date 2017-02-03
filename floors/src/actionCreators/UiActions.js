import {
  ADD,
  FLUSH,
  REMOVE,
  SETIN,
  UPDATEIN
} from '../constants/ui-consts';

export function addUiState(state) {
  return {
    type: ADD,
    state
  };
}

export function flushUiState() {
  return {
    type: FLUSH
  };
};

export function removeUiState(namespace) {
  return {
    type: REMOVE,
    namespace: namespace
  };
}

export function setInUiState(path, value) {
  return {
    type: SETIN,
    path: path,
    value: value
  };
}

export function updateInUiState(path, updater) {
  return {
    type: UPDATEIN,
    path: path,
    updater: updater
  };
}

// export function addUiAsync(state) {
//   return function(dispatch) {
//     setTimeout(() => {
//       return dispatch(addUiState(state));
//     }, 3000);
//   };
// }

// export function addRieltorCloudUsers(options) {
//   return function(dispatch) {
//     return getFromBack({
//       action: 'load_users',
//       department: options.department,
//       'city_id': options.cityId
//     }, 'post', '/msearcher_ajax.php').then(
//       response => {
//         const {0: activeUser, ...users} = response.users;
//         const {defaultMottos} = response;
//         const random = Math.floor(Math.random() * (defaultMottos.length));
//         const defaultMotto = defaultMottos[random];
//
//         dispatch(addUiState({
//           RieltorCloud: {
//             activeUser: activeUser,
//             users: users,
//             defaultMotto: defaultMotto
//           }
//         }));
//       }
//     );
//   };
// }
