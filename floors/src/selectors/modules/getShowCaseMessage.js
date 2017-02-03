/**
 * recomendedPrograms selector
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import {createSelector} from 'reselect';
import {each, find} from 'lodash';

const getDemandShowCase = state => state.objects.get('demandShowCase') ?
  state.objects.get('demandShowCase').toJS() : {};

const getShowCaseMessage = createSelector(
  [getDemandShowCase],
  demandShowCase => {
    let message = '<p>';

    if (demandShowCase) {
      const street = find(demandShowCase.streets,
        {id: demandShowCase.street_id});

      message += '<h4>Параметры заявки</h4>';
      message += demandShowCase.price_from ?
        '<b>Цена (от):</b> ' + demandShowCase.price_from + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.price_to ?
        '<b>Цена (до):</b> ' + demandShowCase.price_to + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.square ?
        '<b>Площадь:</b> ' + demandShowCase.square + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.square_from ?
        '<b>Площадь (от):</b> ' + demandShowCase.square_from + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.square_to ?
        '<b>Площадь (до):</b> ' + demandShowCase.square_to + '<br />' : ''; //eslint-disable-line
      message += street ?
        '<b>Улица:</b> ' + street.name + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.house ?
        '<b>Номер дома:</b> ' + demandShowCase.house + '<br />' : ''; //eslint-disable-line
      message += demandShowCase.floor ?
        '<b>Этаж:</b> ' + demandShowCase.floor + '<br />' : ''; //eslint-disable-line
      message += '<br /><b>ФИО риелтора</b>&nbsp;';
      message += '<b>Номер заявки</b><br /><br />';

      each(demandShowCase.checked, ticketId => {
        const ticket = find(
          demandShowCase[demandShowCase.itemsOption || 'items'],
          {ticket_id: parseInt(ticketId)} //eslint-disable-line
        );

        message += `<span>${ticket.staff.name}</span>&nbsp;`;
        message += `<span>${ticketId}</span><br />`;
      });
    } else {
      message = null;
    }

    message += '</p>';

    return {
      ...demandShowCase,
      message: message
    };
  }
);

export default getShowCaseMessage;
