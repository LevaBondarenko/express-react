/*
 * Etagi project
 * o.e.kurgaev@it.etagi.com
 */
/* global data */
import 'babel-polyfill';

import {each} from 'lodash';
import {parseUrl} from '../utils/Helpers';
import {renderClient} from '../utils/renderUtils';
import configureStore from './configureStore';
import Conditions from './Conditions';
import UserActions from '../actions/UserActions';

const {widget: widgets} = data;

export function clientApp(components) {
  const store = configureStore({});
  const propsGlobal = {
    path: decodeURI(window.location.pathname),
    dataUrl: parseUrl(),
    context: {
      insertCss: styles => styles._insertCss(),
      store: store
    },
    store: store
  };

  Conditions.assignStore(store);
  UserActions.assignStore(store);
  each(widgets, (widget, widgetName) => {
    widgetName = widgetName.replace('_Widget', '');
    if (Object.keys(widget).length === 1) {
      const propsWidget = widget[Object.keys(widget)[0]];
      const mountNode = document.getElementById(propsWidget.mountNode);

      renderClient(
        components[widgetName], propsWidget, propsGlobal, mountNode
      );

    } else {
      each(widget, instance => {
        const propsWidget = instance;
        const mountNode = document.getElementById(instance.mountNode);

        renderClient(
          components[widgetName], propsWidget, propsGlobal, mountNode
        );
      });
    }
  });
}
