import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageQuery.scss';

const MortgageQuery = ({query, linear}) => {

  return (
    <div>
      {query ? linear === 'linear' ? (
           <Col xs={3} className={s.mortgageQueryWrapper, s.queryBlockLinear}
             style={{padding: '0.5rem 0 0.5rem 2rem'}}>
             <p>
               Номер поискового запроса:</p>
               <p>
                 <span className={s.queryTextLinear}
                   style={{border: 'none'}}>
                   {query}
                 </span>
                 <span className={s.queryItalic}>
                   (назвать помощнику)
                 </span>
             </p>
           </Col>
          ) : (
            <Row className={s.mortgageQueryWrapper}>
              <Col xs={5} className={s.queryText}>
                <p>
                  Номер поискового запроса:<br/>
                  <span className={s.query}>{query}</span>
                </p>
              </Col>
              <Col xs={7}>
                <p>Назовите его Вашему помощнику во время звонка</p>
              </Col>
            </Row>
        ) : false}
      </div>
  );
};

MortgageQuery.propTypes = {
  query: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
  ]),
  linear: PropTypes.string
};

export default withStyles(s)(MortgageQuery);
