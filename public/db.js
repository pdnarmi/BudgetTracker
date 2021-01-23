const pendingObjectStoreName = 'pending';

const request = indexedDB.open('budget', 2);

request.onupgradeneeded = event => {
    const db = request.result;

    if (!db.objectStoreNames.contains(pendingObjectStoreName)) {
        db.createObjectStore(pendingObjectStoreName, {autoIncrement: true});
    }
};

request.onsuccess = event => {
    console.log('Success');

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => {
    console.error(event);
};

checkDatabase = () => {
    const db = request.result;

    let transaction = db.transaction([pendingObjectStoreName], 'readwrite');

    let store = transaction.objectStore(pendingObjectStoreName);

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain */*',
                    "Content-Type": 'application/json'
                }
            }).then(res => res.json())
            .then(()=>{
                transaction = db.transaction([pendingObjectStoreName], 'readwrite');
                store = transaction.objectStore(pendingObjectStoreName);
                store.clear();
            });
        };
    };
};

saveRecord = (record) =>{
    const db = request.result;
    
    const transaction = db.transaction([pendingObjectStoreName], 'readwrite');

    const store = transaction.objectStore(pendingObjectStoreName);

    store.add(record);
};

window.addEventListener('online', checkDatabase);