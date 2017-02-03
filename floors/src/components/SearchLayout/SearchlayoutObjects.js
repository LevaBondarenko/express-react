
/**
 * Searchform objects wrapper component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import shallowCompare from 'react-addons-shallow-compare';
import {map} from 'lodash';
import ItemTable from '../SearchLayout/ItemTable';
import RealtyRentItemTable from '../SearchLayout/RealtyRentItemTable';
import RealtyOutItemTable from '../SearchLayout/RealtyOutItemTable';
import RealtyItemTableNew2 from '../SearchLayout/RealtyItemTableNew2';
import CommerceSaleItemTable from '../SearchLayout/CommerceSaleItemTable';
import CommerceLeaseItemTable from '../SearchLayout/CommerceLeaseItemTable';

import NotFound from '../SearchLayout/NotFound';

/* global data*/
class SearchlayoutObjects extends Component {
  static propTypes = {
    housesResult: PropTypes.array,
    realtyType: PropTypes.string,
    layoutType: PropTypes.string,
    mediaSource: PropTypes.string,
    favorites: PropTypes.string,
    hideFlatInfo: PropTypes.string,
    showSlider: PropTypes.bool,
    ratings: PropTypes.string,
    newDesign: PropTypes.string,
    saleDate: PropTypes.string,
    saleWhatIt: PropTypes.string,
    saleHTML: PropTypes.string,
    saleBackground: PropTypes.string,
    dataUrl: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    store: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  getPropsBase = () => {
    let source = parseInt(this.props.mediaSource);

    if(source < 0) {
      source = data.options.mediaSource;
    }

    return {
      favorites: parseInt(this.props.favorites),
      source: source,
      dataUrl: this.props.dataUrl,
      realtyType: this.props.realtyType,
      showSlider: this.props.showSlider,
      layoutType: this.props.layoutType,
      hideFlatInfo: this.props.hideFlatInfo,
      ratings: parseInt(this.props.ratings),
      context: this.props.context,
      store: this.props.store,
      saleWhatIt: this.props.saleWhatIt,
      saleDate: this.props.saleDate,
      saleHTML: this.props.saleHTML,
      saleBackground: this.props.saleBackground
    };
  };

  getRealtyAction = () => {
    const {dataUrl} = this.props;
    let actionSL;

    map(dataUrl, value => {
      if(value.action_sl) {
        actionSL = value.action_sl;
      }
    });

    return actionSL;
  };

  getObjectItems = () => {
    const {housesResult, realtyType} = this.props;
    const actionSL = this.getRealtyAction();
    const propBase = this.getPropsBase();

    return housesResult && housesResult.map(house => {
      const objectProps = {
        ...propBase,
        house: house,
        key: `obj_${house.id}`
      };

      const templateObj = {
        'nh_flats': <ItemTable {...objectProps} flatsData={house.flats}/>,
        flats: <RealtyItemTableNew2 {...objectProps}/>,
        cottages: <RealtyOutItemTable {...objectProps}/>,
        rent: <RealtyRentItemTable {...objectProps}/>,
        offices: actionSL === 'sale' ?
          (<CommerceSaleItemTable {...objectProps}/>) :
          (<CommerceLeaseItemTable {...objectProps}/>)
      };

      return templateObj[realtyType];
    });
  };

  render() {
    const objects = this.getObjectItems() || [];

    return (
      <div className="searchResultWrapper clearfix row">
        {objects.length > 0 ? objects : <NotFound />}
      </div>
    );
  }
}

export default SearchlayoutObjects;
