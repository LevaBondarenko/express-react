/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import s from './FlatTitle.scss';
import Helpers from '../../utils/Helpers';
import withCondition from '../../decorators/withCondition';
import createFragment from 'react-addons-create-fragment';
import FavButton from '../../shared/FavButton';
import CompareButton from '../../shared/CompareButton';
import BidButton from '../../shared/BidButton';
import Rating from '../../shared/Rating';
import ContextType from '../../utils/contextType';
import {connect} from 'react-redux';

@withCondition()
class FlatTitle extends Component {

  static propTypes = {
    favorites: PropTypes.string,
    compare: PropTypes.string,
    auction: PropTypes.string,
    searchUrl: PropTypes.string,
    showNewcomplex: PropTypes.string,
    rating: PropTypes.string,
    mobile: PropTypes.string,
    context: PropTypes.shape(ContextType).isRequired,
    objectInfo: PropTypes.object,
    minRating: PropTypes.number
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  static defaultProps = {
    searchUrl: '',
    showNewcomplex: '0'
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  get ratingButton() {
    const {objectInfo, minRating} = this.props;

    return objectInfo.ratings ? (<div className='ratingBlockObject'>
        <Rating id={objectInfo.object_id}
          content={objectInfo.ratings}
          context={this.props.context}
          condition={minRating}
          show={parseInt(this.props.rating)} />
      </div>
    ) : null;
  }

  get favButton() {
    const {objectInfo} = this.props;

    const flat = objectInfo;
    const {favorites} = this.props;
    const favButton = parseInt(favorites) > 0 && parseInt(flat.price) > 0 ?
      createFragment({favButton: (
        <FavButton
          key={`favorite{flat.class}${flat.object_id}`}
          withTitle={true}
          className='btn-fav-infavmodule'
          oclass={flat.table === 'rent' ? 'rent' : flat.class}
          oid={flat.object_id}
        />)
      }) : createFragment({favButton: null});

    return favButton;
  }

  get compareButton() {
    const {objectInfo} = this.props;

    const flat = objectInfo;
    const {compare} = this.props;
    const compareButton = parseInt(compare) > 0 && parseInt(flat.price) > 0 ?
      createFragment({compareButton: (
        <CompareButton
          key={`review${flat.class}${flat.object_id}`}
          withTitle={true}
          className='btn-fav-infavmodule'
          oclass={flat.table === 'rent' ? 'rent' : flat.class}
          oid={flat.object_id}
        />)
      }) : createFragment({compareButton: null});

    return compareButton;
  }

  get bidButton() {
    const {objectInfo} = this.props;

    const flat = objectInfo;
    const {auction} = this.props;
    const bidButton = parseInt(auction) > 0 && parseInt(flat.price) > 0 ?
      createFragment({bidButton: (
        <BidButton
          key={`bid${flat.class}${flat.object_id}`}
          className='btn-fav-infavmodule'
          oclass={flat.table === 'rent' ? 'rent' : flat.class}
          oid={flat.object_id}
        />)
      }) : createFragment({bidButton: null});

    return bidButton;
  }

  getRatingText(overall) {
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

  render() {
    const {objectInfo, mobile, minRating} = this.props;
    const ratingDisp = parseFloat(objectInfo.rating).toFixed(2).slice(0, -1);

    const flat = objectInfo;
    const rooms = flat.rooms;
    const type = flat.type_ru;
    const actualToCenter = flat.to_center ?
      flat.to_center :
      (flat.tocenter ?
        flat.tocenter :
        '');
    const toCenter = actualToCenter ?
      ` (${Math.round(actualToCenter * 10) / 10} км от центра города)` :
      '';
    const {searchUrl, showNewcomplex} = this.props;
    const newcomplex = flat.newcomplex && parseInt(showNewcomplex) ? (
      searchUrl ?
        <a href={`${searchUrl}?newcomplex_id[]=${flat.newcomplex_id}`}>
          {`«${flat.newcomplex}»`}
        </a> :
        <span>{`«${flat.newcomplex}»`}</span>) : null;
    const name = flat.info ? flat.info.gp :
      Helpers.getTitle(rooms, type, mobile ? true : false);
    const addr = Helpers.getAdress(flat.district, flat.street, flat.house_num);

    return mobile ? (
      <div className={s.mobileTitle}>
        <div className={s.title}>{name}</div>
        {flat.rating > minRating ? (
          <div>
            <div className={s.ratingNum}>{ratingDisp}</div>
            <div className={s.ratingText}>
              <a href='#rating'>{this.getRatingText(flat.rating)}</a>
            </div>
          </div>
        ) : null}
      </div>
    ) : (
      <div className="flatTitle">
        <h1>
          <div className="flatTitle_name">
            {name}
          </div>
          <div className="flatTitle_flatInfo">
            {newcomplex ?
              <div style={{fontWeight: 'bold'}}>
                <span className="flatTitle_text" style={{padding: 0}}>
                  <span>Жилой комплекс&nbsp;</span>
                  {newcomplex}
                </span>
              </div> :
              null
            }
            <div className="flatTitle_mapIcon" />
            <span className="flatTitle_text">{addr}{toCenter}</span>
          </div>
        </h1>
        <span className="pull-right flatTitle_name_paddingRight">
          {this.ratingButton}
          {this.compareButton}
          {this.favButton}
          {this.bidButton}
        </span>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : {},
      minRating: state.settings.get('minRating') || 0
    };
  }
)(FlatTitle);
