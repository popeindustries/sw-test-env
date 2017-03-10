'use strict';

const { expect } = require('chai');
const Clients = require('../lib/Clients');
const Client = require('../lib/Client');

describe('Clients', () => {
  let unit;

  beforeEach(() => {
    unit = new Clients();
  });

  describe('openWindow()', () => {
    it('should return a Promise that resolves to a Client object', () => {
      const actual = unit.openWindow('whatever');

      expect(actual).to.be.a('promise');
      return actual.then((client) => {
        expect(client).to.be.an.instanceof(Client);
      });
    });
    describe('returned Client', () => {
      it('should be created with url from openWindow argument', () => {
        const expected = 'https://whatever.com:8000/lol';

        return unit.openWindow(expected)
        .then((client) => {
          expect(client.url).to.equal(expected);
        });
      });
    });
  });

  describe('get()', () => {
    it('should return a Promise resolving to the Client with the given id', () => {
      return unit.openWindow('https://xfactor.com/')
      .then((expected) => {
        return unit.get(expected.id)
        .then((actual) => {
          expect(actual).to.equal(expected);
        });
      });
    });

    it('should return a Promise resolving to undefined if a Client with the given id cant be found', () => {
      return unit.get('lol')
      .then((actual) => {
        expect(actual).to.be.an('undefined');
      });
    });
  });

  describe('claim()', () => {
    it('should return a Promise', () => {
      const actual = unit.claim();

      expect(actual).to.be.a('promise');
    });
  });

  describe('matchAll()', () => {
    it('should return a Promise', () => {
      const actual = unit.matchAll();

      expect(actual).to.be.a('promise');
    });
    it('Promise should resolve to an array containing the clients controlled by the current service worker', () => {
      return unit.openWindow('https://powerslave.com')
      .then((expected) => {
        return unit.matchAll()
        .then((clients) => {
          expect(clients).to.be.an('array');
          expect(clients).to.include(expected);
        });
      });
    });
    it('should care about the options parameter');
  });
});