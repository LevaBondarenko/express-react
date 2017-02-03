/**
 * Construction stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
/**
 *  components
 */
import GeminiScrollbar from 'react-gemini-scrollbar';
import ConstructionDate from '../SuperMediaSlider/ConstructionDate';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Construction.scss';

const Construction = ({constructionHistory, date}) => {
  return (<div className={s.constructionHistory}>
      <ConstructionDate
        date={date}
        className={s.title}
      />
      <div className={s.descriptionContainer}>
        <GeminiScrollbar>
          <div className={s.description}
            dangerouslySetInnerHTML=
              {{__html: constructionHistory}} />
        </GeminiScrollbar>
      </div>
    </div>);
};

Construction.propTypes = {
  constructionHistory: React.PropTypes.string,
  date: React.PropTypes.string
};

export default withStyles(s)(Construction);
