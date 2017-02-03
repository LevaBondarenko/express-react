/**
 * Created by tatarchuk on 20.08.15.
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import withCondition from '../../decorators/withCondition';
import {find} from 'lodash';
import {parseUrlObject} from '../../utils/Helpers';

@withCondition()
class ThankYou extends Component {
  static defaultProps = {
    standart: ''
  }
  static propTypes = {
    fields: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    text: React.PropTypes.string,
    dataUrl: React.PropTypes.array,
    standart: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    const template = [];

    for (let i = 1; i < 6; i++) {
      if (props[`from_${i}`]) {
        template.push({
          param: props[`from_${i}`],
          html: props[`textTitle_${i}`]
        });
      }
    }

    const search = props.dataUrl;
    let keys = '';

    search.forEach((item) => {
      if (item.from) {
        keys = item.from;
      }
    });

    this.state = {
      template: template.length ? template : null,
      get: keys,
      fields: JSON.parse(this.props.fields)
    };
  }

  onClick() {
    history.go(-1);
  }

  render() {
    const template = find(this.state.template, {param: this.state.get});
    const {standart} = this.props;
    const {fields} = this.state;
    const time =  fields.data['0'] ? fields.data['0'].value : null;
    const text = {__html: `Заявки обрабатываются ${time}`};
    const standartText = standart !== '' ? {__html: standart} :
    {__html: `<div class="redLine">
      <h2>
        <strong>Спасибо <br/> за заявку</strong>
      </h2>
      <p>Наш специалист свяжется с Вами в ближайшее время!</p>
    </div>`};

    const textTemplate = template ?
      {__html: template.html} : {__html: '<br />'};
    const textTitle = template ? (
      <div dangerouslySetInnerHTML={textTemplate} />
    ) : (fields.data['0'] ?
      (<div className="redLine">
        <h2>
          <strong>Спасибо</strong><br />
          за заявку!
        </h2>
        <p>Наш специалист свяжется с Вами в ближайшее время!
          <span dangerouslySetInnerHTML={text} /></p>
      </div>) : (
        <div>
        <span dangerouslySetInnerHTML={standartText} />
        </div>
      ));

    const urlObj = parseUrlObject();

    return (
      <div className="thankYouBg">
        <div className="container-wide">
          {textTitle}
          <br />
          <a href="#" onClick={this.onClick} className="thankYouBtn">
            Продолжить просмотр
          </a>
          {urlObj.from !== 'job' && urlObj.from !== 'hr' &&
           urlObj.from !== 'resume' ? (
          <h3>Наши преимущества <img src="https://cdn-media.etagi.com/static/site/8/8e/8e4e03c535546e21565303a09c519b3ce7e85f66.png" /></h3>
          ) : null}
          <img className="faceEtagi" src="https://cdn-media.etagi.com/static/site/a/a6/a66b5b196164d595fa29a860f9e679a06860b5a5.png" />
        </div>
      </div>
    );
  }
}

export default ThankYou;
