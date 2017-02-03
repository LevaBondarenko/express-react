/**
 * GalleryUploader widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {size, find} from 'lodash';
import classNames from 'classnames';
import s from './GalleryUploader.scss';
import {getFromBack} from '../../utils/requestHelpers';
import GalleryUploaderSteps from './GalleryUploaderSteps';
import GalleryUploaderFile from './GalleryUploaderFile';
import GalleryUploaderForm from './GalleryUploaderForm';
import GalleryUploaderFinal from './GalleryUploaderFinal';
import WidgetsActions from '../../actions/WidgetsActions';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class GalleryUploader extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    title: PropTypes.string,
    objectName: PropTypes.string,
    galleryId: PropTypes.string,
    takeCities: PropTypes.array,
    skipCities: PropTypes.array,
    rulesLink: PropTypes.string,
    finalImage: PropTypes.string,
    finalBlock1: PropTypes.string,
    finalBlock2: PropTypes.string,
    gaEvents: PropTypes.object,
    path: PropTypes.string,
    actions: PropTypes.object,
    obj: PropTypes.object,
    cities: PropTypes.object
  };

  static defaultProps = {
    title: 'Как принять участие',
    rulesLink: null,
    gaEvents: {}
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      nextStep: 0,
      isLoading: false,
      file: null,
      desc: null,
      f: null,
      i: null,
      phone: null,
      email: null,
      city: null,
      loadedId: null,
      loadedHash: null,
      requestInProgress: false
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
    const {step, nextStep, isLoading} = this.state;
    const {obj} = props;

    if(isLoading && nextStep !== step) {
      if(obj._validationStatus) {
        if(nextStep < 2) {
          obj.step = nextStep;
          obj.isLoading = false;
        } else {
          this.submit();
        }
      } else {
        obj.nextStep = step;
        obj.isLoading = false;
      }
    }

    this.setState(() => (obj));
  }

  showError = msg => {
    WidgetsActions.set('notify',[{
      msg: size(msg) ?
        `Ошибка отправки данных: ${msg}` : 'Ошибка отправки данных',
      type: 'dang'
    }]);
  }

  nextStep = () => {
    const {step} = this.state;
    const {objectName, gaEvents} = this.props;

    size(gaEvents.gaEventNext) &&
      ga('button', `${gaEvents.gaEventNext}_shag${step + 1}`);

    this.props.actions.updateInObjectsState(
      [objectName, '_needValidate'], () => (true));
    this.setState(() => ({nextStep: step + 1, isLoading: true}));
  }

  submit = () => {
    if(this.state.requestInProgress) {
      return;
    }
    const {galleryId, cities} = this.props;
    const {file, desc, f, i, phone, email, city} = this.state;
    const cityData = find(cities, item => {
      return item.id === parseInt(city);
    });
    const cityName = `${cityData.name.split(',')[0]}, ${cityData.country_name}`;

    this.setState(() => ({
      requestInProgress: true
    }));
    getFromBack({
      action: 'gallery_action',
      subAction: 'create',
      photo: file,
      phone: phone,
      f: f,
      i: i,
      city: cityName,
      email: email,
      description: desc,
      gallery_id: galleryId, //eslint-disable-line camelcase
      rules_link: this.rulesLink, //eslint-disable-line camelcase
      gallery_link: this.galleryLink //eslint-disable-line camelcase
    }).then(response => {
      if(response.ok && response.imageId) {
        this.setState(() => ({
          isLoading: false,
          requestInProgress: false,
          step: this.state.nextStep,
          loadedId: response.imageId,
          loadedHash: response.imageHash
        }));
      } else {
        this.setState({
          isLoading: false,
          requestInProgress: false,
          nextStep: this.state.step
        }, this.showError(response.message));
      }
    }, error => {
      this.showError(error.code);
    });
  }

  get galleryLink() {
    const {path} = this.props;
    const link = (/\/([^\/]*)\/.*\/*$/g).exec(path);

    return link ? `/${link[1]}/` : null;
  }

  get rulesLink() {
    const {rulesLink} = this.props;
    const link = (/.*href=.*\"(\/.*\/).*\".*/g).exec(rulesLink);

    return link ? link[1] : null;
  }

  render() {
    const {
      step, isLoading, loadedId, loadedHash, i, city, desc, file
    } = this.state;
    const {title, gaEvents} = this.props;
    let mainBlock = null;

    switch(step) {
    case 0:
      mainBlock = <GalleryUploaderFile {...this.props}/>;
      break;
    case 1:
      mainBlock = <GalleryUploaderForm {...this.props}/>;
      break;
    case 2:
      const item = {
        user_data: { //eslint-disable-line camelcase
          i: i,
          city: city
        },
        photo: file,
        hash: loadedHash,
        description: desc
      };

      mainBlock = (
        <GalleryUploaderFinal
          {...this.props}
          loadedId={loadedId}
          item={item}
          gaEvent={gaEvents.gaEventShare}/>
      );
      break;
    default:
      //do nothing
    }

    return (
      <div className={s.root}>
        <div className={s.title}>{title}</div>
        <GalleryUploaderSteps steps={3} step={step} />
        {mainBlock}
        <div className={s.navigation}>
          {step < 2 ? (
            <button
              className={classNames(s.next, 'form-control')}
              onClick={this.nextStep}>
              {isLoading ? (
                <i className='fa fa-spin fa-spinner'/>
              ) : 'Далее'}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

}

export default connect(
  (state, ownProps) => {
    const {objectName} = ownProps;

    return {
      cities: state.collections.get('cities').toJS(),
      obj: state.objects.get(objectName) ?
        state.objects.get(objectName).toJS() : {}
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(GalleryUploader);
