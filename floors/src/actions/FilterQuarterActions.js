/**
 * Searchform widget actions
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import FilterQuarterTypes from '../constants/FilterQuarter';

export default {

  change(type, value) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_CHANGE,
      type: type,
      value: value,
      isLoading: true
    });
  },

  click(value) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_CLICK,
      value: value
    });
  },

  layoutClick(value) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_LAYOUTCLICK,
      value: value
    });
  },

  fill(gp) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_FULLCOLLECTIONS,
      gp
    });
  },

  setDataFromUrl(urlData) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_SETURLDATA,
      data: urlData,
      isLoading: true
    });
  },

  setFlat(dataFlat, layout) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_SETFLAT,
      data: dataFlat,
      layout: layout,
      isLoading: true
    });
  },

  setComission(data) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_SETCOMISSION,
      data: data
    });
  },

  setMortgageMinPrice(value) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_MINMORTGAGE,
      data: value
    });
  },

  getFlat() {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_GETFLAT
    });
  },

  neighborFlat(section, floor, price, dataEvent) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_NEIGHBORFLAT,
      section: section,
      floor: floor,
      price: price,
      event: dataEvent
    });
  },
  setCurrentSection(id) {
    Dispatcher.handleViewAction({
      actionType: FilterQuarterTypes.FILTERQUARTER_SET_CURRENT_SECTION,
      section: id
    });
  }
};
