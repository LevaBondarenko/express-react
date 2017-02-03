/**
 * LK MyObjects empty page
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import HelpIcon from '../../../shared/HelpIcon';
import {map, size, find} from 'lodash';
import classNames from 'classnames';
import {getTitle} from '../../../utils/Helpers';
import LKMyObjectsJustSended from './LKMyObjectsJustSended';
import LKMyObjectsEdit from './LKMyObjectsEdit';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';

class LKMyObjectsList extends Component {
  static propTypes = {
    similarityParams: PropTypes.array,
    myobjects: PropTypes.array,
    objectId: PropTypes.string,
    types: PropTypes.array,
    action: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  get body() {
    const {myobjects, objectId, action} = this.props;
    const selectedObject = find(myobjects, {id: parseInt(objectId)});
    let body;

    if(!selectedObject) {
      if(size(myobjects)) {
        window.location.hash = '/myobjects/';
      } else {
        return (
          <div className='lkobjects'>
            <div className='lkobjects--loader'>
              <i className='fa fa-refresh fa-spin fa-4x'/>
            </div>
          </div>
        );
      }
    } else if(action === 'edit') {
      body = <LKMyObjectsEdit {...this.props} mode='edit' />;
    } else if(selectedObject.status && selectedObject.status === 1) {
      body = <LKMyObjectsJustSended {...this.props} />;
    } else {
      body = <LKMyObjectsEdit {...this.props} mode='view' />;
    }
    return body;
  }

  render() {
    const {myobjects, objectId} = this.props;

    let objectsSelector = map(myobjects, (item, key) => {

      return (
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': item.id === parseInt(objectId)})
          }
          data-favtype={key}
          href={`#/myobjects/${item.id}`}>
          {getTitle(item.room, UserActions.objClassRu[item.type_id])}
        </Button>
      );
    });

    objectsSelector = createFragment({
      objectsSelector: objectsSelector
    });

    return (
      <Row>
        <Col xs={12}>
          <div className='lkbody-myobjects'>
            <Row>
              <Col xs={2}>
                <div className='lkbody-pagetitle'>
                  Мои Объекты
                  <HelpIcon
                    placement='top'
                    className='help-text-left'
                    helpText={(
                      <span>
                        Добавляйте объявления о продаже вашей недвижимости.
                        Редактируйте описание, меняйте цену объекта в режиме
                        онлайн, пользуйтесь приоритетным размещением для того,
                        чтобы ваше объявление видели все!
                      </span>
                    )}/>
                </div>
              </Col>
              <Col xs={10}>
                <div className='lkbody-toolbar'>
                  <Button
                    bsStyle='default'
                    bsSize='small'
                    href='#/myobjects/add'>
                    + Добавить еще обьявление
                  </Button>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className='lkbody-typeselector compact'>
                <ButtonGroup>
                  {objectsSelector}
                </ButtonGroup>
              </Col>
            </Row>
            {this.body}
          </div>
        </Col>
      </Row>
    );
  }
}

export default LKMyObjectsList;
