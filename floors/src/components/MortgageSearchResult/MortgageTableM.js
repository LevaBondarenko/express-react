/**
 * Mortgage Table Extended stateless functional component
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
import s from './MortgageTableMObject.scss';
/**
 * components
 */
import MortgageItemM from './MortgageItemM';
import MortgageFooter from './MortgageFooter';

const MortgageTableM = ({...props}) => {
  const {defaultCount, showMore, count, recomendedCount} = props;
  const showBtn = (defaultCount + showMore) < count - recomendedCount;

  return (
    <div className={s.root}>
      <div className={s.mortgageContent}>
        {map(props.recomendedPrograms, (program, key) => {
          return (
            <MortgageItemM
              key={key}
              getBankImage={props.getBankImage}
              linkProgram={props.linkProgram}
              linkBank={props.linkBank}
              hideBankLogo={props.hideBankLogo}
              program={program} />
          );
        })}
      </div>
      <div className={s.mortgageContent}>
        {map(props.filteredPrograms, (program, key) => {
          return (
            <MortgageItemM
              key={key}
              getBankImage={props.getBankImage}
              linkProgram={props.linkProgram}
              linkBank={props.linkBank}
              hideBankLogo={props.hideBankLogo}
              program={program} />
          );
        })}
      </div>
      <MortgageFooter
        isMobile={true}
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

MortgageTableM.propTypes = {
  filteredPrograms: React.PropTypes.array,
  recomendedPrograms: React.PropTypes.array,
  linkBank: React.PropTypes.string,
  linkProgram: React.PropTypes.string,
  count: React.PropTypes.number,
  showPrograms: React.PropTypes.func,
  addMorePrograms: React.PropTypes.func,
  turnPrograms: React.PropTypes.func,
  showBtn: React.PropTypes.bool,
  hidePrograms: React.PropTypes.number,
  howMuchToAdd: React.PropTypes.number,
  programsCount: React.PropTypes.number,
  defaultCount: React.PropTypes.number,
  showMore: React.PropTypes.number,
  recomendedCount: React.PropTypes.number,
  hideBankLogo: React.PropTypes.number
};

export default withStyles(s)(MortgageTableM);
