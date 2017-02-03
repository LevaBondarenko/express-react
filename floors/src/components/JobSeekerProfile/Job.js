import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class Job extends Component {

  static propTypes = {
    idx: React.PropTypes.number,
    job: React.PropTypes.object,
    getValidationClass: React.PropTypes.func,
    bulkFieldChange: React.PropTypes.func,
    removeJob: React.PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  render() {

    const idx = this.props.idx;
    const job = this.props.job;
    const getValidationClass = this.props.getValidationClass;

    return (
      <div className="jobSeekerProfile_job">
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor={`company_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Компания
            </label>
          </div>
          <div className="col-sm-8">
            <input type="text"
                   className={`form-control 
                    ${getValidationClass(`company_${idx}`, 'jobs')}`}
                   placeholder="Название организации"
                   autoComplete="off"
                   data-field={`company_${idx}`}
                   value={job ? job.company : ''}
                   onChange={
                    this.props.bulkFieldChange.bind(this, 'jobs')
                   }
                   id={`company_${idx}`} />
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor={`job_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Должность
            </label>
          </div>
          <div className="col-sm-8">
            <input type="text"
                   className={`form-control 
                    ${getValidationClass(`job_${idx}`, 'jobs')}`}
                   placeholder="Должность"
                   autoComplete="off"
                   data-field={`job_${idx}`}
                   value={job ? job.job : ''}
                   onChange={
                    this.props.bulkFieldChange.bind(this, 'jobs')
                   }
                   id={`job_${idx}`} />
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor={`monthStart_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Период работы
            </label>
          </div>
          <div className="col-sm-8 jobPeriod">
            <div className="col-sm-6">
              <select id={`monthStart_${idx}`}
                      data-field={`monthStart_${idx}`}
                      value={job ? job.monthStart : ''}
                      onChange={
                        this.props.bulkFieldChange.bind(this, 'jobs')
                      }
                      className={
                      `form-control 
                      ${getValidationClass(`monthStart_${idx}`, 'jobs')}`
                      }
              >
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
            <div className="col-sm-6">
              <input type="text"
                     className={`form-control 
                      ${getValidationClass(`yearStart_${idx}`, 'jobs')}`}
                     placeholder="Год начала"
                     autoComplete="off"
                     data-field={`yearStart_${idx}`}
                     value={job ? job.yearStart : ''}
                     onChange={
                        this.props.bulkFieldChange.bind(this, 'jobs')
                      }
                     id={`yearStart_${idx}`} />
              <div className="jobSeekerProfile_check"></div>
            </div>
            <div className="col-sm-6">
              <select id={`monthEnd_${idx}`}
                      data-field={`monthEnd_${idx}`}
                      value={job ? job.monthEnd : ''}
                      onChange={
                        this.props.bulkFieldChange.bind(this, 'jobs')
                      }
                      className={`form-control 
                        ${getValidationClass(`monthEnd_${idx}`, 'jobs')}`}
              >
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
            <div className="col-sm-6">
              <input type="text"
                     className={`form-control 
                      ${getValidationClass(`yearEnd_${idx}`, 'jobs')}`}
                     placeholder="Год окончания"
                     autoComplete="off"
                     data-field={`yearEnd_${idx}`}
                     value={job ? job.yearEnd : ''}
                     onChange={
                        this.props.bulkFieldChange.bind(this, 'jobs')
                      }
                     id={`yearEnd_${idx}`} />
              <div className="jobSeekerProfile_check"></div>
            </div>
          </div>
        </div>
        <div className="form-group duties">
          <div className="col-sm-4">
            <label htmlFor={`responsibility_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Обязанности
            </label>
          </div>
          <div className="col-sm-8">
            <textarea name="responsibility"
                      className={`form-control 
                        ${getValidationClass(`responsibility_${idx}`, 'jobs')}`}
                      id={`responsibility_${idx}`}
                      placeholder={
                      'Не ограничивайтесь одним-двумя словами, ' +
                       'а подробно опишите ваши обязанности и достижения'
                      }
                      data-field={`responsibility_${idx}`}
                      value={job ? job.responsibility : ''}
                      onChange={
                        this.props.bulkFieldChange.bind(this, 'jobs')
                      }
                      rows="7">
            </textarea>
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        {
          idx > 1 ? (
            <div className="addMoreLink removeLink">
              <span className="plus">-</span>
              <a href="#"
                 onClick={this.props.removeJob.bind(this, idx)}>
                Удалить место работы
              </a>
            </div>
          ) : null
        }
      </div>
    );
  }

}

export default Job;