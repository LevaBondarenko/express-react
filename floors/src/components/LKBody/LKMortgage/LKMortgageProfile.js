/**
 * LK Mortgage Profile component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import {
  size, map, uniq, mapValues, reduce, assignIn, cloneDeep, isArray, without,
  omitBy, forEach, keyBy, find, keys, union, findIndex, filter, maxBy, sortBy
} from 'lodash';
import {
  testPhone, phoneCleanup, testEmail, phoneFormatter
} from '../../../utils/Helpers';

import profileSettings from './config/profileSettings';
import validateSettings from './config/validateSettings';
import LKMortgageSendSuccessModal from './LKMortgageSendSuccessModal';
import LKSteps from '../LKSteps';
import UFileUploader from '../../UFileUploader/UFileUploader';
import s from './style.scss';
import Row from 'react-bootstrap/lib/Row'; //eslint-disable-line no-unused-vars
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import Radio from 'react-bootstrap/lib/Radio';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Form from 'react-bootstrap/lib/Form';
/**
 * React/Flux entities
 */
import wss from '../../../stores/WidgetsStateStore';
import WidgetsActions from '../../../actions/WidgetsActions';

/* global data */

class LKMortgageProfile extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    subId: PropTypes.string,
    user: PropTypes.object,
    mortgage: PropTypes.object,
    documents: PropTypes.array,
    bankProfileSettings: PropTypes.object,
    profileSended: PropTypes.bool,
    requestBankProfileSettings: PropTypes.func,
    onProfileChange: PropTypes.func,
    onProfileSend: PropTypes.func,
    onProfileError: PropTypes.func,
    onUploadDocument: PropTypes.func
  };

  constructor(props) {
    super(props);
    const {profile} = props.mortgage ? props.mortgage : {profile: {}};

    this.state = {
      showSuccess: false,
      isLoading: false,
      agreed: true,
      values: this.mergeValues(profile, props.bankProfileSettings),
      forceValidate: [],
      multipageShown: [],
      sendAttemted: false,
      documents: this.parseDocs(props.documents)
    };
  }

  componentWillReceiveProps(nextProps) {
    const {profile} = nextProps.mortgage ? nextProps.mortgage : {profile: {}};
    const {state} = this;

    state.values = assignIn(
      state.values, this.mergeValues(profile, nextProps.bankProfileSettings)
    );
    state.documents = assignIn(
      state.documents, this.parseDocs(nextProps.documents)
    );
    if(this.props.subId !== nextProps.subId && !state.sendAttemted) {
      state.forceValidate = [];
    }
    this.setState(() => (state));
  }

  componentDidMount() {
    const {bankProfileSettings} = this.props;

    if(!size(bankProfileSettings)) {
      this.props.requestBankProfileSettings();
    }
    wss.onChange(this.wssChange);
    this.wssChange();
  }

  componentWillUnmount() {
    wss.offChange(this.wssChange);
  }

  mergeValues = (profile, bankProfileSettings) => {
    const {user} = this.props;
    const fields = reduce(cloneDeep(profileSettings), (result, value) => {
      result = size(result) ? assignIn(result, value.fields) : value.fields;
      return result;
    }, {});
    const values = omitBy(mapValues(profile, item => {
      const outputName =
        fields[item.attrKey] && fields[item.attrKey].outputNameOverride ?
        fields[item.attrKey].outputNameOverride : (
          size(bankProfileSettings) &&
          bankProfileSettings.fields[item.attrKey] ?
          bankProfileSettings.fields[item.attrKey].params.output.name : null
        );

      return outputName === 'checkbox' ?
        (item.value ? item.value.split(',') : []) :
        item.value;
    }), item => { return !size(item); });
    const fromLK = mapValues(fields, item => {
      return item.lk && user[item.lk] ?
        (item.lk === 'phone' ? phoneFormatter(
          user[item.lk],
          data.options.countryCode.current,
          data.options.countryCode.avail
        ) : user[item.lk]) : null;
    });

    return omitBy(assignIn(fromLK, values), item => {
      return !size(item);
    });
  }

  parseDocs = docs => {
    const forWss = {};
    const result = keyBy(docs, item => {
      const type = item.detail && item.detail.type ? item.detail.type : null;
      const page = item.detail && item.detail.page ? item.detail.page : null;
      const id = page ? `${type}:${page}` : type;

      if(id) {
        forWss[id] = item.file;
      }
      return id;
    });

    setTimeout(() => {
      WidgetsActions.set('lkMortgageProfileUploads', forWss);
    }, 0);
    return result;
  }

  wssChange = () => {
    const uploads = wss.get().lkMortgageProfileUploads;
    const {documents} = this.state;
    const attachStep = find(profileSettings, 'attachs');
    const docsToLoad = [];

    forEach(uploads, (item, key) => {
      if(!documents[key] || item !== documents[key].file) {
        const docParam = {
          file: item,
          destination: 'mortgage'
        };
        const detail = {type: key};
        let typeId = null;
        const subKey = key.split(':');

        if(subKey[1]) {
          detail.type = subKey[0];
          docParam.type = subKey[0];
          docParam.type_id = attachStep.fields[subKey[0]].typeId, //eslint-disable-line camelcase
          docParam.title = key === 'archive' ?
            attachStep.fields[subKey[0]].descr :
            attachStep.fields[subKey[0]].titleOverride;
          typeId = attachStep.fields[subKey[0]].typeId;
          detail.page = parseInt(subKey[1]);
          docParam.page = parseInt(subKey[1]);
        } else {
          typeId = attachStep.fields[key].typeId;
          docParam.type = key;
          docParam.type_id = attachStep.fields[key].typeId, //eslint-disable-line camelcase
          docParam.title = key === 'archive' ? attachStep.fields[key].descr :
            attachStep.fields[key].titleOverride;
        }
        documents[key] = {
          type_id: typeId, //eslint-disable-line camelcase
          file: item,
          detail: detail
        };
        docsToLoad.push(docParam);
      }
    });
    this.state.isLoading && setTimeout(() => {
      this.setState(() => ({showSuccess: true}));
    }, 100);
    this.setState(() => ({
      isLoading: false,
      documents: documents
    }));
    forEach(docsToLoad, item => {
      this.props.onUploadDocument(item);
    });
  }

  stepChange = e => {
    const {id} = e.target;
    const {forceValidate} = this.state;
    const withError = this.validateAndSaveStep();

    if(size(withError)) {
      this.setState(() => ({
        forceValidate: union(forceValidate, withError)
      }));
    } else {
      window.location.hash = `/mortgage/profile/${parseInt(id) + 1}`;
    }
  }

  handleChange = e => {
    const rules = {
      205: 'phone'
    };
    const {values, forceValidate} = this.state;
    const {id, value, type} = e.target;
    const formatting = rules[id];
    let newValue;

    switch(type) {
    case 'checkbox':
      newValue = isArray(values[id]) ? values[id] :
        (values[id] ? [values[id]] : []);
      if(newValue.indexOf(value) === -1) {
        newValue.push(value);
      } else {
        newValue = without(newValue, value);
      }
      break;
    default:
      newValue = value;
    }

    switch(formatting) {
    case 'phone':
      values[id] = phoneFormatter(
        newValue,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
      break;
    default:
      values[id] = newValue;
    }
    forceValidate.push(id);
    this.setState(() => ({
      values: values,
      forceValidate: uniq(forceValidate)
    }));
    (type === 'checkbox' || type === 'radio') &&
      this.props.onProfileChange({
        [id]: isArray(newValue) ? newValue.join(',') : newValue
      });
  }

  handleBlur = e => {
    const {forceValidate} = this.state;
    const {id, value, type} = e.target;

    type === 'text' && this.props.onProfileChange({[id]: value});
    forceValidate.push(id);
    this.setState(() => ({
      forceValidate: uniq(forceValidate)
    }));
  }

  getValidation = (id, fieldRequired, message = false) => {
    const {values, forceValidate} = this.state;
    let result = !size(values[id]) || message ? null : 'success';

    if(!values[id] && forceValidate.indexOf(id) === -1) {
      return null;
    }

    if(fieldRequired && !size(values[id])) {
      result = message ? 'Поле обязательно для заполнения' : 'error';
    }

    if(values[id] && validateSettings[id]) {
      switch(validateSettings[id]) {
      case 'phone':
        testPhone(
          phoneCleanup(values[id]),
          true,
          data.options.countryCode.avail
        ) || (result = message ? 'Телефон введен не правильно' : 'warning');
        break;
      case 'email':
        testEmail(values[id]) ||
          (result = message ? 'Email введен не правильно' : 'warning');
        break;
      default:
        //do nothing
      }
    }

    return result;
  }

  getInput = (id, title, required) => {
    const {values} = this.state;
    const {profileSended} = this.props;

    return (
      <FormGroup
        key={id}
        controlId={id}
        validationState={this.getValidation(id, required)}>
        <Col componentClass={ControlLabel} xs={3}>
          {title}
          {required ? (
            <span className={s.required}>*</span>
          ) : null}
        </Col>
        <Col xs={4}>
          <FormControl type='text'
            id={id}
            data-id={id}
            value={values[id] || ''}
            disabled={profileSended}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            placeholder={title} />
          <Feedback />
          <HelpBlock>{this.getValidation(id, required, true)}</HelpBlock>
        </Col>
      </FormGroup>
    );
  }

  getRadio = (id, catalogKey, title, required) => {
    const {values} = this.state;
    const {bankProfileSettings, profileSended} = this.props;
    const catalog = catalogKey ? bankProfileSettings.catalogs[catalogKey] :
      {1: 'Да', 0: 'Нет'};
    let list = map(catalog, (item, key) => {
      return(
        <Radio
          key={key}
          id={id}
          data-id={id}
          value={key}
          disabled={profileSended}
          checked={key === values[id]}
          onChange={this.handleChange}>
          <span>{item}</span>
        </Radio>
      );
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});

    return (
      <FormGroup
        key={id}
        controlId={id}
        validationState={this.getValidation(id, required)}>
        <Col componentClass={ControlLabel} xs={3}>
          {title}
          {required ? (
            <span className={s.required}>*</span>
          ) : null}
        </Col>
        <Col xs={4}>
          {list}
          <HelpBlock>{this.getValidation(id, required, true)}</HelpBlock>
        </Col>
      </FormGroup>
    );
  }

  getCheckBox = (id, catalogKey, title, required) => {
    const {values} = this.state;
    const {bankProfileSettings, profileSended} = this.props;
    const catalog = catalogKey ? bankProfileSettings.catalogs[catalogKey] :
      {1: 'Да', 0: 'Нет'};
    let list = map(catalog, (item, key) => {
      const checked = values[id] && values[id].indexOf(key) !== -1;

      return(
        <Checkbox
          key={key}
          id={id}
          data-id={id}
          value={key}
          disabled={profileSended}
          checked={checked}
          onChange={this.handleChange}>
          <span>{item}</span>
        </Checkbox>
      );
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: null});

    return (
      <FormGroup
        key={id}
        controlId={id}
        validationState={this.getValidation(id, required)}>
        <Col componentClass={ControlLabel} xs={3}>
          {title}
          {required ? (
            <span className={s.required}>*</span>
          ) : null}
        </Col>
        <Col xs={4}>
          {list}
          <HelpBlock>{this.getValidation(id, required, true)}</HelpBlock>
        </Col>
      </FormGroup>
    );
  }

  getFileUploader = (id, title, descr, newPage = false) => {
    const {context} = this.props;

    return (
      <div className={s.uploader}>
        <UFileUploader
          context={context}
          objectName='lkMortgageProfileUploads'
          fieldName={id}
          label={title}
          buttonLabel={newPage ? 'Добавить страницу' : 'Загрузить'}
          buttonLoaded='Обновить'
          help={descr}
          helpOnDrag='Перетащить и отпустить'
          mode='dropAreaWithButton'
          fileTypes={['.jpg', '.png', '.tiff','.pdf']}
          viewEnabled={true}
          viewInModal={true}/>
      </div>
    );
  }

  getMultipageFileUploader = (id, title, descr, pages) => {
    const {context} = this.props;
    const {multipageShown, documents} = this.state;
    const shown = multipageShown.indexOf(id) !== -1;
    let subPages = map(sortBy(pages, item => {
      return item.detail && item.detail.page;
    }), item => {
      return this.getFileUploader(
        `${id}:${item.detail.page}`,
        `${title}, страница: ${item.detail.page}`,
        descr
      );
    });
    const lastPage = maxBy(filter(documents, item => {
      return item.detail && item.detail.type === id && item.detail.page;
    }), item => {
      return item.detail && item.detail.page ? item.detail.page : 0;
    });
    const page = lastPage ? parseInt(lastPage.detail.page) + 1 : 1;

    subPages.push(this.getFileUploader(
      `${id}:${page}`,
      `${title}, загрузить еще страницу`,
      descr,
      true
    ));

    const subPagesCount = size(subPages);

    subPages = subPagesCount > 0 ?
      createFragment({subPages: subPages}) :
      createFragment({subPages: <div/>});

    return (
      <div className={classNames(
        s.multipageUploader,
        {[s.active]: shown}
      )}>
        <div className={s.uploader}>
          <Button
            className={s.subpageToggle}
            data-subid={id}
            onClick={this.subpagesToggle}>
            Загрузить постранично
            <i className={classNames(
              'fa',
              {'fa-angle-down': !shown},
              {'fa-angle-up': shown}
            )}/>
          </Button>
          <UFileUploader
            context={context}
            objectName='lkMortgageProfileUploads'
            fieldName={id}
            label={title}
            buttonLabel='Загрузить'
            buttonLoaded='Обновить'
            help={descr}
            helpOnDrag='Перетащить и отпустить'
            mode='dropAreaWithButton'
            fileTypes={['.jpg', '.png', '.tiff','.pdf']}
            viewEnabled={true}
            viewInModal={true}/>
        </div>
        <div
          className={classNames(
            s.subpages,
            {[s.shown]: shown}
          )}
          style={{height: shown ? `${64 * subPagesCount}px` : null}}>
          {subPages}
        </div>
      </div>
    );
  }

  subpagesToggle = e => {
    let ancestor = e.target;

    while(!ancestor.dataset.subid && (ancestor = ancestor.parentNode)) {};
    if(ancestor.dataset.subid) {
      const {subid: id} = ancestor.dataset;
      const {multipageShown} = this.state;
      let newShown = [];

      if(multipageShown.indexOf(id) === -1) {
        newShown = union(multipageShown, [id]);
      } else {
        newShown = without(multipageShown, id);
      }
      this.setState(() => ({
        multipageShown: newShown
      }));
    }
  }

  submit = () => {
    const {forceValidate} = this.state;
    const withError = this.validateAndSaveStep(true);

    if(size(withError)) {
      setTimeout(() => { this.props.onProfileError(); }, 100);
      this.setState(() => ({
        forceValidate: union(forceValidate, withError),
        sendAttemted: true
      }));
    } else {
      this.setState(() => ({isLoading: true}));
      this.props.onProfileSend();
    }
  }

  checkStep = e => {
    const {forceValidate} = this.state;
    const withError = this.validateAndSaveStep();

    if(size(withError)) {
      e.preventDefault();
      this.setState(() => ({
        forceValidate: union(forceValidate, withError)
      }));
    }
  }

  validateAndSaveStep = (all = false) => {
    const {values} = this.state;
    const {subId, mortgage} = this.props;
    const profile = mortgage.profile || {};
    const fields = reduce(cloneDeep(profileSettings), (result, value) => {
      result = size(result) ? assignIn(result, value.fields) : value.fields;
      return result;
    }, {});
    const step = subId ? (subId - 1) : 0;
    const cStep = profileSettings[step] ? profileSettings[step] : {};
    const cStepFields = size(cStep) ? keys(cStep.fields) : [];
    const withError = [];

    forEach(fields, (item, key) => {
      if(all || cStepFields.indexOf(key) !== -1) {
        const valueInProfile = profile[key] ? profile[key].value : null;
        let fieldOk = true;

        if(!size(values[key]) && item.required) {
          fieldOk = false;
        } else if(validateSettings[key]) {
          switch(validateSettings[key]) {
          case 'phone':
            fieldOk = testPhone(
              phoneCleanup(values[key]),
              true,
              data.options.countryCode.avail
            );
            break;
          case 'email':
            fieldOk = testEmail(values[key]);
            break;
          default:
            //do nothing
          }
        }
        fieldOk || withError.push(key);
        if(fieldOk && values[key] !== valueInProfile) {
          this.props.onProfileChange({[key]: values[key]});
        }
      }
    });

    return withError;
  }

  getStepsWithErrors = () => {
    const {forceValidate} = this.state;
    const errorSteps = [];

    forEach(forceValidate, item => {
      const itemStep = findIndex(profileSettings, step => {
        return step.fields[item] !== undefined;
      });

      this.getValidation(
        item,
        itemStep > -1 ? false : profileSettings[itemStep].fields[item].required
      ) === 'success' || errorSteps.push(itemStep);
    });

    return uniq(errorSteps);
  }

  aggrementToggle = () => {
    this.setState(() => ({agreed: !this.state.agreed}));
  }

  dismiss = () => {
    this.setState(() => ({showSuccess: false}));
    setTimeout(() => {
      window.location.hash = '/mortgage/';
    }, 100);
  }

  render() {
    const subId = parseInt(this.props.subId);
    const {bankProfileSettings, profileSended, context, mortgage} = this.props;
    const {ticket} = mortgage;
    const {agreed, values, showSuccess, isLoading} = this.state;
    const step = subId ? (subId - 1) : 0;
    const steps = size(profileSettings);
    const stepsWithErrors = this.getStepsWithErrors();
    const cStep = profileSettings[step] ? profileSettings[step] : {};
    let fields = size(bankProfileSettings) ? map(cStep.fields, (item, key) => {
      const fieldSettings = bankProfileSettings.fields[key];
      let control = null;

      if(fieldSettings || cStep.attachs) {
        const outputName = item.outputNameOverride ?
          item.outputNameOverride : fieldSettings.params.output.name;

        switch(outputName) {
        case 'input':
          control = this.getInput(
            key,
            item.titleOverride ? item.titleOverride : fieldSettings.title,
            item.required
          );
          break;
        case 'checkbox':
          control = this.getCheckBox(
            key,
            fieldSettings.params.reference ?
              fieldSettings.params.reference.catalogKey : null,
            item.titleOverride ? item.titleOverride : fieldSettings.title,
            item.required
          );
          break;
        case 'radio':
          control = this.getRadio(
            key,
            fieldSettings.params.reference ?
              fieldSettings.params.reference.catalogKey : null,
            item.titleOverride ? item.titleOverride : fieldSettings.title,
            item.required
          );
          break;
        case 'file':
          const {rules} = item;
          let required = key !== 'archive';
          const {documents} = this.state;
          const pages = item.multipage ? filter(documents, doc => {
            return doc.detail.type === key && doc.detail.page;
          }) : null;

          if(size(rules)) {
            forEach(rules, (item, key) => {
              if(item.toString().indexOf('<') !== -1) {
                parseInt(values[key]) >= parseInt(item.substring(1)) &&
                  (required = false);
              } else if(isArray(values[key])) {
                values[key].indexOf(item.toString()) === -1 &&
                  (required = false);
              } else {
                values[key] !== item.toString() && (required = false);
              }
            });
          }
          control = required ? (item.multipage ?
            this.getMultipageFileUploader(
              key,
              item.titleOverride ? item.titleOverride : fieldSettings.title,
              item.descr,
              pages
            ) : this.getFileUploader(
              key,
              item.titleOverride ? item.titleOverride : fieldSettings.title,
              item.descr
            )
          ) : null;
          break;
        default:
          //do nothing
        }
      }

      return control;
    }) : null;

    fields = size(fields) > 0 ?
      createFragment({fields: fields}) :
      createFragment({fields: <div/>});

    return (
      <div className={s.LKMortgageProfile}>
        <div className={s.header}>
          <span>Анкета</span>
          <span><i className='fa fa-clock-o'/> Не более 5 минут</span>
        </div>
        <LKSteps
          steps={steps}
          step={step}
          errorSteps={stepsWithErrors}
          suffix='шаг'
          onChange={this.stepChange}/>
        <div className={s.stepTitle}>
          {`${(step + 1)} шаг. ${cStep.title}`}
        </div>
        {cStep.description ? (
          <span className={s.stepDescription}>
            {cStep.description}
          </span>
        ) : null}
        {cStep.attachs ? (
          <div className={s.attachDescription}>
            <div className={s.agreement}>
              <Checkbox
                id='agreement'
                checked={agreed}
                onChange={this.aggrementToggle}/>
              <span>
                Я принимаю условия&nbsp;
                <a href='/user_agreement/'>Пользовательского соглашения</a>
                &nbsp; и даю своё согласие на обработку моих персональных
                данных, в соответствии с Федеральным законом от 27.07.2006 года
                № 152-ФЗ "О персональных данных", на условиях и для целей,
                определенных <a href='#'>Политикой конфиденциальности</a>
              </span>
            </div>
            <span className={s.sizes}>
              Максимальный размер загружаемого документа - <strong>5Мб</strong>
              <br/>Если вы хотите загрузить все документы одним архивом,
              максимальный размер архива - <strong>25Мб</strong>.<br/>
              Также вы можете просто перетащить документ для загрузки в
              специально предусмотренную для этого область или на
              соответствующую загружаемому документу строку.
            </span>
            <div className={s.uploader}>
              <UFileUploader
                context={context}
                objectName='lkMortgageProfileUploads'
                fieldName='archive'
                label={cStep.fields.archive.titleOverride}
                helpOnDrag='Перетащить и отпустить'
                mode='onlyDropzone'
                fileTypes={['.zip', '.rar', '.pdf', '.7z', '.tar', '.gz']}
                viewEnabled={false}
                viewInModal={false}/>
            </div>
          </div>
        ) : null}
        <Form horizontal className={s.stepForm}>
          {fields}
        </Form>
        <div className={classNames(s.stepNavigate, 'clearfix')}>
          {step > 0 ? (
            <Button
              bsStyle='default'
              className={s.prevStep}
              href={`#/mortgage/profile/${step}`}>
              <i className='fa fa-angle-left'/>&nbsp;&nbsp;Назад
            </Button>
          ) : null}
          {step < steps - 1 ? (
            <Button
              bsStyle='success'
              className={s.nextStep}
              onClick={this.checkStep}
              href={`#/mortgage/profile/${(step + 2)}`}>
              Вперед&nbsp;&nbsp;<i className='fa fa-angle-right'/>
            </Button>
          ) : null}
          {step >= steps - 1 ? (
            <Button
              disabled={profileSended || !agreed || isLoading}
              bsStyle='success'
              className={s.nextStep}
              onClick={this.submit}>
              {isLoading ? (
                <i className='fa fa-spin fa-spinner'/>
              ) : (
                <span>
                  Отправить анкету <i className='fa fa-cloud-upload'/>
                </span>
              )}
            </Button>
          ) : null}
        </div>
        {showSuccess ? (
          <LKMortgageSendSuccessModal
            context={context}
            ticketId={ticket.ticket_id}
            processingTime='5-7 дней'
            onDismiss={this.dismiss}/>
        ) : null}
      </div>
    );
  }
}

export default withStyles(s)(LKMortgageProfile);
