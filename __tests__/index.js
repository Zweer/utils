import * as utils from '../src';

describe('Utils', () => {
  it('should export all necessary utils', () => {
    expect(utils).toBeDefined();

    expect(utils.log).toBeDefined();
  });
});
