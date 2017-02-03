import {FLUSH} from '../constants/settings-consts';

export function flushSettingsState() {
  return {
    type: FLUSH
  };
};
