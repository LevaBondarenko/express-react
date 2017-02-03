/**
 * Created by tatarchuk on 30.04.15.
 */
/**
 * Banner widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */


import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import {forEach} from 'lodash';
import moment from 'moment/moment';
import Image from '../../shared/Image';

@withCondition()
class Banner extends Component {

  static propTypes = {
    fields: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      href: '',
      src: ''
    };
  }

  getTotal = (fields) => {
    let totalChance = 0;

    forEach(fields, (item) => {
      if (this.toShowBanner(item)) {
        totalChance += parseInt(item.chance);
      }
    });

    return totalChance;
  }

  toShowBanner = (banner) => {
    let toShow = false;

    if (parseInt(banner.chance) > 0) {
      const current = moment();
      const start = moment(banner.period_start ? banner.period_start : null);
      const stop = moment(banner.period_stop ? banner.period_stop : null);

      if (start.isValid() && stop.isValid()) {
        toShow = (current.isBetween(start, stop)) ? true : false;
      } else if (start.isValid()) {
        toShow = (current.isAfter(start)) ? true : false;
      } else if (stop.isValid()) {
        toShow = (current.isBefore(stop)) ? true : false;
      } else {
        toShow = true;
      }
    }

    return toShow;
  }

  getBanner = () => {
    const fields = this.props.fields;
    const totalChance = this.getTotal(fields);
    const randomChance = Math.floor(Math.random() * totalChance) + 1;
    let sumChance = 0;
    let res = {};

    forEach(fields, (item) => {
      sumChance += parseInt(item.chance);
      if (sumChance >= randomChance && this.toShowBanner(item)) {
        res = item;
        return false;
      }
    });

    return res;
  }

  componentDidMount() {
    const banner = this.getBanner();

    this.setState(() => ({
      src: banner.image,
      href: banner.href
    }));
  }

  render() {
    const {href, src} = this.state;
    const img = src ? <Image image={src} alt="" /> : null;
    const htmlRender = href ?
      <a href={href} target="_blank">{img}</a> :
      <span>{img}</span>;

    return (htmlRender);
  }
}

export default Banner;
