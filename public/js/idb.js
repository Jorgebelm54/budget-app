let db;

//make connection 
const request = indexedDB.open('budget-app', 1);

request.onupgradeneeded = event => {
  const db = event.target.result;

  // create object store called "budgetjorge"
  db.createObjectStore('new_budget_item', { autoIncrement: true });
};

// runs
request.onsuccess = event => {
  db = event.target.result;
  //check to see if app is online 
  if (navigator.onLine) {
    checkTransaction();
  }
};

//something went wrong
request.onerror = event => console.log(event.target.errorCode);

//check transaction 
function checkTransaction() {
  const transaction = db.transaction(['new_budget_item'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_budget_item');
  const getAll = budgetObjectStore.getAll();

  //.getall is good and running
  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
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
          // apply one more trans
          const transaction = db.transaction(['new_budget_item'], 'readwrite');
          
          const budgetObjectStore = transaction.objectStore('new_budget_item');
          // delete all things in store
          budgetObjectStore.clear();
          alert('All offline transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

//save record
function saveRecord(record) {
  const transaction = db.transaction(['new_budget_item'], 'readwrite');
  // access the new_budget_item object store
  const budgetObjectStore = transaction.objectStore('new_budget_item');
  //add record
  budgetObjectStore.add(record)
}

//event listener for app to come back online
window.addEventListener('online', checkTransaction);