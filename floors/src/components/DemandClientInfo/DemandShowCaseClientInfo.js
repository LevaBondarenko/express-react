import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import CommentTemplate from '../DemandClientInfo/CommentTemplate';
import {map, take, drop, union, size, shuffle} from 'lodash';
import PriceUnit from '../../shared/PriceUnit';
import Price from '../../shared/Price';
import UAgregator from '../UAgregator/UAgregator';
import onJournalDemandClientInfo from './DemandClientInfo';
import Image from '../../shared/Image';
import withCondition from '../../decorators/withCondition';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {generateSearchUrl} from '../../utils/Helpers';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';


class DemandShowCaseClientInfo extends Component {
  static defaultProps = {
    textAgregator: []
  }
  static propTypes = {
    id: PropTypes.string,
    template: PropTypes.string,
    title: PropTypes.string,
    count: PropTypes.string,
    url: PropTypes.string,
    urlText: PropTypes.string,
    text: PropTypes.string,
    mainParam: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    gparams: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    params: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    functions: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    replacement: PropTypes.string,
    context: PropTypes.shape(ContextType).isRequired,
    demandShowCase: PropTypes.object
  };

  static defaultProps = {
    countK: 2
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = this.processProps(props);
  }

  processProps = props => {
    clearInterval(this.timer);

    return {
      object: props.demandShowCase,
      items: shuffle(props.demandShowCase.items),
      index: 0,
      number: 0,
      count: parseInt(this.props.count) + 1,
      intervalId: canUseDOM && setInterval(this.timer, 10000),
      wrapperPos: 0,
      animate: false,
      array: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.processProps(nextProps));
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  animate = () => {
    this.setState(() => ({
      animate: !this.state.animate,
      wrapperPos: this.state.wrapperPos ? 0 : -80
    }));
  }

  timer = () => {
    const {number, items} = this.state;
    let newCount = 0, itemDec;

    if (this.rieltors.length > this.props.count) {
      this.animate();
      setTimeout(() => {
        if (newCount < items.length) {
          newCount = number + 1;
          itemDec = union(drop(items, 1),
          take(items, 1));
        } else {
          newCount = number + 1;
          itemDec = take(drop(this.state.selectedMode.objects, 1), 1);
        }
        this.setState({
          number: newCount,
          items: itemDec,
          wrapperPos: 0,
          animate: false
        });
      }, 200);
    } else if(this.rieltors.length === 0) {
      this.setState({
        number: 0,
        random: Math.round(Math.random() * (items.length - 1) + 1)
      });
    }
  }

  get rieltors() {
    const {object, items} = this.state;
    const {cities} = object.collections;
    const takeItems = take(items, this.state.count);
    const rieltors = map(takeItems, item => {
      const {price_min: priceMin, price_max: priceMax,
        square_min: squareMin, square_max: squareMax} = item;
      let district = '';

      const img = item.staff.photo;
      const link = {};
      const house = onJournalDemandClientInfo(item.class,item.type, item.rooms);
      const districtsCount = size(item.districts);
      const keys = Object.keys(item.districts);

      if(districtsCount > 1 && districtsCount <= 100) {
        district = `в ${districtsCount} районах`;
      }else if(districtsCount === 1) {
        district = `в районе ${Object.values(item.districts)}`;
      }
      const model = {
        class: item.class,
        type: item.type,
        rooms: item.rooms,
        'price_max': item.price_max,
        'price_min': item.price_min,
        'district_id': keys,
        'square_max': item.square_max,
        'square_min': item.square_min,
      };
      const baseUrl = '/realty/search/?';

      link.src = generateSearchUrl(model, baseUrl);

      if (cities) {
        const city = cities.find(city => city.id === item.city_id.toString());
        const cityText = city ? `Покупатель из г. ${city.name} ищет` : null;
        const itemBlock = (
          <section className='demandclientinfo-textslider' key={item.ticket_id}>
            <div>
              <div className='img'>
                <Image image={img} rieltors={true}/>
              </div>
              <span className='grayblock'>
                <p>{cityText}</p>
                <p><a target='_blank'
                   href={link.src}>{house}</a></p>
                <p>{district}</p>
                  {priceMin ?
                    <p>от&nbsp;
                      <Price price={priceMin}>
                          &nbsp;<PriceUnit/>
                      </Price>
                    </p> : null}
                    {priceMax ? <p>до&nbsp;
                      <Price price={priceMax}>
                          &nbsp;<PriceUnit/>
                        </Price>
                      </p> : null}
                  {squareMin ? <p> от {squareMin} м<sup>2</sup></p> : null}
                  {squareMax ? <p> до {squareMax} м<sup>2</sup></p> : null}
              </span>
            </div>
          </section>);

        return itemBlock;
      }
    });

    return rieltors;
  }

  get template() {
    let template;
    const {count, title, url, urlText, text, gparams, replacement, mainParam,
       functions, params} = this.props;
    const {object, wrapperPos, animate} = this.state;

    switch (this.props.template) {
    case 'infograf':
      template = (
        <div className='demandclientinfo clearfix'>
           <h1>{title}</h1>
           <div className='demandclientinfo-textblock dci-infograf'>
             <span className='demandclientinfo-textblock-text'>
               <UAgregator
                 context={this.props.context}
                 gparams={gparams}
                 params={params}
                 mainParam={mainParam}
                 functions={functions}
                 text={text}
                 replacement={replacement}/>
             </span>
             <span className='demandclientinfo-circle'>
               <p>{object.totalCount}</p>
                <p> <b>покупателей</b></p>
             </span>
           </div>
           <div className='demandclientinfo-btnblock'>
             <a href={url}>
               <span>{urlText}</span>
               <Image image={'//cdn-media.etagi.com/static/site/4/4b/4b7f' +
                 '1affce3fd91a10d4372a304fcdce23fb7cdb.svg'}/>
             </a>
           </div>
         </div>
    );
      break;
    case 'commentary':
      template = (
        <CommentTemplate
        title={title}
        rieltors={this.rieltors}
        count={count}
        wrapperPos={wrapperPos}
        animate={animate}
        url={url}
        urlText={urlText}/>
      );
    default:
      //do nothing
    }
    return template;
  }

  render() {
    return (
      <div>
        {this.template}
      </div>
    );
  }
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {updateInObjectsState}, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    demandShowCase: state.objects.get('demandShowCase').toJS() || null,
  };
}

DemandShowCaseClientInfo =
  connect(mapStateToProps, mapDispatchToProps)(DemandShowCaseClientInfo);
DemandShowCaseClientInfo = withCondition()(DemandShowCaseClientInfo);

export default DemandShowCaseClientInfo;
