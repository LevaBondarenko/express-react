/**
 * Created by tatarchuk on 30.04.15.
 */



import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class MarketingPluses extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {props} = this;
    const title = props.title ? {__html: props.title} : {__html: '<br />'};
    const redLink =
      {background: `url(${props.redLink}) no-repeat center top`};
    const whiteLink =
      {background: `url(${props.whiteLink}) no-repeat center top`};
    const cursor = props.href ? 'pointer' : 'default';

    return (
      <div className="l-slide-third__wrap">
        <a className="l-slide-third__item"
          href={props.href}
          style={{cursor: cursor}}>
          <div className="b-slide-third__item b-slide-third__item-1">
            <b style={ redLink }></b>
            <span dangerouslySetInnerHTML={title} />
          </div>
          <div className="b-slide-third__text b-slide-third__item-1">
            <b style={ whiteLink }></b>
            <h3 dangerouslySetInnerHTML={title} />
            <p>{props.desc}</p>
          </div>
        </a>
      </div>
    );
  }
}

MarketingPluses.defaultProps = {
  href: null
};

export default MarketingPluses;
