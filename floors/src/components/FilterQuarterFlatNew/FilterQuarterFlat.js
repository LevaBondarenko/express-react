/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import {isEmpty, extend, size} from 'lodash';
import shallowCompare from 'react-addons-shallow-compare';
import mortgageHelpers from '../../utils/mortgageHelpers';
import withCondition from '../../decorators/withCondition';
import ga from '../../utils/ga';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
/*
* components
*/
import FavButton from '../../shared/FavButton';
import CompareButton from '../../shared/CompareButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import FilterQuarterFlatControls from './FilterQuarterFlatControls';
import NewhousesModal from './NewhousesModal';
import Sprite from './Sprite';

/**
 * React/Flux entities
 */
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import FilterQuarterStore from '../../stores/FilterQuarterStore';

import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {getMortgagePrograms} from '../../selectors/';

class FilterQuarterFlat extends Component {

  static propTypes = {
    favorites: PropTypes.string,
    context: React.PropTypes.shape(ContextType).isRequired,
    fillColor: PropTypes.string,
    orderType: PropTypes.string,
    fillColorSelected: PropTypes.string,
    strokeColor: PropTypes.string,
    strokeColorSelected: PropTypes.string,
    scrollSelector: PropTypes.string,
    layout3d: PropTypes.string,
    objectInfo: PropTypes.object,
    mortgage: PropTypes.object
  };

