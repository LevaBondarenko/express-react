import React, {Component, PropTypes} from 'react';
import styles from './JobList.scss';
import {isEqual} from 'lodash';

class Vacancy extends Component {

  static propTypes = {
    job: PropTypes.object,
    currentVacancy: PropTypes.object,
    changeVacancy: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.removeCss = styles._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {

    const {name, department} = this.props.job;
    const isCurrent = isEqual(this.props.job, this.props.currentVacancy);
    const className = !isCurrent ? styles.jobItem : styles.jobItemActive;
    const vacancyHref = `/job/${this.props.job.name_tr}/`;

    return (
      <div className={className}
           onClick={this.props.changeVacancy.bind(this, this.props.job)}>
        <a href={vacancyHref} className={styles.jobName}>
          {name}
        </a>
        <div className={styles.jobDep}>
          {department}
        </div>
      </div>
    );
  }
}

export default Vacancy;