/**
 * ObjectRatingM widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import ContextType from '../../utils/contextType';
import s from './ObjectRatingM.scss';
import CompactDropdown from '../../shared/CompactDropdown';
import {isObject, isEmpty, values, tail, compact} from 'lodash';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';

class ObjectRatingM extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    mode: PropTypes.string,
    showLink: PropTypes.string,
    detailedClass: PropTypes.string,
    linkClass: PropTypes.string,
    barLength: PropTypes.string,
    objectInfo: PropTypes.object,
    minRating: PropTypes.number
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  get overall() {
    const {minRating, objectInfo} = this.props;
    let overall = objectInfo.rating ?
      parseFloat(objectInfo.rating).toFixed(2).slice(0, -1) : null;

    overall = overall > 10 ? 10 : overall;

    return overall >= parseFloat(minRating) ? overall : null;
  }

  get ratingText() {
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

  get ratingValues() {
    let fields = JSON.parse(this.props.objectInfo.ratings);

    fields = isObject(fields) ? values(fields) : fields;
    if (isObject(fields) && fields.length > 6) {
      fields = [
        fields[0],
        fields[1],
        fields[5],
        fields[4],
        fields[2],
        fields[3],
        fields[6]];

    } else if (isObject(fields) && fields.length == 6) {
      fields = [
        fields[0],
        fields[4],
        fields[3],
        fields[1],
        fields[2],
        fields[5]
      ];
    } else if (isObject(fields) && fields.length == 5) {
      fields = [
        fields[0],
        fields[4],
        fields[1],
        fields[2],
        fields[3],
      ];
    } else if (isObject(fields) && fields.length == 4) {
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
    } else {
      fields = fields;
    }

    return !isEmpty(fields) ? tail(fields) : [];
  }

  get path() {
    return canUseDOM ? compact(window.location.pathname.split('/'))[0] : '';
  }

  handleRatingLinkClick = () => {
    const objectId = this.props.objectInfo.object_id;

    window.open(`/${this.path}/rating/${objectId}`,'_blank');
    event.preventDefault();
  };

  render() {
    const {context, showLink, linkClass} = this.props;

    if (!this.overall) {
      return <div></div>;
    }
    const title = (<div>
      Рейтинг: <span className={s.ratingNumber}>
        {this.overall}
      </span> {this.ratingText}
    </div>);

    return (
      <div className={s.root} id='rating'>
        <CompactDropdown
          context={context}
          className=''
          title={title}
          titleClassName={s.titleItemContainer}>
          <div className={s.popoverContent}>
            {(this.ratingValues && this.ratingValues.map((item, key) => {
              const itemRating = Math.round(item.value * 10) / 10;

              return (
                <div key={`${key}`}>
                  <span>{item.name}</span>
                  <span>
                    <ProgressBar now={itemRating * 10} />
                  </span>
                  <span>{itemRating}</span>
                </div>
              );
            }))}
          </div>
          {showLink === '1' &&
            <noindex>
              <a className={linkClass ? linkClass : s.ratingLink}
                rel='nofollow'
                onClick={this.handleRatingLinkClick}>
                  Как считается рейтинг?
              </a>
            </noindex>}
        </CompactDropdown>
      </div>
    );
  }
}

export default ObjectRatingM = connect(
  state => {
    return {
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : {},
      minRating: state.settings.get('minRating'),
    };
  }
)(ObjectRatingM);