  static defaultProps = {
    orderType: 'auto',
    scrollSelector: '#mortgage-calc-title'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      mortgageMin: '',
      showModal: false,
      activeKey: 'info',
      object: props.objectInfo || {},
      typeLayout: FilterQuarterStore.myFlat.dolshik ? '0' :
        FilterQuarterStore.typeLayout,
      flat: FilterQuarterStore.myFlat,
    };
    this.styles = {
      fillColor: props.fillColor,
      fillColorSelected: props.fillColorSelected,
      strokeColor: props.strokeColor,
      strokeColorSelected: props.strokeColorSelected,
    };
  }

  componentDidMount() {
    FilterQuarterStore.onChange(this.processProps);
    setTimeout(() => {
      this.forceUpdate();
    }, 300);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = (props = this.props) => {
    let filteredPrograms = [];
    let mortgageMin = 0;

    if (props.mortgage) {
      if (size(props.mortgage.programs)) {
        const {avanse, years, credit, programs, banksFilter} = props.mortgage;
        const progFilter = {
          credit: credit,
          avanse: avanse,
          years: years,
        };

        filteredPrograms = mortgageHelpers.filterPercents(
          programs, progFilter, banksFilter, false
        );

        mortgageMin = filteredPrograms[0] ?
          filteredPrograms[0].monthPaymentPref ?
            filteredPrograms[0].monthPaymentPref :
            filteredPrograms[0].monthPayment : 0;
      }
    }

    this.setState(() => ({
      mortgageMin: mortgageMin,
      flat: FilterQuarterStore.myFlat,
      typeLayout: FilterQuarterStore.myFlat.dolshik ? '0' :
        FilterQuarterStore.typeLayout
    }));
  }

  toggleModal = (event = false) => {
    this.setState({
      showModal: !this.state.showModal,
      activeKey: event && event.target.dataset.activekey ?
        event.target.dataset.activekey : 'info'

    });
    if(event && event.target.dataset.activekey === 'book') {
      ga('tabs', 'zastr_popup_podrobnee_o_kvartire_Zabronirovat_kvartiru');
    }
    if(event && event.target.dataset.activekey === 'review') {
      ga('tabs',
          'zastr_popup_podrobnee_o_kvartire_Zapisatsja_na_prosmotr_kvartiry');
    }
    if(event) {
      event.preventDefault();
    }
  };

  trackPoput = () =>{
    ga('pageview', '_virtual_zastr_popup_podrobnee_o_kvartire');
  };

  getUpdate = () => {
    const {info} = this.state.object;

    const dateFormatted =
      (new Date(`${info.date_update.replace(' ', 'T')}+0500`))
        .toLocaleString(
          'ru',
          {month: 'long', day: 'numeric', year: 'numeric'}
        );

    return dateFormatted;
  }

  onLayoutClick = (event) => {
    event.preventDefault();
    const layout = event.target.dataset.layout;

    if(layout === '0') {
      ga('button', 'zastr_object_Planirovka_kvartiry');
    }
    if(layout === '1') {
      ga('button', 'zastr_object_Plan_jetazha');
    }


    FilterQuarterActions.layoutClick(layout);
  }

  getFavBtn = (withTitle = false) => {
    const {flat} = this.state;

    return this.props.favorites && parseInt(flat.price) > 0 ?
      <FavButton
        key={`newhouses_flat${flat.id}`}
        withTitle={withTitle}
        className='nh-flat-fav'
        oclass='nh_flats'
        oid={flat.id}/> : null;
  }

  getCompareBtn = (withTitle = false) => {
    const {flat} = this.state;

    return this.props.favorites && parseInt(flat.price) > 0 ?
      <CompareButton
        key={`newhouses_flat_comp${flat.id}`}
        className='nh-flat-comp'
        oclass={'nh_flats'}
        oid={flat.id}
        withTitle={withTitle}
        newBtn={true}
      /> : null;
  };

  getLayout = () => {
    const {typeLayout, flat} = this.state;
    const {
      'layout_floor': layout,
      layout2d,
      layout3d,
      'layout_sprite': sprite,
      'layout3d_preview': preview3d
    } = flat;

    let layoutHtml;

    if(typeLayout === '1' && layout) {
      if(size(sprite.percent) > 0) {
        layoutHtml = (<Sprite image={layout.toString()}
                coords={sprite.percent}
                flat={flat}
                house={FilterQuarterStore.myHouse}
                showHint={true}
                styles={this.styles}
                blockId='flatInfoSprite'
                dependentBlockId='bigSprite'
                height={300} />);
      } else {
        layoutHtml =  <img src={layout} />;
      }
    } else if (typeLayout === '0') {
      layoutHtml = layout2d ?
        <img src={layout2d} /> :
        <img style={{cursor: 'default'}} src={this.emptyPhoto} />;
    } else if (typeLayout === '2' && this.props.layout3d === '1') {
      layoutHtml = layout3d ?
        <img style={{cursor: 'default'}} src={preview3d} width='300px'/> :
        <img style={{cursor: 'default'}} src={this.emptyPhoto} />;
    }

    return layoutHtml;
  };

  get emptyPhoto() {
    return '//cdn-media.etagi.com/static/site/c/cc/' +
      'cce465b44fc819ccb72a9ed93685520fe1d1df8f.png';
  }

  getControlText = () => {
    return 'Подробнее о квартире';
  };

  getHaltOject = (event) => {
    const {flat} = this.state;

    if(canUseDOM) {
      window.open(`/realty/${flat.id}`, '_blank');
    }

    event.preventDefault();
  };

  trackMore = () =>{
    ga('button', 'zastr_Podrobnee_o_kvartire');
  }

  render() {
    const {object, flat, typeLayout, mortgageMin} = this.state;
    const {
      price: oldPrice,
      'price_discount': newPrice,
      square,
      layout3d,
      floor,
      dolshik,
      comission,
      'layout_sprite': sprite,
      'price_metr': priceSqrt
    } = flat;

    return (
        <div className="nh-flat-info">
          {!isEmpty(object) ? (
            <div className="nh-flat-updated">
              Обновлено:&nbsp;{this.getUpdate()}
            </div>
          ) : null}
          <div className="nh-flat-title-wrapper">
            <div className="nh-flat-title">
              {`${flat.rooms}-комнатная квартира`}
              <span className='nh-flat-floors'>
                Этаж: <span className='colorCrimson'>{floor}</span>
                /{object.info.floors}
              </span>
            </div>
            <div className="nh-flat-buttons">
              {this.getFavBtn()}
              {this.getCompareBtn()}
            </div>
          </div>
          <div className="nh-flat-imgswitcher clearfix">
            {!dolshik ? (
              <a href="#"
                 className={`nh-flat-link ${typeLayout === '1' ?
                   'active' : ''}`}
                 data-layout='1'
                 onClick={this.onLayoutClick}
                 title="План этажа">
                План этажа
              </a>
            ) : false}
            <a href="#"
               className={`nh-flat-link ${typeLayout === '0' || dolshik ?
                 'active' : ''}`}
               data-layout='0'
               onClick={this.onLayoutClick}
               title="План квартиры">
              План квартиры
            </a>
            {layout3d && this.props.layout3d === '1' ? (
            <a href="#"
               className={`nh-flat-link ${typeLayout === '2' ? 'active' : ''}`}
               data-layout='2'
               onClick={this.onLayoutClick}
               title="3D планировка">
              3D планировка
            </a>
            ) : null}
            <span className='nh-flat-link comission'>
                Стоимость услуг: <b>{comission && comission > 0 ?
                  (<Price price={comission}> <PriceUnit/></Price>) :
                  (<span>0 <PriceUnit/></span>) }</b>
            </span>
          </div>
          <div className="nh-flat-layout" onClick={this.trackPoput}>
            {this.getLayout()}
            {typeLayout !== '1' ? (
              <div>
                <div
                  onClick={!dolshik ? this.toggleModal : this.getHaltOject}
                  activeKey={this.state.activeKey}
                  className="nh-flat-moreoverlay"></div>
                <NewhousesModal {...this.props} {...this.state}
                  toggleModal={this.toggleModal}
                  flat={extend(true, {}, flat, {
                    mortgageMin: mortgageMin
                  })}
                  text={this.getControlText()}
                  spriteStyles={this.styles}
                  linkClassName='nh-flat-morelink aaa'
                  favBtn={this.getFavBtn}
                  compareBtn={this.getCompareBtn}
                />
              </div>
            ) : size(sprite.percent) > 0 ? (
              <div style={{display: 'none'}}>
                <NewhousesModal {...this.props} {...this.state}
                  toggleModal={this.toggleModal}
                  flat={extend(true, {}, flat, {
                    mortgageMin: mortgageMin
                  })}
                  text='Подробнее о квартире'

                  spriteStyles={this.styles}
                  linkClassName='nh-flat-morelink hiddenLink'
                  favBtn={this.getFavBtn}
                  compareBtn={this.getCompareBtn}
                />
              </div>
            ) : (
              <div>
                <div
                  onClick={!dolshik ? this.toggleModal : this.getHaltOject}
                  activeKey={this.state.activeKey}
                  className="nh-flat-moreoverlay"></div>
                <NewhousesModal {...this.props} {...this.state}
                  toggleModal={this.toggleModal}
                  flat={extend(true, {}, flat, {
                    mortgageMin: mortgageMin
                  })}
                  text={this.getControlText()}
                  linkClassName='nh-flat-morelink aaa'
                  favBtn={this.getFavBtn}
                  compareBtn={this.getCompareBtn}
                />
              </div>
            )}
          </div>
          <div className="nh-flat-props">
            <div className="nh-flat-prop">
              <div className="nh-flat-proplabel">Площадь</div>
              <div className="nh-flat-propvalue">{`${square} м²`}</div>
            </div>
            {parseInt(mortgageMin) ? (
              <div className="nh-flat-prop">
                <div className="nh-flat-proplabel">В ипотеку</div>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    $('html, body').animate({
                      scrollTop: $(this.props.scrollSelector).offset().top
                    }, 1000);
                  }}
                  className="nh-flat-propvalue mortHighlight">
                  {<Price price={mortgageMin}> <PriceUnit/>
                    /мес.
                  </Price>}
                </div>
              </div>) : null}
            <div className="nh-flat-prop">
              <div className="nh-flat-proplabel">
                Стоимость за м<sup>2</sup>
              </div>
              <div className="nh-flat-propvalue">
                <Price price={priceSqrt}> <PriceUnit/></Price>
              </div>
            </div>
            <div className="nh-flat-prop">
              <div className="nh-flat-proplabel">Стоимость</div>
              <div className="nh-flat-propvalue nh-flat-propvalue-biggreen">
                {<Price price={newPrice}> <PriceUnit/></Price>}
                {oldPrice !== newPrice ? (
                  <div className="nh-flat-oldPrice">
                    <Price price={oldPrice}> <PriceUnit/></Price>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <FilterQuarterFlatControls
            toggleModal={this.toggleModal}
            flat={flat}
            trackMore={this.trackMore}
            trackReview={this.trackReview}
            trackBook={this.trackBook}/>
        </div>
    );
  }
}

FilterQuarterFlat = connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state),
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : null
    };
  }
)(FilterQuarterFlat);

FilterQuarterFlat = withCondition()(FilterQuarterFlat);

export default FilterQuarterFlat;
