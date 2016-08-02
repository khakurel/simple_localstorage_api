const chai = require('chai');
const expect = chai.expect;

const {Store} = require('../../src/index');

describe('Store', () => {

    describe('#constructor()', ()=>{

        it('should store value true', () => {
            const store = new Store();
            expect(store.storage).to.be.true;
            expect(store._data).to.be.object;
            expect(store.localStorage).to.equal(window.localStorage);
        });

        it('should have store value false', () => {
            const store = new Store({useLocal: false});
            expect(store.storage).to.be.false
        })

    });

    describe('#hasStore', ()=>{

        it('should return false',  () =>{
            const store = new Store({useLocal: false});
            expect(store.hasStore()).to.be.false
        });

        it('should return true',  () =>{
            const store = new Store();
            expect(store.hasStore()).to.be.true
        });
    });



});