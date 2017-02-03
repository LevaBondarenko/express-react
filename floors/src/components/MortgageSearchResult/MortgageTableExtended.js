/**
 * Mortgage Table Extended stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageTableExtended.scss';
/**
 * components
 */

import MortgageHeaderExtended from './MortgageHeaderExtended';
import MortgageFooter from './MortgageFooter';
import MortgageBodyExtended from './MortgageBodyExtended';

const MortgageTableExtended = ({checkedPrograms, getBankImage, ...props}) => {
  const {defaultCount, showMore, count, recomendedCount} = props;
  const showBtn = (defaultCount + showMore) < count - recomendedCount;

  return (
    <div>
      <table className={s.mortgageContent}>
        <MortgageHeaderExtended
          context={props.context}
          linkBank={props.linkBank}
          hideBanksFilter={props.hideBanksFilter}
          hideBankLogo={props.hideBankLogo}
        />
        <MortgageBodyExtended
          checkedPrograms={checkedPrograms}
          getBankImage={getBankImage}
          title='Ипотечные программы: рекомендуемые'
          recomended={true}
          {...props} />
        <MortgageBodyExtended
          checkedPrograms={checkedPrograms}
          getBankImage={getBankImage}
          title='Ипотечные программы: остальные'
          recomended={false}
          {...props} />
      </table>
      <MortgageFooter
        showBtn={showBtn}
        howMuchToAdd={props.howMuchToAdd}
        addMorePrograms={props.addMorePrograms}
        showMore={defaultCount + showMore}
        turnPrograms={props.turnPrograms}
        defaultCount={defaultCount}
        programsCount={count}
        recomendedCount={recomendedCount}
        hidePrograms={props.hidePrograms} />
    </div>
  );
};

MortgageTableExtended.propTypes = {
  defaultCount: PropTypes.number,
  howMuchToAdd: PropTypes.number,
  linkBank: PropTypes.string,
  showMore: PropTypes.number,
  count: PropTypes.number,
  hidePrograms: PropTypes.number,
  checkedPrograms: PropTypes.array,
  getBankImage: PropTypes.func,
  addMorePrograms: PropTypes.func,
  turnPrograms: PropTypes.func,
  hideBanksFilter: PropTypes.number,
  hideBankLogo: PropTypes.number,
  recomendedCount: PropTypes.number,
  context: PropTypes.shape({
    insertCss: PropTypes.func,
  })
};


export default withStyles(s)(MortgageTableExtended);
