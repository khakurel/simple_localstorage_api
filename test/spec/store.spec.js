import chai, {expect}  from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import moment from 'moment';
import {Store, MemoryStore}  from '../../src/index';

chai.use(sinonChai);

describe('MemoryStore', () => {

    let store;

    beforeEach(() => {
        store = new MemoryStore();
    });

    describe('#constructor()', () => {
        it('should have correct properites', function () {
            expect(store._data).to.be.empty;
            expect(store.type).to.be.equal('MemoryStore')
        });
    });

    describe('#setItem()', () => {
        it('should set value to data', function () {
            store.setItem('mykey', 'test');
            expect(store._data['mykey']).to.be.equal('test');
        });
    });

    describe('#getItem()', () => {
        it('should get value from data', function () {
            store.setItem('mykey', 'test1');
            expect(store.getItem('mykey')).to.be.equal('test1');
        });
    });

    describe('#removeItem()', () => {
        it('should remove value and key from data', function () {
            store.setItem('mykey', 'test1');
            expect(store.getItem('mykey')).to.be.equal('test1');
            store.removeItem('mykey');
            expect(store._data.mykey).to.be.undefined;
            expect(Object.keys(store).indexOf('mykey')).to.be.equal(-1)
        });
    });

    describe('#clear()', () => {
        it('should empty data', function () {
            store.setItem('mykey1', 'test1');
            store.setItem('mykey2', 'test2');
            expect(store._data).to.deep.equal({mykey1: 'test1', mykey2: 'test2'});
            store.clear();
            expect(store._data).to.be.empty;

        });
    });

});


