/**
 * Widgets state store
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*global $*/
import {each, map, assignIn} from 'lodash';
import {getAllElementsWithAttribute, getUrlData} from '../utils/Helpers';
import jsep from 'jsep';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

// stores
import wss from '../stores/WidgetsStateStore';
import mss from '../stores/ModularSearcherStore';
import userActions from '../actions/UserActions';


class Conditions {
  constructor() {
    const self = this;

    this.conditions = {};
    this.conditionsAll = {};
    this.ui = null;
    this.intl = null;
    this.objects = null;
    this.settings = null;
    this.initialized = false;
    this.sourceIsRedux = false;

    if (canUseDOM) {
      this.init();
      setTimeout(() => {
        self.checkTextWidgets();
      }, 500);
    }
  }

  init() {
    if (!this.initialized) {
      const widgetCollection = getAllElementsWithAttribute(
        'data-condition',
        'section'
      );
      const textWidgetCollection = getAllElementsWithAttribute(
        'data-condition',
        'div'
      );

      this.conditionsAll = this.parseConditions(textWidgetCollection);
      this.conditions = this.parseConditions(widgetCollection);
    }
    this.initialized = true;
  }

  checkHidden(widgetId) {
    const conditions = this.conditions[widgetId];
    const result = conditions ? !this.checkCondition(conditions) : false;

    if(result) {
      conditions && (conditions.widget.style.display = 'none');
    } else {
      conditions && (conditions.widget.style.display = 'block');
    }
    return !this.sourceIsRedux && result;
  }

  checkTextWidgets() {
    const self = this;

    each(this.conditionsAll, conditions => {
      if (self.checkCondition(conditions)) {
        conditions.widget.style.display = 'block';
      } else {
        conditions.widget.style.display = 'none';
      }
    });
  }

  checkAllWidgets = () => {
    const self = this;

    each(assignIn(this.conditions, this.conditionsAll), conditions => {
      if (self.checkCondition(conditions)) {
        conditions.widget.style.display = 'block';
      } else {
        conditions.widget.style.display = 'none';
      }
    });
  }

  parseConditions(widgetCollection) {
    const conditions = {};

    each(widgetCollection, (widget, c) => {

      const widgetId = widget.id  ?
        widget.id.split('_')[1] :
        c;

      if (widget.dataset.condition) {
        conditions[widgetId] = jsep(widget.dataset.condition);
        conditions[widgetId]['widget'] = widget;
      }

    });

    return conditions;
  }

  checkCondition(condition) {
    if (condition) {
      return this.evaluate(condition);
    }
  }

  evaluate(condition) {

    let result = false;

    if (condition.type !== 'LogicalExpression') {
      const left = condition.left;
      const right = condition.right.name ?
                  condition.right.name :
                  condition.right.value;
      const operator = condition.operator;
      const leftSideValue = this.getValue(
        left, left.property.type === 'Literal' ?
        left.property.raw : left.property.name
      );

      if (leftSideValue !== 'request') {
        result = eval(`\'${leftSideValue}\'${operator}\'${right}\'`); // eslint-disable-line no-eval
      } else {
        result = true;
      }
    } else {
      const leftResult = this.evaluate(condition.left);
      const rightResult = this.evaluate(condition.right);

      result = eval(`${leftResult}${condition.operator}${rightResult}`); // eslint-disable-line no-eval
    }

    return result;
  }

  buildObject(expr) {
    const result = [];

    if (expr.object.type === 'Identifier') {
      result.push(expr.object.name);
    } else {
      let isMember = true;

      while (isMember) {
        expr = expr.object;

        result.push(expr.property.name);

        if (expr.object.type === 'Identifier') {
          result.push(expr.object.name);
          isMember = false;
        }
      }
    }

    return result.reverse();
  }

  buildResult(obj, value, nameArr) {
    for (let i = 0; i < nameArr.length; i++) {
      if (obj[nameArr[i]]) {
        obj = obj[nameArr[i]];
      } else {
        obj = undefined;
        break;
      }
    }
    return obj ? obj[value] : undefined;
  }

  getUserAction(value, object) {
    let result;

    switch (value) {
    case 'inFavorite':
      result = userActions.inFavorite(object.object_id, object.class);
      break;
    case 'inCompare':
      result = userActions.inCompare(object.object_id, object.class);
      break;
    default:
      break;
    }

    return result;
  }

  getValue(expr, value) {
    let result;
    /* global data */
    const object = data.object && data.object.info;
    const widgetsAll = data.widget;
    const nameArr = this.buildObject(expr);
    const nameTop = nameArr[0];

    nameArr.splice(0, 1);
    this.sourceIsRedux = false;
    switch (nameTop) {
    case 'get':
      result = this.getUrlParams(value);
      break;
    case 'object':
      result = this.buildResult(object, value, nameArr);
      break;
    case 'wss':
      result = this.buildResult(wss.get(), value, nameArr);
      break;
    case 'user':
      result = this.getUserAction(value, object);
      break;
    case 'mss':
      result = this.buildResult(mss.get(), value, nameArr);
      break;
    case 'data':
      result = this.buildResult(data.options, value, nameArr);
      break;
    case 'request':
      result = 'request';
      break;
    case 'ui':
      this.sourceIsRedux = true;
      this.ui || (this.ui = this.store.getState().ui.toJS());
      result = this.buildResult(
        this.ui,
        value,
        nameArr
      );
      break;
    case 'objects':
      this.sourceIsRedux = true;
      this.objects || (this.objects = this.store.getState().objects.toJS());
      result = this.buildResult(
        this.objects,
        value,
        nameArr
      );
      break;
    case 'intl':
      this.sourceIsRedux = true;
      this.intl || (this.intl = this.store.getState().intl.toJS());
      result = this.buildResult(
        this.intl,
        value,
        nameArr
      );
      break;
    case 'settings':
      this.sourceIsRedux = true;
      this.settings || (this.settings = this.store.getState().settings.toJS());
      result = this.buildResult(
        this.settings,
        value,
        nameArr
      );
      break;
    default:
      const widgets = widgetsAll[`${name}_Widget`];
      const tempRes = map(widgets, widget => widget[value]);

      result = tempRes; // array!!!
    }

    return result;
  }

  getUrlParams(param) {
    const query = canUseDOM ? getUrlData(window.location.href) : {};
    const getParams = {};

    // если строка с get параметрами, сохраняем их
    if (query.search) {
      const paramsRaw = query.search.replace('?', '').split('&');

      each(paramsRaw, p => {
        const obj = p.split('=');
        const k = obj[0];
        const v = obj[1] ? obj[1] : 0;

        getParams[k] = v;
      });
    }

    return getParams[param];
  }

  assignStore = store => {
    this.store = store;
    store.subscribe(this.listener);
  }

  listener = () => {
    this.ui = null;
    this.intl = null;
    this.objects = null;
    this.settings = null;
    this.checkAllWidgets();
  }
}

const conditions = new Conditions();

export default conditions;
