import chai, {expect}  from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import moment from 'moment';
import _ from 'lodash';
import {Store}  from '../../src/index';

chai.use(sinonChai);

describe('Store', () => {

    describe('#constructor()', ()=> {

        it('should store value true', () => {
            const store = new Store();
            expect(store.storage).to.be.true;
            expect(store._data).to.be.object;
            expect(store.localStorage).to.equal(window.localStorage);
        });

        it('should have store value false', () => {
            const store = new Store({useLocal: false});
            expect(store.storage).to.be.false;
        });

    });

    describe('#hasStore', ()=> {

        it('should return false', () => {
            const store = new Store({useLocal: false});
            expect(store.hasStore()).to.be.false;
        });

        it('should return true', () => {
            const store = new Store();
            expect(store.hasStore()).to.be.true;
        });
    });

    describe('#reset()', ()=> {
        it('should clear localStorage', () => {
            const store = new Store();
            sinon.spy(store.localStorage, 'clear');
            store._data = {id: 1};
            store.reset();
            expect(store.localStorage.clear).to.have.been.calledOnce;
            expect(store._data).to.be.empty;

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
        let store;
        beforeEach(()=> {
            store = new Store();
        });

        it('should return correct value', () => {
            store.insert('mykey', {id: 1, name: 'test'});
            const expected = store.read('mykey');
            expect(expected).to.deep.equal({id: 1, name: 'test'});
        });

        it('should return set return empty', () => {
            const data = {'id': 1, 'name': 'test', '_expires_at': moment().subtract(2, 'minutes').toDate()};
            sinon.stub(store.localStorage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));
            sinon.spy(store, 'clear');
            const expected = store.read('mykey');
            expect(expected).to.be.empty;
            expect(store.clear).to.be.have.been.calledOnce;

            store.localStorage.getItem.restore();
            store.clear.restore();
        });

        it('should  not be empty', () => {
            const data = {'id': 1, 'name': 'test', '_expires_at': moment().add(2, 'minutes').toDate()};
            sinon.stub(store.localStorage, 'getItem')
                .withArgs('mykey')
                .returns(JSON.stringify(data));
            sinon.spy(store, 'clear');

            const expected = store.read('mykey');

            expect(expected).not.to.be.empty;

            expect(store.clear).not.to.be.have.been.called;

            store.localStorage.getItem.restore();
            store.clear.restore();
        });

        it('should get form _data', () => {

            sinon.stub(store, 'hasStore').returns(false);
            store._data.mykey = {id: 1};
            const expected = store.read('mykey');
            expect(expected).to.deep.equal({id: 1});


        })

    });

    describe('#write', () =>{
        let store;
        let data;

        beforeEach(()=> {
            store = new Store();
            data = {id: 1, name: 'test'};
        });

        it('should write value to store with key', () => {


            sinon.spy(store.localStorage, 'setItem');
            const expected = store.write('mykey', data);

            expect(store.localStorage.setItem).to.have.been.calledWith('mykey', JSON.stringify(data));
            expect(expected).to.deep.equal(data);
            store.localStorage.setItem.restore();

        });

        it('should set expire date', () => {


            sinon.spy(store.localStorage, 'setItem');
            sinon.spy(store, 'setExpire');


            const expected = store.write('mykey', data , '1.months');

            expect(store.setExpire).to.have.been.calledWith(data, '1.months');
            expect(store.localStorage.setItem).to.have.been.calledWith('mykey', JSON.stringify(data));
            expect(expected).to.deep.equal(data);

            store.localStorage.setItem.restore();
            store.setExpire.restore();
        });

        it('should set data to _data', () => {

            sinon.stub(store, 'hasStore').returns(false);
            sinon.spy(store.localStorage, 'setItem');

            const expected = store.write('mykey', data);
            expect(store.localStorage.setItem).not.to.have.been.called;
            expect(store._data.mykey).to.deep.equal(data);
            expect(expected).to.deep.equal(data);

            store.localStorage.setItem.restore();


        })


    });

    describe('setExpire',  () => {
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