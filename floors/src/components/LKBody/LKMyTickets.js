/**
 * LK My Tickets component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import {chain, size, map, indexOf, values, clone, filter} from 'lodash';
import HelpIcon from '../../shared/HelpIcon';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import s from './LKMyTickets/style.scss';
import Config from './LKMyTickets/config/Config';
import LKMyTicketsItem from './LKMyTickets/LKMyTicketsItem';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import {rusTypes} from '../../utils/Helpers';

class LKMyTickets extends Component {
  static propTypes = {
    user: PropTypes.object,
    ticketFilter: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = this.prepareTickets(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.prepareTickets(nextProps));
  }

  componentDidMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  prepareTickets(props) {
    const tickets = props.user ? props.user.tickets : [];
    const {ticketFilter} = props;
    const emptyTickets = [];
    const activeTickets = [];

    for(const i in Config) {
      if(Config[i]) {
        const tickCfg = Config[i];
        const active = filter(tickets, ticket => {
          switch(ticketFilter) {
          case 'active':
            return indexOf(tickCfg.typeId, ticket.typeId) !== -1 &&
              ticket.active;
            break;
          case 'inactive':
            return indexOf(tickCfg.typeId, ticket.typeId) !== -1 &&
              !ticket.active;
            break;
          default:
            return indexOf(tickCfg.typeId, ticket.typeId) !== -1;
          }
        });

        if(size(active)) {
          activeTickets.push({
            cfg: tickCfg,
            tickets: active
          });
        } else {
          emptyTickets.push({cfg: tickCfg});
        }
      }
    }

    return {
      activeTickets: activeTickets,
      emptyTickets: emptyTickets,
      preparedFavorites: this.prepareFavoritesList(props.objects),
      preparedMyObjects: this.prepareMyObjectsList(props.myobjects),
    };
  }

  prepareFavoritesList = objs => {
    return chain(objs)
      .omit(['sold'])
      .map(item => { return values(item); })
      .flatten()
      .value();
  }

  prepareMyObjectsList = objs => {
    const res = map(objs, item => {
      if(item.status === 2) {
        const obj = clone(item);

        obj.class = UserActions.objClasses[obj.type_id];
        obj.type = UserActions.objTypes[obj.type_id];
        obj.type_ru = rusTypes(obj.type); //eslint-disable-line camelcase
        obj.price = obj.price * 1000;
        obj.price_m2 = obj.price / obj.square; //eslint-disable-line camelcase
        obj.object_id = obj.ries_id; //eslint-disable-line camelcase
        obj.rooms = obj.room;
        return obj;
      }

      return null;
    });

    return filter(res, null);
  }

  render() {
    const {ticketFilter} = this.props;
    const {
      activeTickets,
      emptyTickets,
      preparedFavorites,
      preparedMyObjects
    } = this.state;
    let activeBlock = map(activeTickets, item => {
      return (
        <LKMyTicketsItem
          key={item.name}
          mode='active'
          preparedFavorites={preparedFavorites}
          preparedMyObjects={preparedMyObjects}
          {...item}
          {...this.props} />
      );
    });
    let emptyBlock = map(emptyTickets, item => {
      return (
        <LKMyTicketsItem
          key={item.name}
          mode='empty'
          preparedFavorites={preparedFavorites}
          preparedMyObjects={preparedMyObjects}
          {...item}
          {...this.props} />
      );
    });
    const tickFilter = (
      <div className='lkbody-toolbar-period'>
        <span className='periods'>
          {map(
            {all: 'Все', active: 'активные', inactive: 'не активные'},
            (item, key) => {
              return (
                <a
                  key={key}
                  href={`#/mytickets/${key}`}
                  className={(ticketFilter === key ||
                    (!ticketFilter && key === 'all')) ? 'active' : null}>
                  {item}
                </a>
              );
            }
          )}
        </span>
      </div>
    );

    activeBlock = size(activeBlock) > 0 ?
      createFragment({activeBlock: activeBlock}) :
      createFragment({activeBlock: <div/>});
    emptyBlock = size(emptyBlock) > 0 ?
      createFragment({emptyBlock: emptyBlock}) :
      createFragment({emptyBlock: <div/>});

    return (
      <div className={s.lkBodyMyTickets}>
        <Row>
          <Col xs={6}>
            <div className='lkbody-pagetitle'>
              Мои Заявки
              <HelpIcon
                placement='top'
                className='help-text-left'
                helpText={(
                  <span>
                    Управляйте своими заявками и отслеживайте их статусы онлайн.
                  </span>
                )}/>
            </div>
          </Col>
          <Col xs={6}>
            <div className='lkbody-toolbar'>
              {tickFilter}
            </div>
          </Col>
        </Row>
        <div className='lkbody-mytickets-wrapper'>
          {activeBlock}
          {emptyBlock}
        </div>
      </div>
    );
  }
}

export default LKMyTickets;
