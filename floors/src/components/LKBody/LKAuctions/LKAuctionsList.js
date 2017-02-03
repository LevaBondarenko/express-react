/**
 * LK Auctions List component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, includes, without} from 'lodash';
import classNames from 'classnames';
import LKAuctionItem from '../LKAuctions/LKAuctionItem';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions'; // eslint-disable-line no-unused-vars
import ga from '../../../utils/ga';

class LKAuctionsList extends Component {
  static propTypes = {
    myauctions: React.PropTypes.array,
    objectsCache: React.PropTypes.object,
    user: React.PropTypes.object,
    messages: React.PropTypes.array
  };

  get trackTypes() {
    return {
      flats: 'lk_torgi_title_realty',
      nh_flats: 'lk_torgi_title_zastr',
      cottages: 'lk_torgi_title_zagorodka',
      commerce: 'lk_torgi_title_commerce',
      arenda: 'lk_torgi_title_arenda',
      sold: 'lk_torgi_title_deleted'
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      aucTypes: [],
      myauctions: props.myauctions,
      messages: props.messages,
      objects: props.objectsCache
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      myauctions: nextProps.myauctions,
      messages: nextProps.messages,
      objects: nextProps.objectsCache
    }));
  }

  onAucTypeChange(e) {
    let newType = this.state.aucTypes;
    const auctype = e.target.dataset.favtype ? e.target.dataset.favtype :
      e.target.parentElement.dataset.favtype;

    e.target.blur();
    e.target.parentElement.blur();
    if(includes(newType, auctype)) {
      newType = without(newType, auctype);
      ga('tabs', this.trackTypes[auctype], 'off');
    } else {
      newType.push(auctype);
      ga('tabs', this.trackTypes[auctype], 'on');
    }

    this.setState(() => ({
      aucTypes: newType
    }));
  }

  render() {
    const {aucTypes, objects, myauctions, messages} = this.state;
    const classes = UserActions.objClasses;

    const aucTypesArr = {
      flats: {name: 'Вторичная', count: 0},
      nh_flats: {name: 'Новостройки', count: 0}, // eslint-disable-line camelcase
      cottages: {name: 'Загородная', count: 0},
      sold: {name: 'продано', count: 0}
    };

    for(const i in myauctions) {
      if(myauctions[i]) {
        const oclass = classes[myauctions[i].object.type_id];

        if(objects[oclass] &&
          objects[oclass][myauctions[i].object.ries_id] &&
          objects[oclass][myauctions[i].object.ries_id] !== 'not found') {
          aucTypesArr[oclass].count++;
        }
      }
    }

    let aucTypeSelector = map(aucTypesArr, (item, key) => {
      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': includes(aucTypes, key)})
          }
          data-favtype={key}
          onClick={this.onAucTypeChange.bind(this)}>
          <span>{item.name}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {`(${item.count})`}
          </span>
        </Button>
      );
    });

    aucTypeSelector = createFragment({
      aucTypeSelector: aucTypeSelector
    });

    let auctionItems = map(myauctions, (auction, key) => {
      const oclass = classes[auction.object.type_id];
      const id = auction.object.ries_id;

      return objects[oclass] && objects[oclass][id] &&
        objects[oclass][id] !== 'not found' &&
        (includes(aucTypes, oclass) || !size(aucTypes)) ? (
        <LKAuctionItem
          mode='in-list'
          key={key}
          messages={messages}
          auction={auction}
          object={objects[oclass][id]}
          uid={this.props.user.id} />
      ) : <div/>;
    });

    auctionItems = size(auctionItems) > 0 ?
      createFragment({auctionItems: auctionItems}) :
      createFragment({
        auctionItems:
          <div className='notFound'>
            <p>Вы не участвуете ни в одном аукционе</p>
          </div>
      });

    return(
        <div className='lkbody-auctions-wrapper'>
          <Row>
            <Col xs={12} className='lkbody-typeselector compact'>
              <ButtonGroup>
                {aucTypeSelector}
              </ButtonGroup>
            </Col>
          </Row>
          {auctionItems}
        </div>
    );
  }
}

export default LKAuctionsList;
