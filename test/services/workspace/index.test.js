'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('workspace service', function() {
  it('registered the workspaces service', () => {
    assert.ok(app.service('workspaces'));
  });
});
