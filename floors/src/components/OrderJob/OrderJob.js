/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import {isEmpty} from 'lodash';
import classNames from 'classnames';
import {sendOrder, loadImage} from '../../utils/requestHelpers';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import {phoneFormatter} from 'etagi-helpers';
import emptyFunction from 'fbjs/lib/emptyFunction';

import s from './OrderJob.scss';


class OrderJob extends Component {
  static propTypes = {
    jobName: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func
    })
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  static defaultProps = {
    jobName: 'Менеджер по продаже недвижимости'
  }

  /*global data*/
  constructor(props) {
    super(props);

    this.state = {
      currentVacancy: props.jobName,
      cityId: data.options.cityId,
      showOrder: false,
      errors: {}
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  toggleOrder() {
    this.setState(() => ({
      showOrder: !this.state.showOrder
    }));
  }

  validate(field, value) {
    if (field === 'name') {
      return !!value;
    }
    if (field === 'phone') {
      return !!value.match(
        new RegExp(/^\+7\s\(\d\d\d\)\D*\d\d\d\-\d\d\-\d\d$/));
    }
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
        .type('form')
        .set({
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
        subject: `Новое резюме. ${currentVacancy}`,
        message: `${fioMsg}. ${resumeLinkMsg}`,
        source: 'Web',
        'city_id': cityId,
        'type_id': 25
      };

      sendOrder(dataSend).then(response => {
        if (response.ajax.success) {
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

  changeOrderFields(e) {
    let value = e.target.value;
    const type = e.target.dataset.type;
    const errors = {};

    if (type === 'phone') {
      if (value.length === 1) {
        value = `+7 ${value}`;
      }
      if (value.length === 0) {
        value = '';
      }
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

  render() {
    const {currentVacancy} = this.state;
    const formNameClasses = classNames({
      'form-group': true,
      'has-error': this.state.errors.name
    });
    const formPhoneClasses = classNames({
      'form-group': true,
      'has-error': this.state.errors.phone
    });
    const ModalBody = Modal.Body;
    const ModalHeader = Modal.Header;
    const ModalFooter = Modal.Footer;
    const ModalTitle = Modal.Title;

    return (<div>
      <button className={s.submitBtn}
              onClick={this.toggleOrder.bind(this)}>
        Откликнуться на вакансию
      </button>
      <Modal show={this.state.showOrder} onHide={this.toggleOrder.bind(this)}>
        <ModalHeader closeButton>
          <ModalTitle>Откликнуться на вакансию</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form onSubmit="" className="hrOrderForm">
            <div className="form-group">Вакансия:&nbsp;
              <span className={s.vacansyName}>
                {currentVacancy}
              </span>
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
            <div className={s.filesList}>
              {this.state.file ? (
                <div className={s.file}>
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
                <div className={s.file}>
                  Недопустимый тип файла.&nbsp;
                  Разрешенные типы: pdf, doc, docx, odt
                </div>
              ) : null}
              {this.state.validationSummary ? (
                <div className={s.file} style={{color: 'firebrick'}}>
                  {this.state.validationSummary}
                </div>
              ) : null}
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button className={s.sendBtn}
                  onClick={this.sendOrder.bind(this)}>Отправить</Button>
        </ModalFooter>
      </Modal>
    </div>);
  }
}

export default OrderJob;
