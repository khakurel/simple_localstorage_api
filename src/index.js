/**
 * Allow to store data in memory or Local Storage
 *
 */

import _ from 'lodash';
import moment from 'moment';

export class MemoryStore {

    constructor() {
        this._data = {};
        this.type ='MemoryStore';

    }

    setItem(key, value) {
        this._data[key] = value;
    }

    getItem(key) {
        return this._data[key];
    }

    removeItem(key) {
        this._data[key] = null;
        delete this._data[key];
    }

    clear() {
        this._data = {};
    }


}


export class Store {
    constructor(options = {}) {

        const stores = {
            session: window.sessionStorage,
            local: window.localStorage,
            memory: new MemoryStore()
        }, type = (options.type || 'local');

        this.storage = stores[type];

    }


    /**
     * reset storage
     */
    reset() {
        this.storage.clear();
    }

    /**
     * return data base on key
     */
    find(key, defaultValue) {
        let data = this.read(key);
        if (_.isEmpty(data) && defaultValue) {
            return defaultValue;
        } else {
            return data;
        }
    }

    insert(key, data, expireAfter) {
        return this.write(key, data, expireAfter);
    }

    /**
     * set data
     * @param options
     * @return {data}
     */
    set(options) {
        const expireAfter = options.expire_after;
        delete options.expire_after;
        return this.write(options.key, options, expireAfter);
    }

    /**
     * find the store data with key
     * @param key
     * @return Object
     */
    read(key) {
        const object = this.toJSON(this.storage.getItem(key));

        if (object._expires_at) { //check if data has expire_at

            let expiresAt = object._expires_at;
            if (_.isString(expiresAt)) {
                expiresAt = new Date(expiresAt);
            }

            if (new Date() <= expiresAt) { // check if date  is less then  or equal to now then return data
                return object;
            } else { // else nullify the key and delete the reference
                this.clear(key);
                return {};
            }
        }
        return object;
    }

    /**
     *  store with data with key
     * @param key
     * @param {string} [expireAfter] expire in minutes
     * @return data
     * @param object
     */
    write(key, object, expireAfter) {
        object = _.isObject(object) ? object : {data: object}; // check if data is an object otherwise create data set as object
        if (expireAfter) { // if the  options has expire_after create the date object and assigns to object
            this.setExpire(object, expireAfter);
        }
        console.log('dd',  this.storage)
        this.storage.setItem(key, JSON.stringify(object));

        return object;

    }

    /**
     * set Expire date to an object
     * @param object
     * @param expireAfter
     */
    setExpire(object, expireAfter) {
        if (_.isNumber(expireAfter)) {
            object._expires_at = moment().add(expireAfter, 'minutes').toDate();
        } else {
            let expire = expireAfter.split('.');
            object._expires_at = moment().add(parseInt(expire[0]), expire[1]).toDate();
        }
    }

    /**
     * remove store item by key
     * @param key
     */
    clear(key) {
        this.storage.removeItem(key);
    }

    /**
     * add item to a colleciton of items
     * @param key
     * @param data
     * @returns {{}|*}
     */
    addItem(key, data) {
        const object = this.read(key);
        object.items = (object.items || []);
        object.items.push(data);
        this.insert(key, object);
        return object;
    }

    /**
     * Remove Item from collection
     * @param key
     * @param callback
     * @returns {{}|*}
     */
    removeItem(key, callback) {
        const object = this.read(key);
        _.remove(object.items, callback);
        this.insert(key, object);
        return object;
    }


    /**
     * Update Or Insert item to the collection
     * @param key
     * @param data
     * @param callback
     * @returns {{}}
     */
    updateItem(key, data, callback) {
        const object = this.read(key),
            item = _.find(object.items, callback);
        let update = {};

        if (item) {
            update = _.merge(item, data)
        }
        this.insert(key, object);
        return update;
    }

    /**
     * Find item from keys
     * @param key
     * @param callback
     */
    findItem(key, callback) {
        const object = this.read(key);
        return _.find(object.items, callback);
    }

    /**
     *  return data form the object
     * @param key
     * @return json data
     */
    get(key) {
        return this.find(key).data;

    }

    /**
     * get list
     * @returns  (Storage)
     */

    list() {
        return  this.storage
    }


    toJSON(data = '{}') {
        data = data || '{}';
        return JSON.parse(data);
    }
}




