import React, {Component, PropTypes} from 'react';
import {getFromBack} from '../../utils/requestHelpers';
import {map} from 'lodash';
import s from './RejectedObjects.scss';
import Button from 'react-bootstrap/lib/Button';

class RejectedObjects extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      counts: {},
      classes: {},
      objects: {},
      toShow: 'counts',
      input: ''
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    this.getRejectedCounts();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  handleChange = (event) => {
    let value = event.target.value;

    value = value.toString().replace(/[^0-9]/g, '');
    this.setState(() => ({
      input: value
    }));
  }

  handleFind = () => {
    this.getRejectedObject();
  };

  render() {
    const {toShow, counts, objects} = this.state;
    const header = (
      <table className={s.rejectedObjects__input}>
        <tbody>
        <tr>
          <td>Код объекта</td>
          <td>
            <input
              type='text'
              required='on'
              onChange={this.handleChange}
              value={this.state.input}>
            </input>
          </td>
          <td>
            <Button
              onClick={this.handleFind}
              href="javascript:void(0)">
              Найти
            </Button>
          </td>
        </tr>
        </tbody>
      </table>
    );
    let res;

    if (this.state.loading) {
      return (
        <div className="loader-inner ball-clip-rotate">
          <div />
        </div>
      );
    }

    switch (toShow) {
    case 'counts':
      res = this.renderRejectedCounts(counts);
      break;
    case 'objects':
      res = this.renderRejectedObjects(objects);
      break;
    default:
    }
    return <div>{header}{res}</div>;
  }

  renderRejectedCounts(items) {
    const counts = map(items, (item, key) => {

      const {count} = item;
      const {classes} = this.state;
      let className = item['class'];

      className = classes[className] ? classes[className] : className;

      return (
        <tr key={key}>
          <td>{className}</td>
          <td>{count}</td>
        </tr>
      );
    });

    return (
      <div className={s.rejectedObjects__wrapper}>
        <div className={s.rejectedObjects__title}>
          Отклонённых объектов во время последнего обновления базы:
        </div>
        <table className={s.rejectedObjects__counts}>
          <tbody>{counts}</tbody>
        </table>
      </div>
    );
  }

  renderRejectedObjects(items) {

    if (items.length === 0) {
      return (
        <div className={s.rejectedObjects__notfound}>
          Объект не найден среди отклонённых
        </div>
      );
    }

    const objects = map(items, (item, key) => {

      const {
        'object_id': objectID,
        reason
      } = item;
      const {classes} = this.state;
      let className = item['class'];

      className = classes[className] ? classes[className] : className;

      return (
        <tr key={key}>
          <td>{className}</td>
          <td>{objectID}</td>
          <td>{reason}</td>
        </tr>
      );
    });

    return (
      <table className={s.rejectedObjects__objects}>
        <tbody>
        <tr>
          <th>
            Класс
          </th>
          <th>
            ID
          </th>
          <th>
            Причина отклонения
          </th>
        </tr>
        {objects}
        </tbody>
      </table>
    );
  }

  getRejectedCounts() {

    if (!this.state.loading) {
      this.setState(() => ({
        loading: true
      }));
    }

    getFromBack({
      action: 'get_rejected_counts'
    }).then(response => {

      this.setState(() => ({
        counts: response.counts,
        classes: response.classes,
        loading: false,
        toShow: 'counts'
      }));

    });
  }

  getRejectedObject() {

    if (!this.state.loading) {
      this.setState(() => ({
        loading: true
      }));
    }

    getFromBack({
      action: 'get_rejected_object',
      'object_id': this.state.input
    }).then(response => {

      this.setState(() => ({
        objects: response,
        loading: false,
        toShow: 'objects'
      }));

    });
  }

}

export default RejectedObjects;
