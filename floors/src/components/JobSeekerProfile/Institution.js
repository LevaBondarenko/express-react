import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class Institution extends Component {

  static propTypes = {
    idx: React.PropTypes.number,
    institution: React.PropTypes.object,
    getValidationClass: React.PropTypes.func,
    bulkFieldChange: React.PropTypes.func,
    removeInst: React.PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  render() {
    const idx = this.props.idx;
    const institution = this.props.institution;
    const getValidationClass = this.props.getValidationClass;

    return (
      <div className="jobSeekerProfile_inst">
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor={`institution_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Учебное заведение
            </label>
          </div>
          <div className="col-sm-8">
            <input type="text"
                   className={`form-control 
                   ${getValidationClass(`institution_${idx}`, 'institutions')}`}
                   placeholder="Учебное заведение"
                   autoComplete="off"
                   data-field={`institution_${idx}`}
                   value={institution ? institution.institution : ''}
                   onChange={
                    this.props.bulkFieldChange.bind(this, 'institutions')
                   }
                   id={`institution_${idx}`} />
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor={`speciality_${idx}`}
                   className="control-label">
              <span className="required_flag">*</span>
              Специальность
            </label>
          </div>
          <div className="col-sm-8">
            <input type="text"
                   placeholder="Специальность"
                   className={`form-control
                    ${getValidationClass(`speciality_${idx}`, 'institutions')}`}
                   autoComplete="off"
                   data-field={`speciality_${idx}`}
                   value={institution ? institution.speciality : ''}
                   onChange={
                    this.props.bulkFieldChange.bind(this, 'institutions')
                   }
                   id={`speciality_${idx}`} />
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-4">
            <label htmlFor="graduate_year"
                   className="control-label">
              <span className="required_flag">*</span>
              Год окончания
            </label>
          </div>
          <div className="col-sm-8">
            <input type="text"
                   className={`form-control
                    ${getValidationClass(
                      `graduateYear_${idx}`, 'institutions'
                    )}`}
                   placeholder="Год окончания"
                   autoComplete="off"
                   data-field={`graduateYear_${idx}`}
                   value={institution ? institution.graduateYear : ''}
                   onChange={
                    this.props.bulkFieldChange.bind(this, 'institutions')
                   }
                   id={`graduateYear_${idx}`} />
            <div className="jobSeekerProfile_check"></div>
          </div>
        </div>
        {
          idx > 1 ? (
            <div className="addMoreLink removeLink">
              <span className="addMoreIcon">-</span>
              <a href="#"
                 onClick={this.props.removeInst.bind(this, idx)}>
                Удалить место учебы
              </a>
            </div>
          ) : null
        }
      </div>
    );
  }
}

export default Institution;