'use strict';

const fakeIndexedDB = require('fake-indexeddb/build/fakeIndexedDB');
const FDBCursor = require('fake-indexeddb/build/FDBCursor');
const FDBCursorWithValue = require('fake-indexeddb/build/FDBCursorWithValue');
const FDBDatabase = require('fake-indexeddb/build/FDBDatabase');
const FDBFactory = require('fake-indexeddb/build/FDBFactory');
const FDBIndex = require('fake-indexeddb/build/FDBIndex');
const FDBKeyRange = require('fake-indexeddb/build/FDBKeyRange');
const FDBObjectStore = require('fake-indexeddb/build/FDBObjectStore');
const FDBOpenDBRequest = require('fake-indexeddb/build/FDBOpenDBRequest');
const FDBRequest = require('fake-indexeddb/build/FDBRequest');
const FDBTransaction = require('fake-indexeddb/build/FDBTransaction');
const FDBVersionChangeEvent = require('fake-indexeddb/build/FDBVersionChangeEvent');

module.exports = {
  indexedDB: fakeIndexedDB.default,
  IDBCursor: FDBCursor.default,
  IDBCursorWithValue: FDBCursorWithValue.default,
  IDBDatabase: FDBDatabase.default,
  IDBFactory: FDBFactory.default,
  IDBIndex: FDBIndex.default,
  IDBKeyRange: FDBKeyRange.default,
  IDBObjectStore: FDBObjectStore.default,
  IDBOpenDBRequest: FDBOpenDBRequest.default,
  IDBRequest: FDBRequest.default,
  IDBTransaction: FDBTransaction.default,
  IDBVersionChangeEvent: FDBVersionChangeEvent.default
};
