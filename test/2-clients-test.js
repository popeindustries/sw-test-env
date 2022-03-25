import Client from '../src/api/Client.js';
import Clients from '../src/api/Clients.js';
import { expect } from 'chai';

describe('clients', () => {
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

  describe('Clients', () => {
    /** @type { Clients } */
    let clients;

    beforeEach(() => {
      clients = new Clients();
    });

    describe('openWindow()', () => {
      it('should return a Promise that resolves to a Client object', () => {
        const actual = clients.openWindow('whatever');

        expect(actual).to.be.a('promise');
        return actual.then((client) => {
          expect(client).to.be.an.instanceof(Client);
        });
      });
      describe('returned Client', () => {
        it('should be created with url from openWindow argument', () => {
          const expected = 'https://whatever.com:8000/lol';

          return clients.openWindow(expected).then((client) => {
            expect(client.url).to.equal(expected);
          });
        });
      });
    });

    describe('get()', () => {
      it('should return a Promise resolving to the Client with the given id', () => {
        return clients.openWindow('https://xfactor.com/').then((expected) => {
          return clients.get(expected.id).then((actual) => {
            expect(actual).to.equal(expected);
          });
        });
      });

      it('should return a Promise resolving to undefined if a Client with the given id cant be found', () => {
        return clients.get('lol').then((actual) => {
          expect(actual).to.be.an('undefined');
        });
      });
    });

    describe('claim()', () => {
      it('should return a Promise', () => {
        const actual = clients.claim();

        expect(actual).to.be.a('promise');
      });
    });

    describe('matchAll()', () => {
      it('should return a Promise', () => {
        const actual = clients.matchAll();

        expect(actual).to.be.a('promise');
      });
      it('Promise should resolve to an array containing the clients controlled by the current service worker', () => {
        return clients.openWindow('https://powerslave.com').then((expected) => {
          return clients.matchAll().then((clients) => {
            expect(clients).to.be.an('array');
            expect(clients).to.include(expected);
          });
        });
      });
      it('should care about the options parameter');
    });
  });
});
