import {FLUSH} from '../constants/collections-consts';

export function flushCollectionsState() {
  return {
    type: FLUSH
  };
};
