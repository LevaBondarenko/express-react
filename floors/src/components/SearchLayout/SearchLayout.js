/**
 * Searchform house component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {isEqual, clone} from 'lodash';
import UserAgentData from 'fbjs/lib/UserAgentData';

import {scrollTo} from '../../utils/Helpers';
import SearchlayoutView from '../SearchLayout/SearchlayoutView';
import SearchlayoutObjects from '../SearchLayout/SearchlayoutObjects';
import SearchPagingNew from '../SearchPaging/SearchPagingNew';
import SearchStore from '../../stores/SearchStore';
import mss from '../../stores/ModularSearcherStore';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import {getSearchResult, setResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';

/*eslint camelcase: [2, {properties: "never"}]*/
/* global data*/

class Searchlayout extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    pageNum: PropTypes.number,
    perPage: PropTypes.number,
    offset: PropTypes.number,
    currentPage: PropTypes.number,
    isLoading: PropTypes.bool,
    layoutType: PropTypes.string,
    layoutHeader: PropTypes.string,
    layoutSeoText: PropTypes.string,
    object_list: PropTypes.array,
    layoutMap: PropTypes.array,
    mountNode: PropTypes.string,
    realtyType: PropTypes.string,
    subscription: PropTypes.string,
    hideFlatInfo: PropTypes.string,
    hideHeader: PropTypes.string,
    hideBtnType: PropTypes.string,
    saleWhatIt: PropTypes.string,
    showSlider: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool
    ])
  };

  static defaultProps = {
    hideBtnType: '0',
    showSlider: true
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      searchModel: clone(mss.get()),
      pageNum: props.pageNum,
      perPage: props.perPage,
      offset: props.offset,
      currentPage: props.currentPage,
      isLoading: props.isLoading,
      housesResult: data.objects && data.objects.list || [],
      realtyType: props.realtyType,
      subscription: props.subscription,
      layoutType: props.layoutType,
      blockHeight: 0,
      showDeviation: data.options.priceDeviationOptions.show,
      hideFlatInfo: props.hideFlatInfo,
      hideBtnType: parseInt(props.hideBtnType) || 0,
      saleWhatIt: props.saleWhatIt,
      showSlider: props.showSlider === true ||
        props.showSlider === 'true' ||
        props.showSlider === '1'
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState, this.state);
  }

  componentDidMount() {
    const {mountNode} = this.props;
    const {perPage, offset, realtyType, layoutType, housesResult} = this.state;

    ModularSearcherActions.set(null, {
      layoutType: layoutType,
      realtyType: realtyType
    });


    setResult(housesResult);
    getSearchResult(realtyType, perPage, offset, mss.get(), {});

    ModularSearcherActions.getLimits(perPage, offset)
      .then(
        ModularSearcherActions.getCountPeriod(perPage, offset, 'countAll'),
        ModularSearcherActions.getCountPeriod(perPage, offset, 'countMonth'),
        ModularSearcherActions.getCountPeriod(perPage, offset, 'countWeek'),
        ModularSearcherActions.getCountPeriod(perPage, offset, 'countDay'),
      );

    if(layoutType === '1') {
      setTimeout(() => {
        const el = document.getElementById(mountNode);
        const wrapper = el.parentElement.parentElement;
        const height = window.innerHeight - wrapper.offsetTop;

        this.setState({
          blockHeight: height
        });
      }, 100);
    }


    SearchStore.onChange(this.onChange);
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    SearchStore.off(this.onChange);
  }

  handlePageClick = (data) => {
    const selected = parseInt(data.selected);
    const offset = Math.ceil(selected * this.state.perPage);

    if (this.state.currentPage - selected === -1) {
      ga('button', 'site_search_pagination_up_forward');
    } else if (this.state.currentPage - selected === 1) {
      ga('button', 'site_search_pagination_up_backward');
    }

    Url.updateSearchParam('currentPage', parseInt(selected) + 1);

    ModularSearcherActions.set('offset', offset);
    getSearchResult(this.state.realtyType, this.state.perPage,
      offset,
      mss.get(),
      {}
    );

  }

  handlePageClickBottom = (data) => {
    const selected = parseInt(data.selected);
    const offset = Math.ceil(selected * this.state.perPage);

    if (this.state.currentPage - selected === -1) {
      ga('button', 'site_search_pagination_down_forward');
    } else if (this.state.currentPage - selected === 1) {
      ga('button', 'site_search_pagination_down_backward');
    }

    Url.updateSearchParam('currentPage', parseInt(selected) + 1);

    ModularSearcherActions.set('offset', offset);
    getSearchResult(this.state.realtyType, this.state.perPage,
      offset,
      mss.get(),
      {}
    );
  }

  componentDidUpdate(prevProps, prevState) {

    if(this.state.offset !== prevState.offset) {
      const element = document.getElementsByClassName('result--control')[0];

      if(element.offsetTop < window.pageYOffset) {
        const elementTop = UserAgentData.browserName === 'Firefox' ?
          document.documentElement :
          document.body;

        if(UserAgentData.browserName === 'IE') {
          $('body, html').animate({scrollTop: 0}, 'slow');
        } else {
          setTimeout(() => {
            scrollTo(elementTop, element.scrollTop, 600);
          }, 60);
        }
      }
    }
  }

  onChange = () => {
    const {perPage, isLoading, layoutMap,
      count_houses, countAll, countMonth, countWeek, countDay} = mss.get();
    let {pageNum, offset, count, currentPage} = mss.get();
    const resultHouses = SearchStore.getResult();

    count = count_houses ? count_houses : count; // eslint-disable-line camelcase

    offset = offset || 0;
    currentPage = offset === 0 ? 0 : (offset / perPage);
    const layoutType = this.state.layoutType;

    pageNum = Math.ceil(count / perPage);

    if (currentPage > pageNum) {
      currentPage = 0;
      offset = 0;
    }

    this.setState({
      pageNum: pageNum,
      perPage: perPage,
      offset: offset,
      isLoading: isLoading,
      currentPage: currentPage,
      housesResult: resultHouses,
      layoutMap: layoutMap,
      layoutType: layoutType,
      countAll: countAll,
      countMonth: countMonth,
      countWeek: countWeek,
      countDay: countDay,
    });

  }

  render() {
    const {housesResult, showSlider} = this.state;
    const {hideHeader, layoutSeoText} = this.props;
    const seoTemplate = data.page.request ? (
      <div className='layout-seo-text'
        dangerouslySetInnerHTML={{__html: layoutSeoText}} />
    ) : '';

    return (
      <div className='fullHeight'>
        <SearchlayoutView {...this.props} {...this.state}>
          <SearchPagingNew {...this.state}
            handlePageClick={this.handlePageClick}
            hideHeader={hideHeader}
          />
          <SearchlayoutObjects {...this.props}
            housesResult={housesResult}
            showSlider={showSlider} />
          <SearchPagingNew {...this.state}
            bottom={true}
            handlePageClick={this.handlePageClickBottom}
            hideHeader={hideHeader}
          />
        </SearchlayoutView>
        {seoTemplate}
      </div>
    );
  }
}

export default Searchlayout;
