import PriceUnit from './PriceUnit';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import React from 'react';
import configureStore from '../core/configureStore';
import initReducer from '../reducers/utils/initReducer';
import {Provider} from 'react-redux';

describe('PriceUnit component test suite', () => {
  let component;

  beforeEach(() => {
    const store = configureStore({
      intl: initReducer({
        currency: {
          currencyDefault: {
            'char_code': 'RUB',
            id: 36,
            name: 'Российский рубль',
            nominal: 1,
            'num_code': 643,
            symbol: 'руб.',
            value: 1
          },
          currencyList: [{}, {}],
          current: {
            'char_code': 'RUB',
            id: 36,
            name: 'Российский рубль',
            nominal: 1,
            'num_code': 643,
            symbol: 'руб.',
            value: 1
          },
        }
      })
    });

    component = shallow(
      <Provider store={store}>
        <div>
          <PriceUnit store={store}/>
        </div>
      </Provider>
    );
  });

  it('should be render components without errors', () => {
    expect(component).to.not.be.undefined;
  });
});
