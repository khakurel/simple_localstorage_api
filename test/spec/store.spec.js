const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

const {Store} = require('../../src/index');

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
        })

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
            store.localStorage = chai.spy.object(['clear']);
            store._data = {id: 1};
            store.reset();
            expect(store.localStorage.clear).to.have.been.called.once();
            expect(store._data).to.be.empty;

        });
    });

    describe('#find()', () =>{
        let store;
        beforeEach(()=>{
           store = new Store();
        })

    })

});