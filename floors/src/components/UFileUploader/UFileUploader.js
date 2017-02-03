/**
 * UFileUploader widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import s from './UFileUploader.scss';
import {loadImage, uploadToPics} from '../../utils/requestHelpers';
import HelpIcon from '../../shared/HelpIcon';
import ModalWindow from '../../shared/ModalWindow/';
import Image from '../../shared/Image';
import classNames from 'classnames';
import {size, toArray, filter} from 'lodash';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
/**
 * Bootstrap 3 elements
 */
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../actions/WidgetsActions';
import withCondition from '../../decorators/withCondition';

class UFileUploader extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    className: React.PropTypes.string,
    label: React.PropTypes.string,
    buttonLabel: React.PropTypes.string,
    buttonLoaded: React.PropTypes.string,
    help: React.PropTypes.string,
    staticHelp: React.PropTypes.string,
    helpOnDrag: React.PropTypes.string,
    fileTypes: React.PropTypes.array,
    fileMaxSize: React.PropTypes.number,
    mode: React.PropTypes.string,
    viewEnabled: React.PropTypes.bool,
    viewInModal: React.PropTypes.bool,
    viewInBlock: React.PropTypes.bool,
    dir: React.PropTypes.string,
    actions: PropTypes.object,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    isReadonly: React.PropTypes.bool,
    isHidden: React.PropTypes.bool,
    msg: React.PropTypes.string,
    err: React.PropTypes.string,
  };

  static defaultProps = {
    label: 'Загрузить',
    fileMaxSize: 25000000
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      value: null,
      msg: null,
      err: null,
      isReadonly: false,
      isHidden: false,
      isLoading: false,
      drag: false,
      showModal: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.processProps(this.props);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {value: newValue, isReadonly, isHidden, msg, err} = props;
    const {value, drag, isLoading} = this.state;

    this.setState(() => ({
      value: newValue,
      msg: msg,
      err: err,
      isReadonly: isReadonly,
      isHidden: isHidden,
      isLoading: isLoading && value === newValue,
      drag: isLoading && value === newValue ? drag : false
    }));
  }

  onClick = e => {
    const {objectName, fieldName} = this.props;
    const input =
      document.getElementById(`ufileinput-${objectName}-${fieldName}`);
    const dropzone = ReactDOM.findDOMNode(this.refs.dropzone);
    const {offsetHeight} = dropzone ? dropzone : {};

    offsetHeight && this.setState(() => ({
      height: offsetHeight
    }));

    e.preventDefault();
    input.click();
  }

  onDrop = e => {
    const {objectName, fieldName, fileTypes, fileMaxSize, dir} = this.props;
    let files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const filesSelected = size(files) > 0;
    const uplDir = size(dir) ? dir : 'lk';

    e.preventDefault();
    files = toArray(files);
    files = filter(files, item => {
      const ext = item.name.match(/.*(\.\w+)$/i);
      const sizeValid = item.size <= fileMaxSize;
      const extValid = fileTypes.indexOf(ext[1] && ext[1].toLowerCase()) !== -1;

      return sizeValid && extValid;
    });

    if(size(files)) {
      this.setState(() => ({isLoading: true}));
      loadImage(files[0]).then(response => {
        uploadToPics(response.file, response.result, uplDir).then(response => {
          if(response.status) {
            const imgSymbols = response.filename.toString().substr(0, 2);
            const link = `https://cdn-media.etagi.com/content/media/${uplDir}/${imgSymbols[0]}/${imgSymbols}/${response.filename}`;

            this.props.actions.updateInObjectsState(
              [objectName, fieldName], () => (link));
          } else {
            this.setState(() => ({isLoading: false}));
            WidgetsActions.set('notify',[{
              msg: 'Ошибка загрузки файла, если ошибка повторяется - обратитесь в службу поддержки', // eslint-disable-line max-len
              type: 'dang'
            }]);
          }
        }, (error) => {
          this.setState(() => ({isLoading: false}));
          WidgetsActions.set('notify',[{
            msg: `Ошибка загрузки фото (${error.err}), если ошибка повторяется - обратитесь в службу поддержки`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        });
      }, (error) => {
        this.setState(() => ({isLoading: false}));
        WidgetsActions.set('notify',[{
          msg: `Ошибка чтения файла: ${error.name}`,
          type: 'dang'
        }]);
      });
    } else if(filesSelected) {
      WidgetsActions.set('notify',[{
        msg: 'Тип файла не поддерживается или размер файла превышает допустимый',  // eslint-disable-line max-len
        type: 'dang'
      }]);
    }
  }

  allowDrop = e => {
    e.preventDefault();
  }

  onDragEnter = () => {
    const dropzone = ReactDOM.findDOMNode(this.refs.dropzone);
    const {offsetHeight} = dropzone ? dropzone : {};

    offsetHeight && this.setState(() => ({
      drag: true,
      height: offsetHeight
    }));
  }

  onDragLeave = () => {
    setTimeout(() => { this.setState(() => ({drag: false})); }, 300);
  }

  viewHandle = e => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState(() => ({showModal: !this.state.showModal}));
  }

  get imgPreview() {
    const {value} = this.state;
    const fileName = (/.*content\/(.*)\/.{1}\/.{2}\/([^\/]*)$/).exec(value);
    const imageProps = {
      image: fileName[2],
      visual: fileName[1],
      width: 320,
      height: 240
    };

    return imageProps;
  }

  render() {
    const {
      label, help, helpOnDrag, fileTypes, mode, viewEnabled, className,
      objectName, fieldName, viewInModal, buttonLabel, buttonLoaded, staticHelp,
      viewInBlock
    } = this.props;
    const {
      value, msg, err, isReadonly, isHidden, isLoading, drag, showModal, height
    } = this.state;

    return (
      <div
        className={classNames(className, s.UFileUploader, 'clearfix')}
        style={{display: isHidden ? 'none' : 'block'}}>
        <div
          ref='dropzone'
          className={classNames(
            'ufileuploader-container', 'row',
            {'has-error': err === 'error'},
            {'has-warning': err === 'warning'},
            {'ufileuploader-droparea': mode !== 'onlyButton'},
            {'dragover': drag || isLoading}
          )}
          onDragEnter={mode !== 'onlyButton' ? this.onDragEnter : null}
          onDragLeave={mode !== 'onlyButton' ? this.onDragLeave : null}
          onDrop={mode !== 'onlyButton' ? this.onDrop : null}
          onDragOver={mode !== 'onlyButton' ? this.allowDrop : null}>
          {drag || isLoading ? (
            <div className='dragover-block' style={{height: `${height}px`}}>
              {isLoading ? (
                <span><i className='fa fa-spin fa-spinner fa-2x'/></span>
              ) : (
                <span>{helpOnDrag}</span>
              )}
            </div>
          ) : null}
          {drag || isLoading ? null : (
            <label
              className='input-label col-xs-12'
              style={{display: !label ? 'none' : 'inline-block'}}>
              <span>{label}</span>
            </label>
          )}
          {viewInBlock && size(value) ? (
            <div className={s.preview}>
              <Image draggable={false}
                className='img-responsive'
                {...this.imgPreview} />
              <div className={s.imgPreviewBack}>
                <Button
                  className={classNames('form-control', s.imgPreviewBtn)}
                  bsStyle='default'
                  onClick={this.onClick}>
                  <span className="btn-label">
                    {buttonLoaded}
                  </span>
                </Button>
              </div>
            </div>
          ) : null}
          {drag || isLoading ? null : (
            <div className='col-xs-12'>
              {viewEnabled ? (
                <Button className={classNames(
                    'form-control', 'view-button',
                    {'disabled': !size(value)}
                  )}
                  bsStyle='default'
                  target='_blank'
                  href={viewInModal ? null : value}
                  onClick={viewInModal ? this.viewHandle : null}>
                  <i className='fa fa-eye'/>
                </Button>
              ) : null}
              {mode !== 'onlyDropzone' ? (
                <Button className={classNames(
                    'form-control',
                    {'disabled': isReadonly},
                    {'with-view-button': viewEnabled}
                  )}
                  bsStyle='default'
                  onClick={this.onClick}>
                  <span className="btn-label">
                    {size(value) ? buttonLoaded : buttonLabel}
                  </span>
                </Button>
              ) : null}
              <FormControl
                type='file'
                id={`ufileinput-${objectName}-${fieldName}`}
                accept={fileTypes.join(',')}
                multiple={false}
                className='hidden'
                onChange={this.onDrop}/>
              {help ? (
                <HelpIcon
                  id={`ufileuploader-${objectName}-${fieldName}`}
                  closeButton={true}
                  className='help-text-left'
                  placement='top'
                  helpText={help}/>
              ) : null}
              {msg || size(value) || staticHelp ? (
                <span className='help-block'>
                  {msg ? msg : (size(value) ? 'Файл загружен' : staticHelp)}
                </span>
              ) : null}
            </div>
          )}
         <ModalWindow
            show={showModal}
            onHide={this.viewHandle}
            className='modal-dialog-wide'>
              <div className={s.viewFormTitle}>
                Загруженный файл
              </div>
              <iframe
                id='frm'
                height={canUseDOM ? window.innerHeight * 0.75 : 600}
                width='100%'
                src={value}/>
              <ButtonToolbar className={s.orderToolbar}>
                <div className='pull-right'>
                  <Button
                    className={classNames(
                      'form-control',
                      'modal-button',
                    )}
                    onClick={this.viewHandle}>
                    <span className="btn-label">Закрыть</span>
                  </Button>
                </div>
              </ButtonToolbar>
            </ModalWindow>
        </div>
      </div>
    );
  }
}

UFileUploader = connect(
  (state, ownProps) => {
    const {objectName, fieldName, isNumeric} = ownProps;
    const obj = state.objects.get(objectName) ?
      state.objects.get(objectName).toJS() : {};

    return {
      isReadonly: obj._readonly && obj._readonly.indexOf(fieldName) !== -1,
      isHidden: obj._hidden && obj._hidden.indexOf(fieldName) !== -1,
      msg: obj._validationMsgs ? obj._validationMsgs[fieldName] : null,
      err: obj._validationStates ? obj._validationStates[fieldName] : null,
      value: obj[fieldName] || (isNumeric ? 0 : '')
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(UFileUploader);
UFileUploader = withCondition()(UFileUploader);

export default UFileUploader;
