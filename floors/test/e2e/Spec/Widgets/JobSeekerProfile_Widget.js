var OrderWidget = require("./Order_Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var JobSeekerProfileWidget = OrderWidget.plain.extend({
  name: 'Откликнуться на вакансию (анкета соискателя)',
  container: $$('.jobSeekerProfile'),
  phoneInput: $('input[data-field="phone"]'),
  submitBtn: $('.jobSeekerProfile_submit button'),
  keyElement: $$('.jobSeekerProfile'),
  vacancyField: $('#vacancy option[selected]'),
  phoneFormat: 2,
  widget: 'jobProfile',
  data: {
    // vacancy: '0',
    fullName: 'TestSurname TestName TestSecondName',
    day: '24',
    month: '3',
    year: '1990',
    institution_1: 'TestInsitution',
    speciality_1: 'TestSpeciality',
    graduateYear_1: '2012',
    company_1: 'TestCompany',
    job_1: 'TestJob',
    monthStart_1: '1',
    yearStart_1: '2014',
    monthEnd_1: '5',
    yearEnd_1: '2015',
    responsibility_1: 'TestResponsibility'
  },

  fillPhone: function(phone){
    var ph = this.container.get(0).element(this.phoneInput.locator());
    ph.clear();
    this.wh.waitPresence(ph);
    ph.sendKeys(phone);
  },

  fillProfile: function(){
    var data = this.data;
    $$('.form-control').each(function(field){
      field.getAttribute('data-field').then(function(attr){
        if(data[attr]){
          field.getTagName().then(function(tagName){
            if(tagName === 'select'){
              field.$('option[value="' + data[attr] + '"]').click();
            } else {
              field.sendKeys(data[attr]);
            }
          });
        }
      });
    });
  },

  getDataArray: function(){
    var getFull = function(value){
      var res = value;
      if(value < 11){
        res = '0' + value;
      }
      return res;
    };
    var data = this.data;
    var res = new Array();
    var excluded = ['day','month','year','monthStart_1','yearStart_1','monthEnd_1','yearEnd_1'];
    for(var key in this.data){
      if(excluded.indexOf(key) === -1){
        res.push(this.data[key]);
      }
    }
    res.push(getFull(data.day) + '.' + getFull(data.month) + '.' + data.year);
    res.push(getFull(data.monthStart_1) + '.' + data.yearStart_1);
    res.push(getFull(data.monthEnd_1) + '.' + data.yearEnd_1);

    this.vacancyField.getText().then(function(result){
      browser.manage().addCookie("E2E_sendTicket_vacancy", result);
    });
    return res;
  }
});

module.exports = JobSeekerProfileWidget;

