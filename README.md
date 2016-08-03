# Simple LocalStorage API


_Better API to for storage data in localStorage_

_Support for an expire date_

_Support for data collection_

## Installation

```
npm install --save simple_localstorage_api
```


## API

```js
import { Store } from 'simple_localstorage_api';
const store = new Store();

store.set('key', {data,...})
```

###Insert a record by key
```js
const store = new Store()
store.insert('mykey', {id:1,name:'test'});
```

###Insert a record with an expire date
```js
const store = new Store()

store.insert('mykey', {id:1, name:'test', expireAfter: 2}) // Exipre in 2 Miniutes 

store.insert('mykey', {id:1,name:'test', expireAfter: '2.minutes'}); // Expire in 2 miniutes
store.insert('mykey', {id:1,name:'test', expireAfter: '2.hours'}); // Expire in 2 hours
/*
supported key base on moment.js = 
years
quarters
months
weeks
days
hours
minutes
seconds	
milliseconds
*/

```


###Find a record by key
```js
store.find('mykey') ;
//return json object
```

###Insert a collection by key
```js
const store = new Store();
store.set('mycollection', {items: [{id:1}, {id:2}], expireAfter: 5});
```

###Add item into a collection
```js
const store = new Store();
store.addItem('mycollection', {id: 3});
```

###Find item from a collection
```js
const store = new Store();
store.findItem('mycollection', item => item.id === 1);
```

###Update item into a collection
```js
const store = new Store();
store.updateItem('mycollection', {name: 'test'}, item => item.id === 1);
```

###Remove item form a collection
```js
const store = new Store();
store.removeItem('mycollection', item => item.id === 1);
```


###Remove a record by key
```js
store.clear('mykey');
```

###Remove all the records from store
```js
store.clear();
```


## License

MIT, see `LICENSE.md` for more information.