/**
 * FilterContent stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
import {map, includes} from 'lodash';
import CheckButton from '../../shared/CheckButton';

const FilterContent = ({collectionSeason, filterSeason, filterChanged}) => {
  return (<ul>
    {map(collectionSeason, (season) => {
      return (<li key={`Season-${season.id}`}>
          <CheckButton
            key={`Season-${season.id}`}
            itemID={`Season-${season.id}`}
            itemLabel={season.name}
            className='filterSeason'
            onValue={true}
            offValue={false}
            onChange={filterChanged}
            checked={includes(filterSeason, season.id)}
            mode='0'
          />
        </li>
      );
    })}
  </ul>);
};

FilterContent.propTypes = {
  collectionSeason: React.PropTypes.array,
  filterSeason: React.PropTypes.array,
  filterChanged: React.PropTypes.func
};

export default FilterContent;
