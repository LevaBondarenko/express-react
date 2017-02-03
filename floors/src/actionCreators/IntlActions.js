import {
  ADD,
  FLUSH,
  REMOVE,
  SETIN,
  UPDATEIN
} from '../constants/intl-consts';

export function addIntlState(state) {
  return {
    type: ADD,
    state
  };
}

export function flushIntlState() {
  return {
    type: FLUSH
  };
};

export function removeIntlState(namespace) {
  return {
    type: REMOVE,
    namespace: namespace
  };
}

export function setInIntlState(path, value) {
  return {
    type: SETIN,
    path: path,
    value: value
  };
}

export function updateInIntlState(path, updater) {
  return {
    type: UPDATEIN,
    path: path,
    updater: updater
  };
}
