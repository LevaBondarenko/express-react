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
import s from './THeadM.scss';

const THeadM = ({groupName, yearsData, colSpan}) => {
  const name = groupName.split('-');
  const avanseMin = name[0];
  const avanseMax = name[1];
  const years = map(yearsData, data => {
    return (<td key={data} className={s.cell34}>
        {data}
      </td>);
  });

  return (<thead>
    <tr>
      <th colSpan={colSpan} className={s.cell34}>
        <div>Первоначальный взнос</div>
        <div>{`от ${avanseMin} до ${avanseMax} %`}</div>
      </th>
    </tr>
    <tr>
      {years}
    </tr>
  </thead>);
};

THeadM.propTypes = {
  groupName: React.PropTypes.string,
  yearsData: React.PropTypes.array,
  colSpan: React.PropTypes.number
};

export default withStyles(s)(THeadM);
