/**
 * BuilderPromo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {uniq, map, minBy, maxBy, size,
  filter, each, find, isEmpty, clone} from 'lodash';
import Helpers from '../../utils/Helpers';
import GeminiScrollbar from 'react-gemini-scrollbar';
import mediaHelpers from '../../utils/mediaHelpers';
import request from 'superagent';
/* global data */
/*eslint camelcase: [2, {properties: "never"}]*/
import withCondition from '../../decorators/withCondition';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import ga from '../../utils/ga';

class BuilderObjectsDataTable extends Component {
  static propTypes = {
    flats: React.PropTypes.array,
    location: React.PropTypes.string
  };
  constructor(props) {
    super(props);
  }

  render() {

    const {flats, location} = this.props;
    const rooms = uniq(map(flats, 'rooms'));
    const dataTable = map(rooms, (room) => {
      const sizeActive = filter(flats, {rooms: room.toString()});
      const minArea = minBy(sizeActive, (flat) => {
        return parseFloat(flat.square);
      }).square;
      const maxArea = maxBy(sizeActive, (flat) => {
        return parseFloat(flat.square);
      }).square;
      const minPrice = minBy(sizeActive, (flat) => {
        return parseFloat(flat.price);
      }).price;
      const maxPrice = maxBy(sizeActive, (flat) => {
        return parseFloat(flat.price);
      }).price;

      if (size(sizeActive) > 0) {
        return (
          <tr key={room}>
            <td>{room}</td>
            {(minArea === maxArea ?
                <td>{maxArea}</td> : <td>{minArea} - {maxArea}</td>
            )}
            {(minPrice === maxPrice ?
              <td><Price price={maxPrice}/></td> :
              <td><Price price={minPrice}/> - <Price price={maxPrice}/></td>)}
            <td><a href={location}>{size(sizeActive)}</a></td>
          </tr>
        );
      }
    });

    return (
      <tbody>{dataTable}</tbody>
    );
  }
}

class BuilderObjectsMenu extends Component {
  static propTypes = {
    onMenuItemClick: React.PropTypes.func,
    menu: React.PropTypes.array,
    gpId: React.PropTypes.string,
    flatsCount: React.PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  menuClick() {
    const id = arguments[0];

    this.props.onMenuItemClick(id);
  }

  render() {
    const gpId = this.props.gpId;
    const flatsCount = this.props.flatsCount;
    const menuItems = this.props.menu.map(item => {
      const count = flatsCount[item.object_id];

      item.metaValue = item.metaValue.replace(/&quot;/g, '');
      return (
        <li className={item.object_id === gpId ? 'active' : ''}
            key={`gp_${item.object_id}`}
            id={`gp_${item.object_id}`}
            onClick={this.menuClick.bind(this, item.object_id)}>
          <div className="obj-name">
            {item.metaValue} <span className="text-lowercase">
            ({count} {Helpers.declOfNum(
            count, ['квартира', 'квартиры', 'квартир']
          )})</span>
          </div>
        </li>
      );
    });

    return (
      <ul>{menuItems}</ul>
    );
  }
}

class BuilderObjectsDescription extends Component {
  static propTypes = {
    gp: React.PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {

    const gp = this.props.gp;
    let deadlineTitle;

    if (gp.deadline_q &&
      gp.deadline_y &&
      gp.deadline_q !== '0') {
      deadlineTitle = `Срок сдачи ${gp.deadline_q} кв. ${gp.deadline_y}`;
    } else if(!gp.deadline_q ||
      gp.deadline_q === '0' &&
      gp.deadline_y) {
      deadlineTitle = `Срок сдачи ${gp.deadline_y} г.`;
    }

    return (
      <div className="item--description col-md-7">
        {(gp.district ? <p>Район: {gp.district}</p> : '')}
        {(gp.deadline === true ?
            <p>Дом сдан</p> :
            <p>{deadlineTitle}</p>
        )}
        {(gp.trim > 0 ? <p>Готовность {gp.trim}%</p> : '')}
      </div>
    );
  }

}

@withCondition()
class BuilderObjects extends Component {
  static propTypes = {
    gpCards: React.PropTypes.array,
    menu: React.PropTypes.array,
    dataUrl: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    builderName: React.PropTypes.string,
    builder_id: React.PropTypes.string,
    positionType: React.PropTypes.string,
    hideFlatInfo: React.PropTypes.string,
    declarationButtonText: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.totalCount = {};
    this.state = {
      gpId: 0,
      gpCards: [],
      menu: []
    };
  }

  componentDidMount() {
    const dataArr = {};

    dataArr.action = 'get_builder_objects';
    dataArr['builder_id'] = this.props.builder_id;

    const uri = Helpers.generateSearchUrl(dataArr, '/backend/?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {

        // квартиры могут быть забиты в одинаковых местах в доме
        // это тоже нужно проверить
        const rawGpCards = res.body.objects;

        each(rawGpCards, gpCard => {
          const places = [];

          gpCard.flats = filter(gpCard.flats, flat => {
            const idx = `${flat.floor}${flat.section}${flat.rooms}
            ${flat.floors}${flat.on_floor}`;

            if (places.indexOf(idx) === -1) {
              places.push(idx);
              return true;
            }
            return false;
          });
        });

        this.setState(() => ({
          gpCards: rawGpCards,
          menu: res.body.menu
        }));
      });
  }


  shouldComponentUpdate(nextProps, nextState) {
    return nextState.gpCards.length > 0;
  }

  findGp(id) {
    const gpCards = this.state.gpCards;

    return id ? find(gpCards, {id: id}) : gpCards[0];
  }

