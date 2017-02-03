/**
 * Modular Searcher Buttons component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {Table, Column, Cell} from 'fixed-data-table';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import OrderButton from './OrderButton';
import ModalNotification from './ModalNotification';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {map, without, each, size, difference, clone} from 'lodash';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState, massUpdateInObjectsState}
  from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

const TextCell = ({rowIndex, items, col, ...props}) => {
  return (
      <Cell {...props}>
        {items[rowIndex][col]}
      </Cell>
  );
};

TextCell.propTypes = {
  rowIndex: PropTypes.number,
  items: PropTypes.array,
  col: PropTypes.oneOfType([
    PropTypes.number, PropTypes.string
  ])
};

class DemandShowCaseSearchResult extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    title: PropTypes.string,
    _validationStatus: PropTypes.bool,
    checked: PropTypes.array,
    items: PropTypes.array,
    orderSent: PropTypes.bool,
    anglePos: PropTypes.number,
    actions: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    const {checked, items} = this.props;
    const itemsChanged =
      size(items) !== size(nextProps.items) ||
      size(difference(
        items.map(item => item.value),
        nextProps.items.map(item => item.value)
      )) > 0;
    const checkedChanged = size(checked) !== size(nextProps.checked) ||
      size(difference(
        checked.map(item => item.value),
        nextProps.checked.map(item => item.value)
      )) > 0;
    const stateChanged = this.props.orderSent !== nextProps.orderSent ||
      this.props.anglePos !== nextProps.anglePos ||
      this.props._validationStatus !== nextProps._validationStatus;

    return itemsChanged || checkedChanged || stateChanged;
  }

  onTicketSelect = event => {
    const ticketId = event.target.dataset.ticket;
    const checkedTickets = this.props.checked || [];
    const newChecked = clone(checkedTickets);
    const idx = checkedTickets.indexOf(ticketId);

    if (idx === -1) {
      newChecked.push(ticketId);
    } else {
      newChecked.splice(idx, 1);
    }

    this.props.actions.updateInObjectsState(
      ['demandShowCase', 'checked'], () => (newChecked));
  }

  onSelectAll = event => {
    event.preventDefault();

    const {checked, items} = this.props;
    const newChecked = [];
    const checkedAll = size(items) === size(checked);

    if (!checkedAll) {
      each(items, item => {
        newChecked.push(item.ticket_id.toString());
      });
    }
    this.props.actions.updateInObjectsState(
      ['demandShowCase', 'checked'], () => (!checkedAll ? newChecked : []));
  }

  hideTable = () => {
    this.props.actions.updateInObjectsState(
      ['demandShowCase', 'showTicketsTable'], () => (false));
  }

  render() {
    if (!size(this.props.items)) {
      return null;
    }
    const {title, checked, anglePos, items} = this.props;
    const chosenText = size(checked) > 0 ?
      `(${size(checked)})` : '';

    return (
      <div className="dShowCaseSearchResultWrapper">
        <div className='dShowCaseSearchAngle' style={{
          left: anglePos,
          transition: 'all .3s ease-in-out'
        }} />
        <div className="dShowCaseClose">
          <a href="#" onClick={this.hideTable}>
            <span>ЗАКРЫТЬ</span><span className="bigTimes">&times;</span>
          </a>
        </div>
        <h3 className="dShowCaseTitle">{title}</h3>
        <div className="showCaseTableWrapper">
          <Table
            rowHeight={35}
            headerHeight={40}
            rowsCount={items.length}
            width={1100}
            height={300}
          >
            <Column
              header={
                <Cell className="form-group showCase-table-header--noBg">
                  <input type='checkbox'
                           id='select_all_tickets'
                           onChange={this.onSelectAll}
                           checked={items.length === checked.length &&
                            items.length !== 0}
                           className='form-etagi input_arrow'/>
                    <label
                      htmlFor='select_all_tickets'
                      className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'> </i>
                    </label>
                </Cell>
              }
              cell={({rowIndex, ...props}) =>  {
                return (
                  <Cell {...props} className="showCaseCell_tac form-group">
                    <input type='checkbox'
                           id={`ticket_${items[rowIndex]['ticket_id']}`}
                           onChange={this.onTicketSelect}
                           checked={checked
                             .indexOf(
                               items[rowIndex]['ticket_id'].toString()
                             ) !== -1}
                           data-ticket={items[rowIndex]['ticket_id']}
                           className='form-etagi input_arrow'/>
                    <label
                      htmlFor={`ticket_${items[rowIndex]['ticket_id']}`}
                      className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'> </i>
                    </label>
                  </Cell>
                );
              }}
              width={50}
            />
            <Column
              header={<Cell
                className="showCase-table-header showCase-table-header--first">
                Покупатель</Cell>}
              cell={({rowIndex, ...props}) => (
                <Cell {...props} className="showCaseCell_tac">
                  Покупатель <b>{items[rowIndex]['ticket_id']}</b>
                </Cell>
              )}
              width={150}
            />
            <Column
              header={<Cell className="showCase-table-header">
                Число комнат</Cell>}
              cell={<TextCell items={items}
                              className="showCaseCell_tac"
                              col="rooms" />}
              width={125}
            />
            <Column
              header={<Cell className="showCase-table-header">
                Стоимость</Cell>}
              cell={({rowIndex, ...props}) => {
                const priceMin = items[rowIndex]['price_min'];
                const priceMax = items[rowIndex]['price_max'];

                return (
                  <Cell {...props}>
                    {priceMin !== priceMax && priceMin && priceMax ? (
                      <span>
                        <Price price={priceMin} />&nbsp;-&nbsp;
                        <Price price={priceMax} />
                          &nbsp;<PriceUnit />
                      </span>
                    ) : (
                      <span>
                        {!priceMin && priceMax ? (
                            <span>
                              до <Price price={priceMax}/>&nbsp;<PriceUnit />
                            </span>
                        ) : priceMin ? (
                          <span>
                            от <Price price={priceMin}/>&nbsp;<PriceUnit />
                          </span>
                        ) : null}
                      </span>
                    )}
                  </Cell>
                );
              }}
              width={350}
            />

            <Column
              width={425}
              header={<Cell className="showCase-table-header">
                Районы</Cell>}
              cell={({rowIndex, ...props}) => {
                const districts = items[rowIndex]['districts'];
                const districtNames = without(map(districts, distr => {
                  if (distr) {
                    return distr;
                  }
                }), undefined);
                const districtNamesShort = districtNames.splice(0, 3);
                const tooltip = (
                  <Tooltip id="tooltip">{districtNames.join(', ')}</Tooltip>
                );

                return (
                  <Cell {...props}>
                    {districtNames.length > 3 ?
                      <OverlayTrigger overlay={tooltip}>
                        <a href="#"
                           onClick={(event) => {event.preventDefault();}}>
                          {`${districtNamesShort
                            .join(', ')} и еще ${districtNames.length}`}
                        </a>
                      </OverlayTrigger> :
                      districtNamesShort.join(', ')}
                  </Cell>
                );
              }}
            />
          </Table>
        </div>
        <div className="orderButtonsWrapper">
          <OrderButton additionalClassName="sendToChecked"
                       disabled={!this.props._validationStatus}
                       action={this.props.actions.updateInObjectsState}
                       title={`Предложить свою квартиру выбранным
                          ${chosenText}`} />
          <OrderButton additionalClassName="sendToAll"
                       checkAllFirst={true}
                       items={this.props.items}
                       disabled={false}
                       action={this.props.actions.updateInObjectsState}
                       title="Предложить свою квартиру всем" />
        </div>
        <ModalNotification
          visible={this.props.orderSent}
          action={this.props.actions.massUpdateInObjectsState}/>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {updateInObjectsState, massUpdateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state) {
  const obj = state.objects.get('demandShowCase').toJS() || {};
  const itemsOption = obj.itemsOption || 'items';

  return {
    items: obj && obj[itemsOption] ? obj[itemsOption] : [],
    checked: obj.checked || [],
    orderSent: obj._orderSent,
    anglePos: obj.anglePos,
    _validationStatus: obj._validationStatus
  };
}

DemandShowCaseSearchResult =
  connect(mapStateToProps, mapDispatchToProps)(DemandShowCaseSearchResult);
DemandShowCaseSearchResult = withCondition()(DemandShowCaseSearchResult);

export default DemandShowCaseSearchResult;
