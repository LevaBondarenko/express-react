/**
 * JobSeekerProfile Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import {getFromBack} from '../../utils/requestHelpers';
import DateTimePicker from '../../shared/DateTimePicker';
import Institution from './Institution';
import Job from './Job';
import rules from './Rules';
import {phoneFormatter, testPhone, phoneCleanup} from '../../utils/Helpers';
import _ from 'lodash';
import {scrollTo} from '../../utils/Helpers';
import UserAgentData from 'fbjs/lib/UserAgentData';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

@withCondition()
class JobSeekerProfile extends Component {

  static maxProps = {
    maxInst: 5,
    maxJobs: 5
  }

  static propTypes = {
    vacancies: React.PropTypes.array,
    dataUrl: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    /*global data*/
    let defVacancy;

    if (canUseDOM) {
      defVacancy = this.props.dataUrl[0] ?
        decodeURIComponent(this.props.dataUrl[0].vacancy) :
        data.collections.vacancies[0].name;
    } else {
      defVacancy = this.props.dataUrl.vacancy ?
        this.props.dataUrl.vacancy :
        data.collections.vacancies[0].name;
    }

    this.state = {
      instCounter: 1,
      jobsCounter: 1,
      fields: {
        vacancy: defVacancy,
        birthday: {},
        institutions: {
          1: {
            institution: '',
            speciality: '',
            graduateYear: ''
          }
        },
        jobs: {
          1: {
            company: '',
            job: '',
            responsibility: '',
            monthStart: '',
            monthEnd: '',
            yearStart: '',
            yearEnd: ''
          }
        }
      },
      errors: {
        birthday: {},
        institutions: {},
        jobs: {}
      }
    };
    this.instKeys = [1];
    this.jobsKeys = [1];
  }

  addInst(event) {
    event.preventDefault();

    if (this.instKeys.length <= JobSeekerProfile.maxProps.maxInst) {
      const instCounter = this.state.instCounter + 1;

      this.instKeys.push(instCounter);
      this.setState(() => ({
        instCounter: instCounter,
      }));
    }
  }

  addJob(event) {
    event.preventDefault();

    if (this.jobsKeys.length <= JobSeekerProfile.maxProps.maxJobs) {
      const jobsCounter = this.state.jobsCounter + 1;

      this.jobsKeys.push(jobsCounter);
      this.setState(() => ({
        jobsCounter: jobsCounter,
      }));
    }
  }

  removeInst() {
    const event = arguments[1];

    event.preventDefault();

    const key = arguments[0];
    const idx = this.instKeys.indexOf(key);

    this.instKeys.splice(idx, 1);
    this.setState(() => ({
      addingNewInst: false
    }));
  }

  removeJob() {
    const event = arguments[1];

    event.preventDefault();

    const key = arguments[0];
    const idx = this.jobsKeys.indexOf(key);

    this.jobsKeys.splice(idx, 1);
    this.setState(() => ({
      addingNewInst: false
    }));
  }

  handleTimeChange(dateStr) {
    if(dateStr) {
      const birthdayDate = new Date(dateStr);
      const birthday = this.state.fields.birthday || {};
      const fields = this.state.fields;
      const errors = this.state.errors;

      birthday.day = birthdayDate.getDate();
      birthday.month = birthdayDate.getMonth() + 1;
      birthday.year = birthdayDate.getFullYear();
      fields.birthday = birthday;
      errors.birthday = {};

      this.setState(() => ({
        fields: fields,
        errors: errors,
        birthdayDate: birthdayDate.toISOString()
      }));
    }
  }

  validate(fieldName, value, type) {
    const rule = type ? rules[type][fieldName] : rules[fieldName];
    let result = true;

    if (rule.required) {
      result = !!value;
    }

    if (!!(rule.max && value)) {
      result = value <= rule.max;
    }

    if (!!(rule.min && value)) {
      result = value >= rule.min;
    }

    if (!!(rule.regex && value)) {
      result = !!value.toString().match(rule.regex);
    }

    if(!!(rule.testPhone && value)) {
      result = testPhone(
        phoneCleanup(value),
        true,
        data.options.countryCode.avail
      );
    }

    return result;
  }

  bulkFieldChange() {
    const event = arguments[1];
    const type = arguments[0];
    const nameArr = event.target.dataset.field.split('_');
    const name = nameArr[0];
    const idx = nameArr[1];
    const errors = this.state.errors;
    const fields = this.state.fields;
    const value = event.target.value;

    if (!this.validate(name, value, type)) {
      if (!errors[type][idx]) {
        errors[type][idx] = {};
      }
      errors[type][idx][name] = true;
    } else {
      if (errors[type][idx]) {
        delete errors[type][idx][name];
      }
    }

    if (!fields[type][idx]) {
      fields[type][idx] = {};
    }

    fields[type][idx][name] = value;

    this.setState(() => ({
      fields: fields
    }));
  }

  fieldChange(event) {
    const fieldName = event.target.dataset.field;
    const fields = this.state.fields;
    const errors = this.state.errors;
    let value = event.target.value;

    if (fieldName === 'phone') {
      value = phoneFormatter(
        value,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
    }

    if (!this.validate(fieldName, value)) {
      errors[fieldName] = true;
    } else {
      delete errors[fieldName];
    }
    fields[fieldName] = value;

    this.setState(() => ({
      fields: fields
    }));
  }

  birthdayChange(event) {
    const fieldName = event.target.dataset.field;
    const fields = this.state.fields;
    const errors = this.state.errors;
    const birthday = fields.birthday || {};
    let birthdayDate = new Date().toISOString();

    birthday[fieldName] = event.target.value;
    fields.birthday = birthday;

    if (!this.validate(fieldName, event.target.value, 'birthday')) {
      errors.birthday[fieldName] = true;
    } else {
      delete errors.birthday[fieldName];
    }

    if (birthday.day && birthday.month && birthday.year) {
      try {
        const m = birthday.month.toString().length === 1 ?
          `0${birthday.month}` : birthday.month;
        const d = birthday.day.toString().length === 1 ?
          `0${birthday.day}` : birthday.day;

        birthdayDate = new Date(
          `${birthday.year}-${m}-${d}`
        ).toISOString();
      } catch (e) {}
    }

    this.setState(() => ({
      fields: fields,
      birthdayDate: birthdayDate,
    }));
  }

  getValidationClass(fieldName, type = null) {

    const fields = type !== null ? this.state.fields[type] :
      this.state.fields;
    const errors = type !== null ? this.state.errors[type] :
      this.state.errors;
    let result = '';

    if (fieldName.indexOf('_') !== -1) {
      const nameArr = fieldName.split('_');
      const name = nameArr[0];
      const idx = nameArr[1];

      if (!errors[idx]) {
        errors[idx] = {};
      }

      if (fields[idx]) {
        if (errors[idx][name]) {
          result = 'error';
        }

        if (fields[idx][name] && !errors[idx][name]) {
          result = 'success';
        }
      }

    } else {
      if (errors[fieldName]) {
        result = 'error';
      }

      if (fields[fieldName] && !errors[fieldName]) {
        result = 'success';
      }
    }

    return result;
  }

  submitForm(event) {
    event.preventDefault();
    const fields = this.state.fields;
    const errors = {
      birthday: {},
      institutions: {},
      jobs: {}
    };
    let hasError = false;

    // pre post form validation
    for(const fieldName in rules) {
      if (rules.hasOwnProperty(fieldName)) {
        const fieldValue = fields[fieldName];

        if (typeof fieldValue !== 'object') {
          if (!this.validate(fieldName, fieldValue)) {
            errors[fieldName] = true;
            hasError = true;
          }
        } else {

          const type = fieldName;
          const typeRules = rules[type];

          for (const fName in typeRules) {
            if (typeRules.hasOwnProperty(fName)) {

              // institutionS, jobS
              if (type[type.length - 1] === 's') {
                const arrayFields = fields[type];

                for (const idx in arrayFields) {
                  if (arrayFields.hasOwnProperty(idx)) {
                    const arrayField = arrayFields[idx];

                    for (const fName in typeRules) {
                      if (typeRules.hasOwnProperty(fName)) {
                        if (_.isEmpty(errors[type][idx])) {
                          errors[type][idx] = {};
                        }
                        if (!this.validate(fName, arrayField[fName], type)) {
                          if (_.isEmpty(errors[type][idx])) {
                            errors[type][idx] = {};
                          }
                          errors[type][idx][fName] = true;
                          hasError = true;
                        }
                      }
                    }
                  }
                }
              } else { // birthday
                const fValue = fields[type][fName];

                if (!this.validate(fName, fValue, 'birthday')) {
                  errors[type][fName] = true;
                  hasError = true;
                }
              }
            }
          }
        }
      }
    }

    if (hasError) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
        document.documentElement :
        document.body;

      scrollTo(elementTop, 0, 500);
      this.setState(() => ({
        errors: errors
      }));

    } else {
      // отправляем форму
      getFromBack(_.extend({data: JSON.stringify(fields)}, {
        action: 'jobprofile'
      }), 'post').then(response => {
        if (response.success) {
          window.location.href = `/thank-you/?type=resume&from=${fields.vacancy}`; //eslint-disable-line max-len
        }
      });
    }
  }


  render() {

    const dateSelector = (
      <DateTimePicker
        title={<i className='fa fa-calendar' />}
        cancelTitle='Отмена'
        saveTitle='Выбрать'
        withoutTime={true}
        bsStyle='default'
        rightAlign={true}
        className='pull-right'
        popupHeader='Укажите дату Вашего рождения'
        popupComment=''
        datetime={this.state.birthdayDate}
        onDateTimeChange={this.handleTimeChange.bind(this)}
      />
    );
    const fields = this.state.fields;
    const institutions = _.map(this.instKeys, key => {
      return (
        <Institution idx={key}
                     key={`inst_${key}`}
                     institution={this.state.fields.institutions[key]}
                     bulkFieldChange={this.bulkFieldChange.bind(this)}
                     getValidationClass={this.getValidationClass.bind(this)}
                     removeInst={this.removeInst.bind(this)}
        />
      );
    });
    /*global data*/
    const vacancies = data.collections.vacancies;
    const vacanciesOptions = _.map(vacancies, (v, i) => {
      return (
        <option value={v.name} key={`v_${i}`}>{v.name}</option>
      );
    });

    const jobs = _.map(this.jobsKeys, key => {
      return (
        <Job idx={key}
                     key={`inst_${key}`}
                     job={this.state.fields.jobs[key]}
                     bulkFieldChange={this.bulkFieldChange.bind(this)}
                     getValidationClass={this.getValidationClass.bind(this)}
                     removeJob={this.removeJob.bind(this)}
        />
      );
    });

    return (
      <div className="jobSeekerProfileWrapper container-wide">
        <div className="jobSeekerProfile">
          <div className="jobSeekerProfile_cup"></div>
          <div className="jobSeekerProfile_pen"></div>
          <div className="jobSeekerProfile_form">
            <div className="jobSeekerProfile_title">
              Заполните анкету
            </div>
            <form className="form-horizontal">
              <div className="jobSeekerProfile_formInfo">
                <div className="jobSeekerProfile_bold">
                  Основная информация
                </div>
                <div className="jobSeekerProfile_grey">
                  Укажите, пожалуйста, ваши настоящие фамилию,
                  имя, отчество и дату рождения
                </div>
              </div>
              <div className="jobSeekerProfile_inputs">
                <div className="form-group">
                  <div className="col-sm-4">
                    <label htmlFor="vacancy"
                           className="control-label">
                      <span className="required_flag">*</span>Желаемая вакансия
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <select
                      className={`form-control
                        ${this.getValidationClass('vacancy')}`}
                      data-field="vacancy"
                      onChange={this.fieldChange.bind(this)}
                      value={fields.vacancy}
                      id={'vacancy'}
                    >
                      {vacanciesOptions}
                    </select>
                    <div className="jobSeekerProfile_check"></div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-4">
                    <label htmlFor="fullName"
                           className="control-label">
                      <span className="required_flag">*</span>
                      ФИО полностью
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text"
                           className={`form-control
                            ${this.getValidationClass('fullName')}`}
                           placeholder="Фамилия Имя Отчество"
                           autoComplete="off"
                           data-field="fullName"
                           onChange={this.fieldChange.bind(this)}
                           value={fields.fullName}
                           id="fullName" />
                    <div className="jobSeekerProfile_check"></div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-4">
                    <label htmlFor="phone"
                           className="control-label">
                      <span className="required_flag">*</span>
                      Телефон
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text"
                           className={`form-control
                            ${this.getValidationClass('phone')}`}
                           placeholder="Номер телефона"
                           autoComplete="off"
                           data-field="phone"
                           onChange={this.fieldChange.bind(this)}
                           value={fields.phone}
                           id="phone" />
                    <div className="jobSeekerProfile_check"></div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-4">
                    <label htmlFor="phone"
                           className="control-label">
                      <span className="required_flag">*</span>
                      Дата рождения
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <div className="col-sm-3 paddingZero">
                      <input type="text"
                             className={`form-control
                        ${this.getValidationClass('day', 'birthday')}`}
                             placeholder="день"
                             autoComplete="off"
                             value={this.state.fields.birthday.day}
                             data-field="day"
                             onChange={this.birthdayChange.bind(this)}
                             id="day" />
                    </div>
                    <div className="col-sm-4 paddingZero">
                      <select id={'month'}
                              className={`form-control
                        ${this.getValidationClass('month', 'birthday')}`}
                              data-field="month"
                              value={this.state.fields.birthday.month}
                              onChange={this.birthdayChange.bind(this)}
                              key={'month'}>
                        <option value="0">Месяц</option>
                        <option value="1">Январь</option>
                        <option value="2">Февраль</option>
                        <option value="3">Март</option>
                        <option value="4">Апрель</option>
                        <option value="5">Май</option>
                        <option value="6">Июнь</option>
                        <option value="7">Июль</option>
                        <option value="8">Август</option>
                        <option value="9">Сентябрь</option>
                        <option value="10">Октябрь</option>
                        <option value="11">Ноябрь</option>
                        <option value="12">Декабрь</option>
                      </select>
                    </div>
                    <div className="col-sm-3 paddingZero">
                      <input type="text"
                             className={`form-control
                        ${this.getValidationClass('year', 'birthday')}`}
                             placeholder="год"
                             autoComplete="off"
                             data-field="year"
                             value={this.state.fields.birthday.year}
                             onChange={this.birthdayChange.bind(this)}
                             id="year" />
                    </div>
                    <div className="col-sm-2 paddingZero dt-wrapper">
                      {dateSelector}
                    </div>
                  </div>
                </div>
              </div>
              <div className="jobSeekerProfile_formInfo">
                <div className="jobSeekerProfile_bold">
                  Образование
                </div>
                <div className="jobSeekerProfile_grey">
                  Укажите учебные заведения, в которых Вы учились или учитесь
                </div>
              </div>
              <div className="jobSeekerProfile_inputs">
                {institutions}
                { institutions.length <= JobSeekerProfile.maxProps.maxInst ?
                  (
                  <div className="addMoreLink">
                    <span className="addMoreIcon">+</span>
                    <a href="#"
                      onClick={this.addInst.bind(this)}>
                      Добавить учебное заведение
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="jobSeekerProfile_formInfo">
                <div className="jobSeekerProfile_bold">
                  Опыт работы
                </div>
                <div className="jobSeekerProfile_grey">
                  Расскажите о своем опыте работы
                </div>
              </div>
              <div className="jobSeekerProfile_inputs">
                {jobs}
                <div className="addMoreLink">
                  <span className="addMoreIcon">+</span>
                  <a href="javascript:void(0)"
                     className="ttt"
                     onClick={this.addJob.bind(this)}>
                     Добавить место работы
                  </a>
                </div>
              </div>
              <div className="jobSeekerProfile_submit">
                <button onClick={this.submitForm.bind(this)}>
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default JobSeekerProfile;
