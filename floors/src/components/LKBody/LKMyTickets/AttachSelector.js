/**
 * LK Attach Selector component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {loadImage, uploadToPics} from '../../../utils/requestHelpers';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../../actions/WidgetsActions';

class AttachSelector extends Component {
  static propTypes = {
    onLoad: PropTypes.func,
    className: PropTypes.string,
    label: PropTypes.string,
    labelWhenLoaded: PropTypes.string,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      title: props.label ? props.label : 'Загрузить файл'
    };
  }

  onLoad = e => {
    const files = e.dataTransfer ?
      e.dataTransfer.files : e.target.files;

    if(files[0].type !== 'image/png' &&
      files[0].type !== 'image/jpeg' &&
      files[0].type !== 'image/gif' &&
      files[0].type !== 'application/pdf') {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка загрузки фaйла, необходимо изображение в формате jpg, gif, png, pdf.', // eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      this.setState(() => ({title: false}));
      loadImage(files[0]).then(response => {
        if(response.file.size < 5242880) {
          uploadToPics(
            response.file,
            response.result,
            'lkattach'
          ).then(response => {
            if(response.status) {
              this.setState(() => ({
                title:
                  this.props.labelWhenLoaded ?
                  this.props.labelWhenLoaded : 'Файл загружен'
              }));
              this.props.onLoad(response.fulllink, this.props.id);
              WidgetsActions.set('notify',[{
                msg: 'Файл загружен',
                type: 'info'
              }]);
            } else {
              WidgetsActions.set('notify',[{
                msg: 'Ошибка загрузки файла, если ошибка повторяется - обратитесь в службу поддержки', // eslint-disable-line max-len
                type: 'dang'
              }]);
            }
          }, (error) => {
            WidgetsActions.set('notify',[{
              msg: `Ошибка загрузки файла (${error.err}), если ошибка повторяется - обратитесь в службу поддержки`, // eslint-disable-line max-len
              type: 'dang'
            }]);
          });
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка загрузки файла. Допустимый размер - до 5Мб',
            type: 'dang'
          }]);
          this.setState(() => ({
            title: this.props.label ? this.props.label : 'Загрузить файл'
          }));
        }
      }, (error) => {
        WidgetsActions.set('notify',[{
          msg: `Ошибка чтения файла: ${error.name}`,
          type: 'dang'
        }]);
      });
    }
  }

  onClick = () => {
    const {id} = this.props;
    const input = document.getElementById(id);

    input.click();
    event.preventDefault();
  }

  render() {

    return (
      <Button
        type='button'
        onClick={this.onClick}
        className={this.props.className}
      >
        <FormControl type='file' id={this.props.id}
          accept=".jpg,.jpeg,.gif,.png,.pdf"
          multiple={true}
          className='hidden'
          onChange={this.onLoad}/>
        <span>{this.state.title ? this.state.title : (
          <i className='fa fa-spinner fa-pulse'/>
        )}
        </span>
      </Button>
    );
  }
}

export default AttachSelector;
