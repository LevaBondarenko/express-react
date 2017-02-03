/**
 * Created by tatarchuk on 20.08.15.
 */


import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';

class SocialNetwork extends Component {
  static propTypes = {
    fields: PropTypes.object,
    notice: PropTypes.string
  };
  constructor(props) {
    super(props);
  }

  render() {
    const {fields, notice} = this.props;
    const data  = map(fields, (href, id) => {
      let classSN;
      const show = this.props[id] ? 1 : 0;

      switch (id) {
      case 'vkontakte' :
        classSN = 'ico-vk';
        break;
      case 'facebook' :
        classSN = 'ico-fb';
        break;
      case 'twitter' :
        classSN = 'ico-tw';
        break;
      case 'instagram' :
        classSN = 'ico-ig';
        break;
      case 'odnoklassniki' :
        classSN = 'ico-ok';
        break;
      case 'googleplus' :
        classSN = 'ico-gp';
        break;
      case 'youtube' :
        classSN = 'ico-yt';
        break;
      default:
        //do nothing
      }

      return href && show ? (
        <a key={id}
           href={href}
           target="_blank"
           className={`${classSN} ico-bg`}></a>
      ) : null;
    });

    return (
      <div className="socNetwork">
        <span>{data.join().replace(/,/g,'').length ? notice : ''}</span>
        <span className="ico">{data}</span>
      </div>
    );
  }
}

export default SocialNetwork;
