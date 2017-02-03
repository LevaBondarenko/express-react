/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));

Api = require("../../../Common/Element.js").extend({
  deleteTicketById: function(id) {
    return h.api('Удаление заявки по id', 'PUT', 'tickets/' + id,
      '', {'status': 'delete'});
  },
  getTicketById: function(id) {
    return h.api('Заявка по id', 'GET',
      'tickets/list', 'filter=["=","ticket_id","' + id
      + '"]&with=[["messages"]]');
  },
  findTickets: function(phone, created, city, add7) {
    var f = function(attempt) {
      var req = 'filter=["AND",["=","phone","'
      + (add7 ? h.getCityParams(city).country.phone_prefix : '') +
      + phone + '"],[">","created","'
      + created + '"]]&with=[["messages"]]&order_by=[{"ticket_id":"desc"}]';
      return h.api('Количество заявок по заданным параметрам', 'GET',
        'tickets/list',
        req + '&count=1').then(function(res) {
        if (attempt < 20 && res.count == 0) {
          return browser.sleep(1000).then(function() {
            return f(++attempt);
          });
        } else return h.api('Список заявок по заданным параметрам', 'GET',
          'tickets/list', req);
      });
    }

    return f(0);
  },
  handleTicket: function(id, phone, ticketType, name, city, created,
    commentParts, add7) {
    verifyTicket = function(data) {
      if (!data[0]) {
        fail('Заявка не найдена (data is empty)');
      } else {
        expect(data[0].name).toContain(name, 'Имя клиента в заявке');
        expect(data[0].phone).toMatch(phone, 'Телефон клиента в заявке');
        expect(data[0].created).toMatch(created + " [0-9]{2}:[0-9]{2}:[0-9]{2}",
          'Дата создания заявки');
        expect(data[0].city_id).toBe(h.getCityParams(city)['id'], 'Город заявки');
        expect(data[0].type_id).toBe(String(ticketType), 'Тип заявки');

        var comment = data[0].messages[0].message.toLowerCase()
          .split('&quot;').join('"').split('\\"').join('"');

        commentParts.forEach(function(part, key) {
          expect(comment).toContain(part.toLowerCase().trim(),
            'Коммментарий к заявке');
        });
      }
    };

    if (id) {
      browser.params.ticketID = id;
      return Api.getTicketById(id).then(function(data) {
        verifyTicket(data);

        return Api.deleteTicketById(id).then(function(deleted){
          return deleted;
        });
      });
    } else {
      return Api.findTickets(phone, created, city, add7).then(function(data) {
        verifyTicket(data);
        browser.params.ticketID = data[0].ticket_id;

        return Api.deleteTicketById(data[0].ticket_id).then(function(deleted){
          return deleted;
        });
      });
    }
  }
});

module.exports = Api;