  changeGp(id) {

    this.setState({gpId: id});
  }

  flatsCount(gpCards) {
    let total = {};

    if (isEmpty(this.totalCount)) {
      each(gpCards, gp => {
        if (!total[gp.id]) {
          total[gp.id] = 0;
        }

        total[gp.id] += gp.flats.length;
      });

      this.totalCount = total;
    } else {
      total = this.totalCount;
    }
    return total;
  }

  getMinItemPriceBlock = (priceMinItem) => {

    let minItemHTML;

    if (typeof this.props.hideFlatInfo === 'undefined' ||
      parseInt(this.props.hideFlatInfo) === 0) {
      minItemHTML = (
        <span className="item--price pull-right">
          <span>от </span>
          <Price price={priceMinItem.price}/>&nbsp;
          <PriceUnit/>
        </span>
      );
    }
    return minItemHTML;
  };

  trackDecklar = () =>{
    ga('button', 'zastr_Proektnaja_deklaracija');
  };

  trackMore = () =>{
    ga('button', 'zastr_podrobnee');
  };

  getFlatInfo = (currentGp,locationUrl) => {

    let flatinfo = (
      <div className="row">
        <div className="item--flatstable col-md-12">
          <div className="table-responsive-placeholder">
          </div>
        </div>
      </div>
    );

    if (typeof this.props.hideFlatInfo === 'undefined' ||
      parseInt(this.props.hideFlatInfo) === 0) {
      flatinfo = (
        <div className="row">
          <div className="item--flatstable col-md-12">
            <div className="table-responsive">
              <table className="table">
                <thead>
                <tr>
                  <th>
                    <span className="bordered-table">Комнаты</span>
                  </th>
                  <th>
                      <span className="bordered-table">
                        <span>
                          Площадь (м</span><sup>2</sup><span>)
                        </span>
                      </span>
                  </th>
                  <th>
                      <span className="bordered-table">
                        Цена (<PriceUnit/>)
                      </span>
                  </th>
                  <th>
                      <span className="bordered-table">
                        Квартир в наличии
                      </span>
                  </th>
                </tr>
                </thead>
                <BuilderObjectsDataTable flats={currentGp.flats}
                                         location={locationUrl} />
              </table>
            </div>
          </div>
        </div>
      );
    }
    return flatinfo;
  }

  render() {

    if (this.state.gpCards.length === 0) {
      return (
        <div></div>
      );
    }

    const menu = this.state.menu;
    const changeGp = this.changeGp.bind(this);
    const state = this.state;
    const currentGp = clone(this.findGp(state.gpId));
    const gp = currentGp.gp.replace(/&quot;/g, '');
    let mainPhoto = currentGp.main_photo.replace('/photos/', '');
    const location = Helpers.locationSlugUrl(
      currentGp.slugUrl, this.props.dataUrl
    );
    const fildPd = `//ries3.etagi.com/${currentGp.info.file_pd}`;
    const fildPdClass = 'col-md-3 item--controls__more item--controls__pd';
    const {declarationButtonText} = this.props;
    const pd = currentGp.info.file_pd ? (
      <a href={fildPd} target='_blank' className={fildPdClass}
        onClick={this.trackDecklar}>
        {declarationButtonText}
      </a>
    ) : null;

    const priceMinItem = minBy(currentGp.flats, (f) => {
      return parseFloat(f.price);
    });

    let builderName = this.props.builderName;
    const builderSlug = this.state.gpCards[0].builderSlug;


    builderName = parseInt(this.props.positionType) !== 0 ?
      (<a href={`/zastr/builder/${builderSlug}`}>{builderName}</a>) :
      builderName;
    mainPhoto = (data.options.mediaSource ?
      mediaHelpers.getApiMediaUrl(
        '320240',
        'photos',
        mainPhoto,
        data.options.mediaSource) :
      `//media.etagi.com/photos/313/139/0/1/0/0/0/0/0/${mainPhoto}`);

    return (
      <div className="builder-objects">
        <h3 className="widget-name">{'Проекты застройщика '} {builderName} </h3>
        <div className="builder-objects-wrapper">
          <div className="builder-objects-menu">
            <GeminiScrollbar>
              <BuilderObjectsMenu menu={menu}
                                  gpId={currentGp.id}
                                  flatsCount={this.flatsCount(state.gpCards)}
                                  onMenuItemClick={changeGp}/>
            </GeminiScrollbar>
          </div>
          <div className="builder-object-details objects--item">
            <div className="objects--item__title clearfix">
              <h3 className="pull-left col-md-8">
                <b>
                  <a className="__titleGpLink" href={location}>{gp}</a>
                </b>
              </h3>
              {this.getMinItemPriceBlock(priceMinItem)}
            </div>
            <div className="objects--item__content ">
              <div className="row row-eq-height clearfix">
                <div className="item--img_wrap col-md-5">
                  <a href={location}>
                    <img
                      src={mainPhoto}
                      alt=""
                      style={{maxHeight: '139px'}} />
                  </a>
                </div>
                <BuilderObjectsDescription gp={currentGp} />
              </div>
              {this.getFlatInfo(currentGp,location)}
              <div className="item--controls builderObjects">
                <a href={location}  className="col-md-3 item--controls__more"
                   onClick={this.trackMore}>
                  Подробнее
                </a>
                {pd}
              </div>
            </div>
          </div>
          <div className="clear"></div>
        </div>
        <div className="clear"></div>
      </div>
    );
  }
}

export default BuilderObjects;
