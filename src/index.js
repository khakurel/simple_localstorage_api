/**
 * Allow to store data in memory or Local Storage
 *
 */

import _ from 'lodash'
import moment from 'moment'

export class Store {
    constructor(options = {}) {
        this.storage = options.useLocal !== false;
        this._data = {};
        this.localStorage = window.localStorage;
    }


    /**
     * check if using local stroage
     * @param
     * @returns {boolean|*}
     */
    hasStore() {
        return this.storage
    }

    /**
     * reset storage
     */
    reset() {
        this.localStorage.clear();
        return (this._data = {});
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
        let object = {};
        if (this.hasStore(key)) {
            object = this.toJSON(this.localStorage.getItem(key));
        } else {
            object = this._data[key] || {};
        }
        if (object._expires_at) { //check if data has expire_at

            var expiresAt = object._expires_at;
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
        if (this.hasStore(key)) {
            return this.localStorage.setItem(key, JSON.stringify(object));
        }
        this._data[key] = object;
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
            var expire = expireAfter.split('.');
            object._expires_at = moment().add(parseInt(expire[0]), expire[1]).toDate();
        }
    }

    /**
     * remove the data from cache
     */
    clear(key) {
        if (this.hasStore(key)) {
            this.localStorage.removeItem(key);
        } else {
            this._data[key] = null;
            delete this._data[key];
        }
    }

    addItem(key, data) {
        const object = this.read(key);
        object.items = (object.items || []);
        object.items.push(data);
        this.insert(key, object);
        return object;
    }

    removeItem(key, callback) {
        const object = this.read(key);
        _.remove(object.items, callback);
        this.insert(key, object);
        return object;
    }

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

    list() {
        return {memory: this._data, storage: this.localStorage}
    }

    toJSON(data = '{}') {
        data = data || '{}';
        return JSON.parse(data);
    }
}




