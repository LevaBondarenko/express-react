import React, {PropTypes} from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageTableExtended.scss';
import {map, indexOf, find} from 'lodash';
import MortgageItemExtended from './MortgageItemExtended';

const MortgageBodyExtended = (props) => {
  const programs = props.recomended ?
    props.recomendedPrograms : props.filteredPrograms;

  return (
    <tbody>
      {programs.length > 0 ? (
        <tr>
          <td
            colSpan={!props.hideBankLogo ? 9 : 8}
            className={props.recomended ?
            s.mortgageRecomendedTitle : s.mortgageRestTitle}>
            {props.title}
          </td>
        </tr>
      ) : false}
      {map(programs, (program, key) => {
        const checked = indexOf(
        props.checkedPrograms, program.program_id
        ) > -1 ? true : false;

        /*global data*/
        const bankTr = find(data.collections.banks,
        bank => bank.id === program.bank_id).name_tr;
        const programLink = props.linkProgram === 'oldPage' ?
        `/ipoteka-programs/${program.program_id}.html` :
        `/ipoteka/${bankTr}/${program.program_id}`;
        const bankLink = props.linkBank === 'oldPage' ?
          `/ipoteka_banks/${program.bank_id}.html` :
          `/ipoteka/${bankTr}/`;

        return (
          <MortgageItemExtended
            key={key}
            hidden={props.adding}
            bankImage={props.getBankImage(program.bank_image)}
            program={program}
            checked={checked}
            toggleCheck={props.toggleCheck}
            hideBankLogo={props.hideBankLogo}
            programLink={programLink}
            bankLink={bankLink} />
        );
      })}
    </tbody>
  );
};

MortgageBodyExtended.propTypes = {
  recomended: PropTypes.bool,
  title: PropTypes.string,
  programs: PropTypes.array,
  checkedPrograms: PropTypes.array,
  recomendedPrograms: PropTypes.array,
  filteredPrograms: PropTypes.array,
  getBankImage: PropTypes.func,
  toggleCheck: PropTypes.func,
  linkProgram: PropTypes.string,
  linkBank: PropTypes.string,
  adding: PropTypes.bool,
  hideBankLogo: React.PropTypes.number,
};

export default withStyles(s)(MortgageBodyExtended);
