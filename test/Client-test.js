'use strict';

const { expect } = require('chai');
const Client = require('../lib/Client');

describe('Client', () => {
  describe('constructor()', () => {
    it('should add url property using value from argument', () => {
      const expected = 'https://somewhere.com/in/time';
      const actual = new Client(expected);

      expect(actual.url).to.equal(expected);
    });
    it('should generate an id for the created object', () => {
      const actual = new Client('https://7thson.com/7thson');

      expect(actual).to.have.ownProperty('id');
    });
  });
});