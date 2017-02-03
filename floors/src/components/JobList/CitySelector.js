import React, {Component, PropTypes} from 'react';
import styles from './JobList.scss';
import Select from 'react-select';
import {map} from 'lodash';

class CitySelector extends Component {

  static propTypes = {
    cities: PropTypes.array,
    className: PropTypes.string,
    cityId: PropTypes.number,
    changeCity: PropTypes.func,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      cities: map(props.cities, c => {
        return {
          value: parseInt(c.id),
          label: c.name
        };
      })
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(styles);
  }

  componentDidMount() {
    this.removeCss = styles._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const {cityId, changeCity} = this.props;

    return (
      <div className={styles.citySelector} id="citiesContainer">
        <Select
          clearable={false}
          value={cityId}
          placeholder='Выберите город'
          noResultsText='Город не найден'
          options={
           this.state.cities
          }
          onChange={changeCity}
        />
      </div>
    );
  }
}

export default CitySelector;
