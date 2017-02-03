/**
 * LK Body component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, values, includes, size, map, without} from 'lodash';
import UserAgentData from 'fbjs/lib/UserAgentData';
import classNames from 'classnames';
import {scrollTo} from '../../utils/Helpers';
import {getObjects} from '../../utils/requestHelpers';
import HelpIcon from '../../shared/HelpIcon';
import SearchPaging from '../SearchPaging/SearchPaging';
import SubsetItem from './SubsetItem';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
/* global data */

class Subset extends Component {
  static propTypes = {
    similarityParams: React.PropTypes.array
  };
  constructor(props) {
    super(props);
    this.getSubsetObjects = this.getSubsetObjects.bind(this);
    this.getObjects = this.getObjects.bind(this);
    this.filterObjects = this.filterObjects.bind(this);
    this.state = {
      types: [],
      perPage: 10,
      currentPage: 0,
      offset: 0,
      objects: {},
      subsetData: {}
    };
  }

  componentDidMount() {
    this.getSubsetObjects(data.collections.subset.param1.objects);
  }


  getSubsetObjects(subset) {
    setTimeout(() => {
      const oids = {};
      const subsetData = {};
      let params = false;

      //grouping ids of objects by classes for separate requests
      //preparing subset data for merging with objects data
      for(const i in subset) {
        if(subset[i]) {
          if(oids[subset[i].class]) {
            oids[subset[i].class].push(subset[i].id);
            subsetData[subset[i].class][subset[i].id] = subset[i];
          } else {
            oids[subset[i].class] = [subset[i].id];
            subsetData[subset[i].class] = {};
            subsetData[subset[i].class][subset[i].id] = subset[i];
          }
        }
      }
      //clean old objects list and saving grouped subset data
      this.setState(() => ({objects: {}, subsetData: subsetData}));
      //requests for objects separated by objects classes
      for(const i in oids) {
        if(oids[i]) {
          params = {
            limit: 100,
            order: 'object_id',
            class: i,
            city_id: 'all', // eslint-disable-line camelcase
            object_id: oids[i] // eslint-disable-line camelcase
          };
          this.getObjects(params);
        }
      }
    }, 0);
  }

  getObjects(params) {
    getObjects(params).then(response => {
      const objType = params.class;
      const {objects} = response;
      const newObjects = clone(this.state.objects);

      for(const i in objects) {
        if(objects[i]) {
          const obj = objType === 'nh_flats' ?
            values(objects[i].flats)[0][0] : objects[i];

          if(objType === 'nh_flats') {
            obj.jkSlugUrl = objects[i].slugUrl;
          }
          if(objType === 'rent') {
            obj.class = 'rent';
          }
          if(newObjects[objType]) {
            newObjects[objType][obj.object_id] = obj;
          } else {
            newObjects[objType] = {[obj.object_id]: obj};
          }
        }
      }

      this.setState(() => ({
        objects: newObjects
      }));
    }, error => {
      error;
    });
  }

  filterObjects(subsetTypes, offset) {
    const {perPage, objects} = this.state;
    const subset = data.collections.subset.param1.objects;
    const filteredObjects = [];
    let c = 0;

    for(const i in subset) {
      if(subset[i]) {
        let obj = false;

        if((!subsetTypes.length || includes(subsetTypes, subset[i].class)) &&
          objects[subset[i].class] &&
          objects[subset[i].class][subset[i].id]) {
          obj = objects[subset[i].class][subset[i].id];
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

  onTypeChange(e) {
    let newType = this.state.types;
    const type = e.target.dataset.type ? e.target.dataset.type :
      e.target.parentElement.dataset.type;

    e.target.blur();
    e.target.parentElement.blur();
    if(includes(newType, type)) {
      newType = without(newType, type);
    } else {
      newType.push(type);
    }

    this.setState(() => ({
      offset: 0,
      currentPage: 0,
      types: newType
    }));
  }

  onPageChange(data) {
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
    const {objects, subsetData, types, offset, perPage} = this.state;
    const filteredObjects = this.filterObjects(types, offset);
    const pageNum = 1 +
      this.filterObjects(types, -1).length / perPage | 0;
    const typesArr = {
      flats: 'Вторичная',
      nh_flats: 'Новостройки', // eslint-disable-line camelcase
      cottages: 'Загородная',
      offices: 'Коммерческая',
      rent: 'Аренда'
    };
    let typeSelector = map(typesArr, (item, key) => {
      const count = objects[key] ? size(objects[key]) : 0;

      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': includes(types, key)})
          }
          data-type={key}
          onClick={this.onTypeChange.bind(this)}>
          <span>{item}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {`(${count})`}
          </span>
        </Button>
      );
    });
    let objectItems;

    if (filteredObjects) {
      objectItems = map(filteredObjects, (object, key) => {
        const oclass = object.class === 'newhousesflats' ||
          object.class === 'flats_secondary_no' ?
          'nh_flats' : object.class;

        return (
          <SubsetItem
            source={data.options.mediaSource}
            similarityParams={this.props.similarityParams}
            object={object}
            subsetData={subsetData[oclass][object.object_id]}
            key={key}/>
        );
      });
    }

    typeSelector = createFragment({
      typeSelector: typeSelector
    });
    objectItems = size(objectItems) > 0 ?
      createFragment({objectItems: objectItems}) :
      createFragment({
        objectItems:
          <div className='notFound'>
            <p>Объектов не найдено</p>
          </div>
      });
    return (
      <Row className='lkbody'>
        <Col xs={12}>
          <div className='lkbody-favorites'>
            <Row>
              <Col xs={12}>
                <div className='lkbody-pagetitle'>
                  Просмотр подборки
                  <HelpIcon
                    placement='top'
                    helpText='Это хелп для Просмотра подборок'/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className='lkbody-typeselector compact'>
                <ButtonGroup>
                  {typeSelector}
                </ButtonGroup>
              </Col>
            </Row>
            <div className='lkbody-favorites-wrapper'>
              {objectItems}
              <SearchPaging
                handlePageClick={this.onPageChange.bind(this)}
                pageNum={pageNum}
                {...this.state}
                layoutMap={false}
                bottom={true}/>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Subset;
