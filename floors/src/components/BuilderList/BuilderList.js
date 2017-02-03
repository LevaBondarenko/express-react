/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import {map} from 'lodash';
import withCondition from '../../decorators/withCondition';
import Image from '../../shared/Image';

@withCondition()
class BuilderList extends Component {
  static propTypes = {
    builders: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  render() {
    const builders = this.props.builders;
    const listBuilders = map(builders, (val, key) => {
      const imageProps = {
        image: val.logo,
        visual: 'builders',
        width: 320,
        height: 240
      };

      const name = val.logo ?
        <Image {...imageProps} alt={val.logo}/> :
        <strong>{val.name}</strong>;

      return (
        <div className="builderList--item" key={key}>
          <a href={val.href} target="_blank">
            {name}
          </a>
          <br/>
        </div>);
    });

    return (
      <div className="builderList">
        {listBuilders}
      </div>
    );
  }
}

export default BuilderList;
