/**
 * Banks split view class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */


import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {sortBy, find} from 'lodash';
import classNames from 'classnames';

import Image from '../../shared/Image';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

/* global data */
/*eslint camelcase: [2, {properties: "never"}]*/
class Banks extends Component {
  static propTypes = {
    logoSize: PropTypes.string,
    types: PropTypes.string,
    widgetTitle: PropTypes.string,
    data: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      type: props.types || '0',
      title: props.widgetTitle,
      data: props.data || []
    };
  }

  render() {
    const {title, type} = this.state;
    let {data} = this.state;
    let {logoSize} = this.props;

    logoSize = +logoSize ? logoSize : '0';

    if (type === '0') {
      data = data.map(item => {
        item.pref = parseFloat(item.pref) || 0;
        return item;
      });
    }
    data = type === '1' ?
      sortBy(data, 'pos') :
      sortBy(data, 'pref').reverse();

    data = data.map((gridItem, key) => {
      return (type === '1' ?
        <BuilderItem {...gridItem} logoSize={logoSize} key={key}/> :
        <BankItem {...gridItem} logoSize={logoSize} key={key}/>);
    });

    const h2 = title ?
      (<Row>
        <Col xs={12}>
          <h2 className='widgetBanks--title'>{title}</h2>
        </Col>
      </Row>) : <br />;

    return (
      <div className='widgetBanks'>
        {h2}
        <Row className='widgetBanks--gridView'>
          {data}
        </Row>
      </div>
    );
  }
}


class BankItem extends Component {
  static propTypes = {
    logo: PropTypes.string,
    pref: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    logoSize: PropTypes.string,
    bank_id: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {logo, pref, logoSize, bank_id: bankId} = this.props;
    const urlId = find(data.collections.banks, {id: bankId});
    const url = `/ipoteka/${urlId.name_tr}/`;
    const imageProps = {
      image: logo,
      visual: 'banks',
      width: 320,
      height: 240
    };

    const classImg = classNames({
      'gridItem--img': true,
      'gridItem--imgBig': +logoSize
    });

    return (
      <Col xs={4} className='widgetBanks--gridView__item gridItem'>
        <div className={classImg}>
          <a href={url} target='_blank'>
            <Image {...imageProps}/>
          </a>
        </div>
        {(pref ?
          <div className='gridItem--description'>
            <span>- {pref}%</span>
          </div> :
          null)}
      </Col>
    );
  }
}

class BuilderItem extends Component {
  static propTypes = {
    logo: PropTypes.string,
    pref: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    logoSize: PropTypes.string,
    href: PropTypes.string,
    id: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {logo, pref, logoSize, href} = this.props;
    const url = href ?  href : `/zastr/builder/?id=${this.props.id}`;
    const imageProps = {
      image: logo,
      visual: 'builders',
      width: 320,
      height: 240
    };

    const classImg = classNames({
      'gridItem--img': true,
      'gridItem--imgBig': +logoSize
    });

    return (
      <Col xs={4} className='widgetBanks--gridView__item gridItem'>
        <div className={classImg}>
          <a href={url} target='_blank'>
            <Image {...imageProps}/>
          </a>
        </div>
        {(pref ? <div className='gridItem--description'>
          <span>{pref}</span>
        </div> : null)}

      </Col>
    );
  }
}

export default Banks;
