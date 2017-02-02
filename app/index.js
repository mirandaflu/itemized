import React from 'react';
import { render } from 'react-dom';

if (module.hot) {
  module.hot.accept();
}

const HelloWorld = () => (
  <div>App made with Feathers, React, and Webpack</div>
);

render(<HelloWorld />, document.getElementById('app'));
