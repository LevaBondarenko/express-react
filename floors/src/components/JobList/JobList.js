/**
 * JobList Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import Vacancy from './Vacancy';
import styles from './JobList.scss';
import {map, orderBy, find, isEmpty} from 'lodash';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {getFromBack, loadImage, sendOrder} from '../../utils/requestHelpers';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Dropzone from 'react-dropzone';
import {phoneFormatter, testPhone, phoneCleanup} from '../../utils/Helpers';
import classNames from 'classnames';
import request from 'superagent';
import ga from '../../utils/ga';
import CitySelector from './CitySelector';

@withCondition()
class JobList extends Component {

  static defaultProps = {
    title: 'Открытые вакансии',
    hrPhone: '+7 3452 68-14-05',
    profileLink: '/jobseeker-profile',
    hrLink: '/#'
  }

  static propTypes = {
    title: PropTypes.string,
    profileLink: PropTypes.string,
    hrPhone: PropTypes.string,
    hrLink: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);
    const currentVacancy = data.options.currentVacancy &&
      data.collections.vacancies ? find(data.collections.vacancies, job => {
        return job.name_tr === data.options.currentVacancy;
      }) : null;

    this.insertNoindex = !currentVacancy ? true : false;
    this.state = {
      jobs: data.collections.vacancies ?
        data.collections.vacancies : [],
      currentVacancy: currentVacancy ? currentVacancy :
      (data.collections.vacancies ?
        data.collections.vacancies[0] : null),
      cityId: data.options.cityId,
      hrPhone: props.hrPhone,
      showOrder: false,
      errors: {}
    };
  }

  componentDidMount() {
    this.removeCss = styles._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  changeVacancy() {
    const event = arguments[1];
    const job = arguments[0];
    const newLocation = `${window.location.origin}/job/${job.name_tr}/`;
    const prevVacancy = this.state.currentVacancy.name.toLowerCase();

    if (this.insertNoindex) {
      document.title = `Вакансия ${job.name.toLowerCase()}, работа в АН Этажи`;
    } else {
      document.title = document.title.replace(prevVacancy,
        job.name.toLowerCase());
    }

    event.preventDefault();

    this.setState(() => ({
      currentVacancy: job
    }));

    this.insertNoindex = false;

    window.history['pushState'](null, '', newLocation);
    const seoText = document.getElementById('page_seo_text');

    if (seoText) {
      seoText.remove();
    }
  }

  selectVacancy(e) {
    const jobName = e.target.value;
    const currentVacancy = find(this.state.jobs, job => {
      return job.name === jobName;
    });

    ga('pageview', `/virtual/job/${currentVacancy.name}`);
    this.setState(() => ({
      currentVacancy: currentVacancy
    }));
  }

  changeCity(item) {
    const cityId = item.value.toString();
    const domain = window.location.host.replace(/^[^.]*/, '');

    if (cityId) {
      getFromBack({cityId: cityId, action: 'select_city_site'}, 'get')
        .then(response => {
          window.location =
            `${location.protocol}//${response.site}${domain}/job/`;
        });
    }
  }

  toggleOrder() {

    if (!this.state.showOrder) {
      ga('pageview', '/virtual/job/popup_anketa');
    }

    this.setState(() => ({
      showOrder: !this.state.showOrder
    }));
  }

  validate(field, value) {
    if (field === 'name') {
      return !!value;
    }
    if (field === 'phone') {
      return testPhone(
        phoneCleanup(value),
        true,
        data.options.countryCode.avail
      );
    }
  }

  changeOrderFields(e) {
    let value = e.target.value;
    const type = e.target.dataset.type;
    const errors = {};

    if (type === 'phone') {
      value = phoneFormatter(
        value,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
    }

    if (!this.validate(type, value)) {
      errors[type] = true;
    } else {
      delete errors[type];
    }

    const newState = {};

    newState.errors = errors;
    newState[type] = value;

    if (isEmpty(errors)) {
      newState.validationSummary = null;
    }

    this.setState(() => (newState));
  }

  onDrop(files) {
    const types = [
      'application/pdf',
      'application/msword',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const file = files[files.length - 1];
    const errors = this.state.errors;

    if (types.indexOf(file.type) === -1) {
      errors.file = true;
    } else {
      delete errors.file;
      // отправка файла
      loadImage(file)
        .then(response => {
          const file = response.file;
          const content = response.result;

          request
            .post('https://pics2.etagi.com/upload.php?category=resume')
            .set({
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
            })
            .send({name: file.name, dir: 'resume', value: content})
            .end((err, res) => {
              if (err) {
                this.setState(() => ({
                  errorMsg: err.responseText
                }));
              } else {
                const responseText = JSON.parse(res.text);

                this.setState(() => ({
                  file: {
                    file: file,
                    link: responseText.fullpath,
                  },
                  loadingFile: false,
                  errors: errors
                }));
              }
            });
        });
    }

    this.setState(() => ({
      loadingFile: !errors.file ,
      errors: errors
    }));
  }

  sendOrder() {
    const {name, phone, currentVacancy, file, cityId} = this.state;
    const self = this;
    const fileName = file ? file.file.name : '';

    if (!(name && phone && currentVacancy)) {
      this.setState(() => ({
        errors: {
          name: !this.validate('name', name),
          phone: !this.validate('phone', phone ? phone : '')
        },
        validationSummary: 'Проверьте правильность заполнения формы'
      }));
    } else {
      const fioMsg = `ФИО: ${name}, Телефон: ${phone}`;
      const resumeLinkMsg = file ?
        `Ссылка на резюме: <a href="${file.link}">${fileName}</a>` :
        'Резюме не прикреплено';
      const dataSend = {
        action: 'create_ticket',
        name: name,
        phone: phone,
        subject: `Новое резюме. ${currentVacancy.name}`,
        message: `${fioMsg}. ${resumeLinkMsg}`,
        source: 'Web',
        'city_id': cityId,
        'type_id': 25
      };

      sendOrder(dataSend).then(response => {
        if (response.ajax.success) {
          ga('pageview', '/virtuall/job/popup_success');
          const resetState = {
            value: {}
          };

          self.setState({resetState});

          document.location.href =
            `${window.location.origin}/thank-you/?from=job`;
        }
      });
    }
  }

  render() {
    /* global data */
    const jobs = this.state.jobs;
    const {currentVacancy, cityId} = this.state;
    const cities = orderBy(data.collections.citiesWithVacancies, city => {
      return city.id !== data.options.cityId;
    });

    if (!jobs || !cities) {
      return (
        <div>Не подключен шаблон данных</div>
      );
    }

    if (!currentVacancy) {
      return (
        <div></div>
      );
    }

    const ModalBody = Modal.Body;
    const ModalHeader = Modal.Header;
    const ModalFooter = Modal.Footer;
    const ModalTitle = Modal.Title;
    const {title} = this.props;
    const vacancies = map(jobs, (job, k) => {
      return (
        <Vacancy key={k}
                 job={job}
                 ref={`job_${k}`}
                 currentVacancy={currentVacancy}
                 changeVacancy={this.changeVacancy.bind(this)} />
      );
    });
    const duties = currentVacancy.duties ?
      map(currentVacancy.duties.split('/'), (duty, k) => {
        return duty ? (
          <li key={k}>
            {duty}
          </li>
        ) : null;
      }) : null;
    const conditions = currentVacancy.conditions ?
      map(currentVacancy.conditions.split('/'), (c, k) => {
        return c ? (
          <li key={k}>
            {c}
          </li>
        ) : null;
      }) : null;
    const requirements = currentVacancy.requirements ?
      map(currentVacancy.requirements.split('/'),
      (r, k) => {
        return r ? (
          <li key={k}>
            {r}
          </li>
        ) : null;
      }) : null;
    const formNameClasses = classNames({
      'form-group': true,
      'has-error': this.state.errors.name
    });
    const formPhoneClasses = classNames({
      'form-group': true,
      'has-error': this.state.errors.phone
    });
    const jobDescription = (
      <div className={`jobDescr ${styles.jobDescription}`}>
        <GeminiScrollbar>
          <h4 className={styles.descrTitle}>
            {`Вакансия - "${currentVacancy.name}"`}
          </h4>
          <div className={styles.vacancyDescItem}>
            <div className={styles.descriptionSubtitle}>
              Обязанности
            </div>
            <div className={styles.vacancyDesc}>
              <ul>
                {duties}
              </ul>
            </div>
            <div className={styles.descriptionSubtitle}>
              Условия
            </div>
            <div className={styles.vacancyDesc}>
              <ul>
                {conditions}
              </ul>
            </div>
            <div className={styles.descriptionSubtitle}>
              Требования
            </div>
            <div className={styles.vacancyDesc}>
              <ul>
                {requirements}
              </ul>
            </div>
          </div>
        </GeminiScrollbar>
      </div>);

    return (
      <div className={styles.wrapper}>
        {this.state.loading ? (
          <div className={styles.blur}></div>
        ) : null}
        <div className={styles.jobList}>
          <div className={styles.jobListHeader}>
            <h3 className={styles.h3}>{title}</h3>
            <p className={styles.greytext}>
              Выберите интересующую вас вакансию из списка
            </p>
          </div>
          <div className={`hrJobsList ${styles.jobs}`}>
            <GeminiScrollbar>
              {vacancies}
            </GeminiScrollbar>
          </div>
          <div className={styles.hrInfo}>
            Не нашлась вакансия? Попробуйте написать в&nbsp;
            <a href={`mailto:${this.props.hrLink}`} className={styles.infoLink}>
              отдел персонала
            </a>,
            новые вакансии могут открыться позже
            <div className={styles.callUs}>
              или звоните <span className={styles.infoPhone}>
              {this.state.hrPhone}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.jobdesc}>
          <div className={styles.jobDescHeader}>
            <div className={styles.selectTitle}>Выберите город</div>
            <CitySelector
              className={`form-control ${styles.citySelect}`}
              cityId={this.state.cityId}
              changeCity={this.changeCity.bind(this)}
              cities={cities}
              context={this.props.context}
            />
          </div>
          {this.insertNoindex ?
            <noindex>
              {jobDescription}
            </noindex> :
              jobDescription
          }
          <div className={styles.jobButtons}>
            <button className={styles.submitBtn}
                    onClick={this.toggleOrder.bind(this)}>
              Откликнуться на вакансию
            </button>
            <a
              href={`${this.props.profileLink}?vacancy=${currentVacancy.name}&city=${cityId}`} // eslint-disable-line max-len
               target="_blank"
               className={styles.profileLink}>
              Заполнить анкету
            </a>
          </div>
        </div>
        <Modal show={this.state.showOrder} onHide={this.toggleOrder.bind(this)}>
          <ModalHeader closeButton>
            <ModalTitle>Откликнуться на вакансию</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <form onSubmit="" className="hrOrderForm">
              <div className="form-group">
                <select value={currentVacancy.name}
                        onChange={this.selectVacancy.bind(this)}
                        className="form-control">
                  {map(this.state.jobs, (job, k) => {
                    return (
                      <option key={k} value={job.name}>{job.name}</option>
                    );
                  })}
                </select>
              </div>
              <div className={formNameClasses}>
                <input className='form-control'
                       value={this.state.name}
                       data-type="name"
                       onChange={this.changeOrderFields.bind(this)}
                       type="text" placeholder="Ваше имя"/>
              </div>
              <div className={formPhoneClasses}>
                <input className='form-control'
                       value={this.state.phone}
                       data-type="phone"
                       onChange={this.changeOrderFields.bind(this)}
                       type="text" placeholder="Телефон"/>
              </div>
              <div className="form-group">
                <Dropzone onDrop={this.onDrop.bind(this)}
                          style={{
                            width: '100%',
                            height: '50px',
                            borderWidth: '1px',
                            borderStyle: 'dashed',
                            borderColor: '#666',
                            padding: '14px',
                            textAlign: 'center',
                            color: '#999'
                          }}
                          accept='.pdf,.doc,.docx,.odt'
                          multiple={false}>
                  <div>
                    Перетащите сюда файл с резюме или нажмите, чтобы загрузить
                  </div>
                </Dropzone>
              </div>
              <div className={styles.filesList}>
                {this.state.file ? (
                  <div className={styles.file}>
                    <a href={this.state.file.link} target="_blank">
                      {this.state.file.file.name}
                    </a>
                  </div>
                ) : null}
                {this.state.loadingFile ? (
                  <img
                    src="https://cdn-media.etagi.com/static/site/a/a7/a772f516be64d7b7ac36ed3e834a30471c4104c3.gif"
                    alt=""/>
                ) : null}
                {this.state.errors.file ? (
                  <div className={styles.file}>
                    Недопустимый тип файла.&nbsp;
                    Разрешенные типы: pdf, doc, docx, odt
                  </div>
                ) : null}
                {this.state.validationSummary ? (
                  <div className={styles.file} style={{color: 'firebrick'}}>
                    {this.state.validationSummary}
                  </div>
                ) : null}
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button className={styles.sendBtn}
                    onClick={this.sendOrder.bind(this)}>Отправить</Button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

export default JobList;
