/**
 * o.e.kurgaev@it.etagi.com
 */
import _extend from 'extend';
import {each, extend} from 'lodash';
import cheerio from 'cheerio';
import ReactDOM from 'react-dom/server';
import React from 'react';

const renderBlock = (contents, data, propsGlobal) => {
  const main = require('../../mainBoot');
  const mobile = require('../../mobileBoot');
  const appComponents =
    _extend(true, {}, main.mainComponents, mobile.mobileComponents);

  const $ = global.$ = cheerio.load(contents);

  each(data.widget, (widget, widgetName) => {
    widgetName = widgetName.replace('_Widget', '');

    if (Object.keys(widget).length === 1) {
      const propsWidget = widget[Object.keys(widget)[0]];

      if(appComponents[widgetName]) {
        const component = React.createElement(
          appComponents[widgetName], Object.assign(propsWidget, propsGlobal)
        );

        if(typeof component !== 'undefined') {
          $(`#${propsWidget.mountNode}`).empty().append(
            ReactDOM.renderToString(component)
          );
        }
      }

    } else {
      each(widget, instance => {
        const propsWidget = instance;

        if(appComponents[widgetName]) {
          const component = React.createElement(
            appComponents[widgetName], extend(propsWidget, propsGlobal)
          );

          if(typeof component !== 'undefined') {
            $(`#${propsWidget.mountNode}`).empty().append(
              ReactDOM.renderToString(component)
            );
          }
        }
      });
    }
  });
  return $.html({decodeEntities: false});
};

export default renderBlock;
