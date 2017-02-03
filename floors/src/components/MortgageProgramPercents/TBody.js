/**
 * Table Row stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
import {map} from 'lodash';

import TRow from './TRow';

const TBody = ({percentsGroups}) => {
  const rows =
    map(percentsGroups, (group, key) => {
      return (<TRow
        key={key}
        groupName={key}
        percentsGroup={group} />);
    });

  return (<tbody>{rows}</tbody>);
};

TBody.propTypes = {
  percentsGroups: React.PropTypes.object
};

export default TBody;
