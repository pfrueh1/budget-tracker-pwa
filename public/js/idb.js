
let db;

const request = indexedDB.open('budget', 2);


request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store 
    if(!db.objectStoreNames.contains('new_transaction')){
        db.createObjectStore('new_transaction', { autoIncrement: true });
    }
    
};


request.onsuccess = function(event) {

    db = event.target.result;
  
    if (navigator.onLine) {
       uploadBudget();
    }
};
  
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
}

function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access your object store
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();
  
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
          fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
              const transaction = db.transaction(['new_transaction'], 'readwrite');
              const transactionObjectStore = transaction.objectStore('new_transaction');
              transactionObjectStore.clear();
    
              alert('All saved transactions have been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
    };
}

window.addEventListener('online', uploadBudget);