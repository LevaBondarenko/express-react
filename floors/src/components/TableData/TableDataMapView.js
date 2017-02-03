/**
 * TableData widget map presentational component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './TableDataView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map} from 'lodash';

const TableDataMapView = (props) => {
  const {resData} = props;
  const {districtsData, summary} = resData;
  let outputSummary = [];
  let mapData = null;

  mapData = map(districtsData, (val, key) => { // Table data presentation
    const distNameStr = val.district;

    const st1 = val.active ?
      <strong>{distNameStr}</strong> :
      <span>{distNameStr}</span>;

    const htmlMap = distNameStr !== '' ?
      (<tr key={key}>
        <td>{st1}</td>
        <td>{val.price}</td>
        <td>{val.count}</td>
      </tr>) :
      null;

    return htmlMap;
  });

  outputSummary = map(summary, (val, key) => { // Summary data presentation
    return (
      <p key={key}>
        <strong>{val.header}</strong>
        <br />
        <span>{val.comment}</span>
      </p>
    );
  });

  return (
    <div className={style.tableData}>
      <table>
        <thead>
          <tr>
            <th>Район</th>
            <th>Средняя цена <br />предложения</th>
            <th>
              Максимальное <br />количество объектов
              <br />за выбранный период
            </th>
          </tr>
        </thead>
        <tbody>
          {mapData}
        </tbody>
      </table>
      <br/>
      <div>
        {outputSummary}
      </div>
    </div>
  );

};

export default withStyles(style)(TableDataMapView);

TableDataMapView.propTypes = {
  resData: PropTypes.object
};
