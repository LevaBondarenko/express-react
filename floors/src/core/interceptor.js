/**
 * main app middleware
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import middlewares from '../middlewares/';

const interceptor = store => next => action => {
  const {type, path} = action;

  const module = path ? path[0] : null;

  if(middlewares[module] &&
    middlewares[module].actionTypes.indexOf(type) > -1) {
    const prevState = store.getState().objects.toJS()[module];
    const settings = store.getState().settings.toJS();

    middlewares[module]
      .actionHandler(action, prevState, store.dispatch, settings);
  }

  return next(action);
};

export default interceptor;
