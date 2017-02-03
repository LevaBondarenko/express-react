/**
 * User store
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import Dispatcher from '../core/Dispatcher';
import UserTypes from '../constants/UserTypes';
import AppStore from '../stores/AppStore';


class UserStore extends AppStore {
  constructor() {
    super();
    this.flush();
  }

  flush() {
    this.data = {
      isAuthorized: false,
      isInitialized: false,
      userInfo: {
        id: 0,
        f: '',
        i: 'Пользователь',
        o: '',
        phone: '',
        phoneConfirmCode: 0,
        email: '',
        emailConfirmToken: null,
        login: '',
        password: null,
        authHash: null,
        sex: 3,
        birthday: null,
        country: null,
        city: null,
        tz: 'Asia/Yekaterinburg',
        provider: null,
        socialId: 0,
        socialPage: null,
        role: 1,
        riesId: 0,
        photo: null,
        dateCreated: null,
        lastLogin: null,
        status: null,
        isActivate: 1,
        personalManager: 0,
        uuid: null
      },
      realtorsevals: null,
      userMeta: {},
      userSocials: {},
      favorites: [],
      forReview: [],
      searches: [],
      messages: [],
      myauctions: [],
      myobjects: [],
      lots: [],
      showForm: UserTypes.FORM_NONE,
      survey: {},
      modules: [],
      invite: {},
      manager: {},
      objectsCache: {},
      bidOnObject: {}, //данныe для формы предложить свою цену
      ticketTypes: {},
      objs2compare: null
    };
  }
}

const userStore = new UserStore();

userStore.dispatchToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case UserTypes.USER_SET:
    userStore.set(action.property, action.data);
    userStore.emitChange();
    break;

  case UserTypes.USER_FLUSH:
    userStore.flush();
    userStore.emitChange();
    break;

  default:
  // Do nothing

  }

});

export default userStore;