describe('Store', () => {

    describe('#constructor()', ()=> {

        it('should be local storage', () => {
            const store = new Store();
            expect(store.storage).to.equal(window.localStorage);
        });

        it('should be session storage', () => {
            const store = new Store({type: 'session'});
            expect(store.storage).to.equal(window.sessionStorage);
        });

        it('should be memory storage', () => {
            const store = new Store({type: 'memory'});
            expect(store.storage).to.be.an.instanceof(MemoryStore)
        });


    });

    describe('#reset()', ()=> {
        it('should clear storage', () => {
            const store = new Store();
            sinon.spy(store.storage, 'clear');
            store.reset();
            expect(store.storage.clear).to.have.been.calledOnce;

        });
    });

    describe('#find()', () => {
        let store;
        beforeEach(()=> {
            store = new Store();
        });

        it('should return default value', () => {
            sinon.stub(store, 'read').withArgs('mykey').returns({});
            const expected = store.find('mykey', {id: 1});
            expect(expected).to.deep.equal({id: 1});
        });

        it('should return  value', () => {
            sinon.stub(store, 'read').withArgs('mykey').returns({id: 2});
            const expected = store.find('mykey', {id: 1});
            expect(expected).to.deep.equal({id: 2});
        });

    });

    describe('#insert', () => {
        it('should called write method', () => {
            const store = new Store();
            sinon.stub(store, 'write').withArgs('mykey', {id: 1}, 2).returns({id: 1});
            const expected = store.insert('mykey', {id: 1}, 2);
            expect(expected).to.deep.equal({id: 1})
        });
    });

    describe('#set', () => {
        it('should called write method', () => {
            const store = new Store();
            sinon.stub(store, 'write')
                .withArgs('mykey', {id: 1, key: 'mykey'}, 2)
                .returns({id: 1});
            const expected = store.set({key: 'mykey', id: 1, expire_after: 2});
            expect(expected).to.deep.equal({id: 1})
        });
    });

    describe('#read', () => {


        it('should return correct value', () => {
            const store = new Store();
            store.insert('mykey', {id: 1, name: 'test'});
            const expected = store.read('mykey');
            expect(expected).to.deep.equal({id: 1, name: 'test'});
        });

        it('should return set return empty', () => {
            const store = new Store();
            const data = {'id': 1, 'name': 'test', '_expires_at': moment().subtract(2, 'minutes').toDate()};
            sinon.stub(store.storage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));
            sinon.spy(store, 'clear');
            const expected = store.read('mykey');
            expect(expected).to.be.empty;
            expect(store.clear).to.be.have.been.calledOnce;

            store.storage.getItem.restore();
            store.clear.restore();
        });

        it('should  not be empty', () => {
            const store = new Store();
            const data = {'id': 1, 'name': 'test', '_expires_at': moment().add(2, 'minutes').toDate()};
            sinon.stub(store.storage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));
            sinon.spy(store, 'clear');

            const expected = store.read('mykey');

            expect(expected).not.to.be.empty;

            expect(store.clear).not.to.be.have.been.called;

            store.storage.getItem.restore();
            store.clear.restore();
        });

        it('should get data from memory storage', () => {
            const store = new Store({type: 'memory'});

            const data = {'id': 1, 'name': 'test', '_expires_at': moment().subtract(2, 'minutes').toDate()};
            sinon.stub(store.storage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));
            sinon.spy(store, 'clear');

            const expected = store.read('mykey');
            expect(expected).to.be.empty;
            expect(store.storage.type).to.be.equal('MemoryStore');
            store.storage.getItem.restore();

        });

        it('should read data from session store', ()=> {

            const store = new Store({type: 'session'});

            const data = {'id': 1, 'name': 'test', '_expires_at': moment().add(2, 'minutes').toDate()};
            sinon.stub(window.sessionStorage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));

            const expected = store.read('mykey');
            expect(expected).not.to.be.empty;
            window.sessionStorage.getItem.restore();


        });

    });

    describe('#write', () => {
        let store;
        let data;

        beforeEach(()=> {
            store = new Store();
            data = {id: 1, name: 'test'};
        });

        it('should write value to store with key', () => {


            sinon.spy(store.storage, 'setItem');
            const expected = store.write('mykey', data);

            expect(store.storage.setItem).to.have.been.calledWith('mykey', JSON.stringify(data));
            expect(expected).to.deep.equal(data);
            store.storage.setItem.restore();

        });

        it('should set expire date', () => {


            sinon.spy(store.storage, 'setItem');
            sinon.spy(store, 'setExpire');


            const expected = store.write('mykey', data, '1.months');

            expect(store.setExpire).to.have.been.calledWith(data, '1.months');
            expect(store.storage.setItem).to.have.been.calledWith('mykey', JSON.stringify(data));
            expect(expected).to.deep.equal(data);

            store.storage.setItem.restore();
            store.setExpire.restore();
        });

        it('should set data to  memoryStorage', () => {
            store = new Store({type: 'memory'});
            sinon.spy(store.storage, 'setItem');
            const expected = store.write('mykey', data);
            expect(store.storage.setItem).to.have.been.called;
            expect(store.storage.type).to.be.equal('MemoryStore');
            expect(store.storage.getItem('mykey')).to.deep.equal(JSON.stringify(data));
            expect(expected).to.deep.equal(data);

            store.storage.setItem.restore();


        });


        it('should write value in session storage', () => {
            store = new Store({type: 'session'});
            sinon.spy(window.sessionStorage, 'setItem');
            const expected = store.write('mykey', data);

            expect(store.storage.setItem).to.have.been.calledWith('mykey', JSON.stringify(data));
            expect(expected).to.deep.equal(data);
            window.sessionStorage.setItem.restore();

        });


    });

    describe('setExpire', () => {
        let store;
        let data;

        beforeEach(()=> {
            store = new Store();
            data = {id: 1, name: 'test'};
        });

        it('should set expires at when number', function () {
            store.setExpire(data, 2);
            expect(data._expires_at.toString()).to.equal(moment().add(2, 'minutes').toDate().toString());
        });

        it('should set expires at when string', function () {
            store.setExpire(data, '2.months');
            expect(data._expires_at.toString()).to.equal(moment().add(2, 'months').toDate().toString());
        });


    });

});