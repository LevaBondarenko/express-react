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
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TRowM.scss';

const TRowM = ({groupName, percentsGroup}) => {
  const name = groupName.split('-');
  const avanseMin = name[0];
  const avanseMax = name[1];
  const columns =
    map(percentsGroup, (data, key) => {
      const itemKey = `${avanseMin}-${avanseMax}-${key}`;

      if (data) {
        const redPercent = data.pref > 0 &&
          `с нами ${data.percent - data.pref} %`;
        const percent = redPercent ?
          `без нас ${data.percent} %` : `${data.percent} %`;

        return (<td key={itemKey}>
          <div>{percent}</div>
          {redPercent &&
            <div className={s.redPercent}>
              {redPercent}
            </div>}
        </td>);
      } else {
        return (<td key={itemKey}>
          <div>—</div>
        </td>);
      }
    });

  return (<tr className={s.row}>
      {columns}
    </tr>
  );
};

TRowM.propTypes = {
  percentsGroup: React.PropTypes.array,
  groupName: React.PropTypes.string
};

export default withStyles(s)(TRowM);
