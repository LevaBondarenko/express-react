/**
 * BuilderPromo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import mediaHelpers from '../../utils/mediaHelpers';
import Price from '../../shared/Price';
import ContextType from '../../utils/contextType';
/* global data */
@withCondition()
class BuilderPromo extends Component {
  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    builder_info: React.PropTypes.object, // eslint-disable-line camelcase
    iconFlats: React.PropTypes.string,
    iconPrice: React.PropTypes.string,
    iconAge: React.PropTypes.string,
  }

  static defaultProps = {
    lifeTime: '5',
    position: 'top-left',
    iconFlats: 'https://cdn-media.etagi.com/static/site/d/da/dae3ad352e41e614d44fd9ca8ec7214def1ca196.png',
    iconPrice: 'https://cdn-media.etagi.com/static/site/7/76/76ce6d0852e1f69d7a3201c1ee1f3374f67d6ebb.png',
    iconAge: 'https://cdn-media.etagi.com/static/site/2/25/256edbd724d20276773ec09a717e6bfb57d88d4e.png'
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  render() {

    const thousandRegExp = /(\d)(?=(?:[0-9]{3})+\b)/gm;
    let count = this.props.builder_info.count || 0;
    let avgSqrtCost = this.props.builder_info.avg_m2_cost;
    const {age, name} = this.props.builder_info;
    let {logo} = this.props.builder_info;
    const {iconFlats, iconPrice, iconAge} = this.props;
    let output = '';

    logo = data.options.mediaSource && logo !== '' ?
        mediaHelpers.getApiMediaUrl(
          '240160',
          'builders',
          logo,
          data.options.mediaSource) : logo;

    if (logo === '') {
      output = <div className="promo-item-icon promo-name">{name}</div>;
    } else {
      output = <div className="promo-item-icon logo"><img src={logo}/></div>;
    }
    count = count.toString().replace(thousandRegExp, '$1 ');
    avgSqrtCost = avgSqrtCost.toString().replace(thousandRegExp, '$1 ');

    return (
      <div className="container-wrapper-content builderpromo">
        <div className="row">
          <div className="col-md-3 promo-item promo-table">
            {output}
            <div className="clear"></div>
          </div>
          <div className="col-md-3 promo-item">
            <div className="promo-item-icon">
              <img src={iconFlats}/>
            </div>
            <div className="promo-item-header">{count}</div>
            <div className="promo-item-text">
              Квартир в продаже в строящихся домах
            </div>
          </div>
          <div className="col-md-3 promo-item">
            <div className="promo-item-icon">
              <img src={iconPrice}/>
            </div>
            <div className="promo-item-header">
              <Price price={avgSqrtCost}/>
            </div>
            <div className="promo-item-text">
              Средняя цена за квадратный метр
            </div>
          </div>
          <div className="col-md-3 promo-item">
            <div className="promo-item-icon">
              <img src={iconAge}/>
            </div>
            <div className="promo-item-header">{age}</div>
            <div className="promo-item-text">Опыта в строительстве</div>
          </div>
        </div>
      </div>
    );
  }
}

export default BuilderPromo;
