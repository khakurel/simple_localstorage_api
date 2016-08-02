# Simple LocalStorage API


_Better API to for storage data in localStorage_

_You can set an expire date to a record_

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
store.set('mykey', {id:1,name:'test'});
```

###Insert a record with an expire date
```js
const store = new Store()

store.set('mykey', {id:1, name:'test', expireAfter: 2}) // Exipre in 2 Miniutes 

store.set('mykey', {id:1,name:'test', expireAfter: '2.minutes'}); // Expire in 2 miniutes
store.set('mykey', {id:1,name:'test', expireAfter: '2.hours'}); // Expire in 2 hours
//supported key base on moment.js = 
years
quarters
months
weeks
days
hours
minutes
seconds	
milliseconds

```


###Find a record by key
```js
store.find('mykey') ;
//return json object
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