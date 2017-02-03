/**
 * LK Favorites component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import UserAgentData from 'fbjs/lib/UserAgentData';
import classNames from 'classnames';
import SearchPaging from '../SearchPaging/SearchPaging';
import {map, size, includes, without, find} from 'lodash';
import {scrollTo} from '../../utils/Helpers';
import HelpIcon from '../../shared/HelpIcon';
import LKFavoritesSoldBlock from '../LKBody/LKFavorites/LKFavoritesSoldBlock';
import LKSignForReview from '../LKBody/LKFavorites/LKSignForReview';
import LKFavoritesItem from '../LKBody/LKFavorites/LKFavoritesItem';
import LKFavoritesShare from '../LKBody/LKFavorites/LKFavoritesShare';
import LKFavoritesDeletedItem
  from '../LKBody/LKFavorites/LKFavoritesDeletedItem';
import LKManager from '../LKManager/LKManager';
import createFragment from 'react-addons-create-fragment';
import ga from '../../utils/ga';

/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

/* global data */

class LKFavorites extends Component {
  static propTypes = {
    favType: React.PropTypes.string,
    favorites: React.PropTypes.array,
    forReview: React.PropTypes.array,
    onFavTypeChange: React.PropTypes.func,
    onFavPageChange: React.PropTypes.func,
    dataUrl: React.PropTypes.array,
    objects: React.PropTypes.object,
    user: React.PropTypes.object,
    isAuthorized: React.PropTypes.bool,
    similarityParams: React.PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      favTypes: [],
      perPage: 10,
      currentPage: 0,
      offset: 0,
      objects: this.syncFavData(props),
      favorites: props.favorites,
      forReview: props.forReview
    };
    this.onFavTypeChange = this.onFavTypeChange.bind(this);
    this.onFavPageChange = this.onFavPageChange.bind(this);
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/favorites');


