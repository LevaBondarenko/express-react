/**
 * Rating Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {head, isEmpty, isNull, compact, tail, values, isObject} from 'lodash';
import s from './Rating.scss';
import Button from 'react-bootstrap/lib/Button';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import emptyFunction from 'fbjs/lib/emptyFunction';
import ga from '../utils/ga';

class Rating extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    content: PropTypes.string,
    condition: PropTypes.number,
    show: PropTypes.number,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    popoverContainer: PropTypes.object,
    className: PropTypes.string,
    mode: PropTypes.string,
    barLength: PropTypes.number,
    detailedClass: PropTypes.string,
    showLink: PropTypes.string,
    linkClass: PropTypes.string
  };

  static defaultProps = {
    condition: 6,
    show: 0,
    mode: '0'
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      /* global data */
      condition: data.options.minRating ?
        data.options.minRating : this.props.condition,
      barLength: props.barLength ? props.barLength : 120
    };
  }

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.removeCss = s._insertCss();

    window.addEventListener('resize', this.resizeWindow);
  }

  componentWillUnmount() {
    this.removeCss();
    window.removeEventListener('resize', this.resizeWindow);
  }

  resizeWindow = () => {
    this.forceUpdate();
  }

  get overall() {
    const {show} = this.props;
    const {condition} = this.state;
    let overall = JSON.parse(this.props.content);

    overall = isObject(overall) ? values(overall) : overall;
    overall = !isEmpty(overall) ?
    parseFloat(head(overall).value).toFixed(2) ?
      parseFloat(head(overall).value).toFixed(2).toString().slice(0,-1) :
      parseFloat(head(overall).value).toFixed(2).toString().slice(0,-1) : null;
    overall = overall > 10 ? 10 : overall;

    return show > 0 && overall >= parseFloat(condition) ? overall : null;
  }

  get ratingValues() {
    let fields = JSON.parse(this.props.content);

    fields = isObject(fields) ? values(fields) : fields;
    if(isObject(fields) && fields.length > 6) {
      fields = [
        fields[0],
        fields[1],
        fields[5],
        fields[4],
        fields[2],
        fields[3],
        fields[6]];

    }else if(isObject(fields) && fields.length == 6) {
      fields = [
        fields[0],
        fields[4],
        fields[3],
        fields[1],
        fields[2],
        fields[5]
      ];
    }else if(isObject(fields) && fields.length == 5) {
      fields = [
        fields[0],
        fields[4],
        fields[1],
        fields[2],
        fields[3],
      ];
    }else if(isObject(fields) && fields.length == 4) {
      fields[3].name === 'Местоположение' ?
      fields = [
        fields[0],
        fields[3],
        fields[1],
        fields[2]] : fields = [
          fields[0],
          fields[1],
          fields[2],
          fields[3]];
    }else {
      fields = fields;
    }
    return !isEmpty(fields) ? tail(fields) : {};
  }

  get contentText() {
    const overall = this.overall;
    let title = '';

    if (0 <= overall && overall <= 10) {
      if (overall >= 5 && overall < 6) {
        title = 'неплохо';
      } else if (overall >= 6 && overall < 7) {
        title = 'хорошо';
      } else if (overall >= 7 && overall < 8) {
        title = 'очень хорошо';
      } else if (overall >= 8 && overall < 9) {
        title = 'отлично';
      } else if (overall >= 9) {
        title = 'превосходно';
      }
    }
    return title;
  }

  get popoverPlacement() {
    return canUseDOM ?
      (window.innerWidth <= 1440 ? 'top' : 'right') : 'right';
  }

  get path() {
    return canUseDOM ? compact(window.location.pathname.split('/'))[0] : '';
  }

  handleRatingLinkClick = (event) => {
    if (data.objects && data.objects.list ?
      data.objects.list[0].class !== 'nh_flats' :
      data.object && data.object.info && !data.object.info.info) {
      ga('link', data.object && data.object.info ?
        'site_rating_object_how_does_it_calculate' :
        'site_rating_search_card_how_does_it_calculate');
    }else {
      ga('link', 'site_zastr_rating_search_card');
    }
    window.open(`/${this.path}/rating/${this.props.id}`,'_blank');
    event.preventDefault();
  };

  trackEvent = () => {
    if (data.objects && data.objects.list ?
      data.objects.list[0].class !== 'nh_flats' :
      data.object && data.object.info && !data.object.info.info) {
      ga('button', data.object && data.object.info ?
      'site_rating_object' :
      'site_rating_search_card');
    }else {
      ga('link', data.object && data.object.info ? 'site_zastr_rating_object' :
       'site_zastr_rating_search_card');
    }
  }

  trackEventHover = () => {
    if (data.objects && data.objects.list ?
      data.objects.list[0].class !== 'nh_flats' :
      data.object && data.object.info && !data.object.info.info) {
      ga('button', data.object && data.object.info ? 'site_rating_object' :
        'site_rating_search_card', 'hover');
    }else {
      ga('link', (data.object && data.object.info ? 'site_zastr_rating_object' :
       'site_zastr_rating_search_card') , 'hover');
    }
  }

  handleRatingButtonClick = (event) => {
    window.open(`/${this.path}/rating/${this.props.id}`,'_blank');
    event.preventDefault();
  };

  render() {
    const {linkClass, detailedClass} = this.props;
    const detailed = !isNull(this.overall) &&
      (<div className={`${detailedClass}`}>
        <div className={`${s.popoverHead} clearfix`}>
          <div className={s.popoverRating}>
            <div className={s.rating}>
              {this.overall}
            </div>
            <div className={s.comment}>
              {this.contentText.replace(' объекта', '')}
            </div>
          </div>
          <div className={s.popoverDescription}>
          <h3>Рейтинг квартиры</h3>
            <p>
              Рейтинг недвижимости определяет привлекательность
              предложения на основании более 60 критериев
            </p>
          </div>
        </div>
        <div className={`${s.popoverContent} clearfix`}>
          {(this.ratingValues && this.ratingValues.map((item, key) => {
            const itemRating = Math.round(item.value * 10) / 10;

            return (
              <div className='clearfix' key={`${key}`}>
                <span>{item.name}</span>
                <span style={{width: `${this.state.barLength}px`}}>
                  <ProgressBar now={itemRating * 10} />
                </span>
                <span>{itemRating}</span>
              </div>
            );
          }))}
        </div>
      </div>);

    return (!isNull(this.overall) ? <div>
      {this.props.mode === '1' ?
        detailed :
        <div>
          <div onMouseOver={this.trackEventHover}
             className={`RatingBlock ${this.props.className}`}>
            <OverlayTrigger placement={'bottom'}
                             trigger={['hover', 'focus']} rootClose
                             onClick={this.trackEvent}
                             container={this.props.popoverContainer}
                             positionLeft={50}
                             overlay={
                 <Popover id='devcontent' className="noticeFlat ratings">
                 {detailed}
                </Popover>
              }>
              <Button className={s.root} onClick={this.handleRatingButtonClick}>
                <p className={s.text}>
                  <span className={s.overallRating}>{this.overall}</span>
                  <span className={s.overallComment}>{this.contentText}</span>
                  <i className={s.icon} />
                </p>
              </Button>
            </OverlayTrigger>
          </div>
        </div>}
        {this.props.showLink === '1' &&
          <noindex>
            <a className={linkClass ? linkClass : s.ratingLink}
              rel='nofollow'
              onClick={this.handleRatingLinkClick}>
                Как считается рейтинг?
            </a>
          </noindex>}
      </div> : null
    );
  }
}

export default Rating;
