/**
 * TableData widget graph presentational component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './TableDataView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map, size} from 'lodash';

const TableDataGraphView = (props) => {
  const {resData} = props;
  const {
    defaultSummary,
    itemChartData,
    itemsGraphData,
    summary,
    typeGraph
  } = resData;
  const chosenData = typeGraph === 'graph' ? itemsGraphData : itemChartData;
  let graphData = null;
  let outputSummary = [];

  graphData = map(chosenData, (val, key) => { // Table data presentation
    const {
      countable,
      name,
      percent
    } = val;
    const percentStyle = percent < 0 ?
      [style.tableData__redTextPercent] :
      [style.tableData__greenTextPercent];

    return (
      <tr key={key}>
        <td>{name}</td>
        <td>{countable}</td>
        <td>
          <span className={percentStyle}>
            {`${percent}%`}
          </span>
        </td>
      </tr>
    );
  });

  outputSummary = map(summary, (val, key) => { // Summary data presentation
    const str = defaultSummary && key === size(summary) - 1 ?
      map(itemsGraphData, (graphVal, graphKey) => { // Presentation for percents by realty type at the end of the default summary
        const styles = graphVal.percent < 0 ?
          [style.tableData__redTextPercent] :
          [style.tableData__greenTextPercent];
        const slash = (graphKey === size(itemsGraphData) - 1) ? '' : ' / ';

        return (
          <span key={graphKey}>{graphVal.name}&nbsp;
            (<span className={styles}>{graphVal.percent}%</span>) {slash}
          </span>
        );
      }) :
      '';

    return (
      <p key={key}>
        <strong>{val.header}</strong>
        <br />
        <span>
          {val.comment}
        </span>
        {str}
      </p>
    );
  });

  return (
    <div className={style.tableData}>
      <table>
        <thead>
          <tr>
            <th>Тип недвижимости</th>
            <th>
              {typeGraph === 'graph' ?
                <span>Средняя цена <br/>предложения</span> :
                <span>Среднее количество <br/>объектов</span>
              }
            </th>
            <th>Изменение на, %</th>
          </tr>
        </thead>
        <tbody>
          {graphData}
        </tbody>
      </table>
      <br/>
      <div>
        {outputSummary}
      </div>
    </div>
  );

};

export default withStyles(style)(TableDataGraphView);

TableDataGraphView.propTypes = {
  resData: PropTypes.object
};