    this.trackEvent = () => {};
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      objects: this.syncFavData(nextProps),
      favorites: nextProps.favorites,
      forReview: nextProps.forReview
    }));
  }

  syncFavData(nextProps) {
    const favData = {}, {favorites, objects} = nextProps;

    for(const i in favorites) {
      if(favorites[i]) {
        if(!favData[favorites[i].class]) {
          favData[favorites[i].class] = {};
        }
        favData[favorites[i].class][favorites[i].id] = favorites[i];
      }
    }
    for(const type in objects) {
      if(objects[type]) {
        for(const i in objects[type]) {
          if(objects[type][i]) {
            const oclass = type !== 'rent' ?
              (objects[type][i].class === 'newhousesflats' ||
              objects[type][i].class === 'flats_secondary_no' ?
                'nh_flats' : objects[type][i].class) : 'rent';

            objects[type][i].favData =
              favData[oclass] && favData[oclass][objects[type][i].object_id] ?
              favData[oclass][objects[type][i].object_id] : (
                favData['rent'] && favData['rent'][objects[type][i].object_id] ?
                favData['rent'][objects[type][i].object_id] : {}
              );
          }
        }
      }
    }
    return objects;
  }

  onFavTypeChange(e) {
    let newType = this.state.favTypes;
    const favtype = e.target.dataset.favtype ? e.target.dataset.favtype :
      e.target.parentElement.dataset.favtype;

    e.target.blur();
    e.target.parentElement.blur();
    if(includes(newType, favtype)) {
      newType = without(newType, favtype);
    } else {
      newType.push(favtype);
    }

    this.setState(() => ({
      offset: 0,
      currentPage: 0,
      favTypes: newType
    }));
  }

  filterObjects(favTypes, offset) {
    const {perPage, objects, favorites, forReview} = this.state;
    const filteredObjects = [];
    let c = 0;

    for(const i in favorites) {
      if(favorites[i]) {
        let obj = false;
        const inForReview = find(forReview, {
          class: favorites[i].class, id: favorites[i].id
        });

        if((!favTypes.length || includes(favTypes, favorites[i].class) ||
          (includes(favTypes, 'review') && inForReview)) &&
          objects[favorites[i].class] &&
          objects[favorites[i].class][favorites[i].id]) {
          obj = objects[favorites[i].class][favorites[i].id];
        }
        if((!favTypes.length || includes(favTypes, 'sold')) && objects.sold &&
          objects.sold[favorites[i].id] &&
          (objects.sold[favorites[i].id].class === favorites[i].class ||
          favorites[i].class === 'rent')) {
          obj = objects.sold[favorites[i].id];
        }
        if(!obj && false) { //пока отключил
          obj = {
            status: 'deleted',
            class: favorites[i].class,
            object_id: favorites[i].id // eslint-disable-line camelcase
          };
        }

        if(obj) {
          c++;
          if(c > offset && c <= offset + perPage || offset < 0) {
            filteredObjects.push(obj);
          }
        }
      }
    }

    return filteredObjects;
  }

  onFavPageChange(data) {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.perPage);
    const element = document.getElementsByClassName('lkbody-favorites')[0];

    this.setState(() => ({
      offset: offset,
      currentPage: selected
    }));
    if(element && element.offsetTop < window.pageYOffset) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
        document.documentElement :
        document.body;

      setTimeout(() => {
        scrollTo(elementTop, element.scrollTop, 600).then(() => {}, () => {});
      }, 0);
    }
  }

  render() {
    const {favTypes, offset, objects, favorites, forReview} = this.state;
    const filteredObjects = this.filterObjects(favTypes, offset);
    const pageNum = 1 +
      this.filterObjects(favTypes, -1).length / this.state.perPage | 0;
    const soldBlock = size(objects.sold) ? (
      <LKFavoritesSoldBlock
        objsCount={size(favorites)}
        soldCount={size(objects.sold)} />
    ) : null;
    const favTypesArr = {
      flats: 'Вторичная',
      nh_flats: 'Новостройки', // eslint-disable-line camelcase
      cottages: 'Загородная',
      offices: 'Коммерческая',
      rent: 'Аренда',
      sold: 'продано',
      review: 'на просмотр'
    };

    this.trackEvent();

    let favTypeSelector = map(favTypesArr, (item, key) => {
      let count;

      if(key === 'review') {
        count = size(forReview);
      } else {
        count = objects[key] ? size(objects[key]) : 0;
      }

      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': includes(favTypes, key)})
          }
          data-favtype={key}
          onClick={this.onFavTypeChange.bind(this)}>
          <span>{item}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {`(${count})`}
          </span>
        </Button>
      );
    });
    let objectItems;

    if (filteredObjects) {
      const lastObjectIdx = size(filteredObjects) - 1;

      objectItems = map(filteredObjects, (object, key) => {
        return object.status === 'deleted' ?
        (
          <LKFavoritesDeletedItem
            source={data.options.mediaSource}
            object={object}
            key={key}/>
        ) :
        (
          <LKFavoritesItem
            similarityParams={this.props.similarityParams}
            source={data.options.mediaSource}
            object={object}
            user={this.props.user}
            lastItem={key > 0 && key === lastObjectIdx}
            key={key}/>
        );
      });
    }

    favTypeSelector = createFragment({
      favTypeSelector: favTypeSelector
    });
    objectItems = size(objectItems) > 0 ?
      createFragment({objectItems: objectItems}) :
      createFragment({
        objectItems:
          <div className='notFound'>
            <p>Объектов не найдено</p>
          </div>
      });
    return size(favorites) ? (
      <Row>
        <Col xs={10} className='lkbody-mainblock'>
          <div className='lkbody-favorites'>
            <Row>
              <Col xs={2}>
                <div className='lkbody-pagetitle'>
                  Избранное
                  <HelpIcon
                    placement='top'
                    className='help-text-left'
                    helpText={(
                      <span>
                        Добавляйте недвижимость в Избранное. Во время поиска
                        недвижимости на сайте сохраняйте понравившиеся объекты
                        в Избранное. Так вы будете в курсе скидок и обновлений
                        по этим объектам!
                      </span>
                    )}/>
                </div>
              </Col>
              <Col xs={10}>
                <div className='lkbody-toolbar'>
                  <LKFavoritesShare />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className='lkbody-typeselector compact'>
                <ButtonGroup>
                  {favTypeSelector}
                </ButtonGroup>
              </Col>
            </Row>
            {soldBlock}
            <div className='lkbody-favorites-wrapper'>
              {objectItems}
              <SearchPaging
                handlePageClick={this.onFavPageChange.bind(this)}
                pageNum={pageNum}
                {...this.state}
                layoutMap={false}
                bottom={true}/>
            </div>
          </div>
        </Col>
        <Col xs={2} className='lkbody-sideblock'>
          <LKManager/>
          <LKSignForReview {...this.props} />
        </Col>
      </Row>
    ) : (
      <Row>
        <Col xs={12}>
          <div className='lkbody-favorites'>
            <Row>
              <Col xs={2}>
                <div className='lkbody-pagetitle'>Избранное</div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className='lkbody-very-big-icon'>
                  <div className='main-icon'>
                    <i className='fa fa-search'/>
                    <div className='sub-icon'>
                     :(
                    </div>
                  </div>
                </div>
                <div className='text-center'>
                  У Вас пока тут пусто. Добавляйте в избранное, нажимая на
                  сердечко рядом с<br/>интересующим объектом недвижимости.
                </div>
              </Col>
            </Row>
            <Row className='lkbody-advantages'>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-floppy-o'/><br/>
                  <span>Сохраняйте</span>
                </div>
                <span>Понравившиеся объекты недвижимости</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-bar-chart'/><br/>
                  <span>Будьте в курсе</span>
                </div>
                <span>Снижения цен на недвижимость</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-home'/><br/>
                  <span>Делитесь</span>
                </div>
                <span>"Избранным" с близкими</span>
              </Col>
            </Row>
            <div className='background-line text-center'><span>
              Чтобы добавить объекты в Избранное, воспользуйтесь поиском на
              сайте
            </span></div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default LKFavorites;
