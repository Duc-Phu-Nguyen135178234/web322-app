const fs = require('fs'); // Import the fs module to work with the file system
const path = require('path');

let items = []; // Array to hold item objects
let categories = []; // Array to hold category objects

const itemsFilePath = path.join(__dirname, 'data', 'items.json');
const categoriesFilePath = path.join(__dirname, 'data', 'categories.json');

// Initialize the module 
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(itemsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading items.json:", err);
                return reject("unable to read file");
            }
            items = JSON.parse(data);
            fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error("Error reading categories.json:", err);
                    return reject("unable to read file");
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
};

// Get all items
module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items); // Resolve the promise with the items array if it has elements
        } else {
            reject("no results returned"); // Reject the promise if the items array is empty
        }
    });
};

// Get published items
module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published); // Filter items to include only published = true
        if (publishedItems.length > 0) {
            resolve(publishedItems); 
        } else {
            reject("no results returned"); 
        }
    });
};

// Get all categories
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories); // Resolve the promise with the categories array if it has elements
        } else {
            reject("no results returned"); // Reject the promise if the categories array is empty
        }
    });
};



// Add a new item
module.exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        // Ensure the itemData is not null or undefined
        if (!itemData) {
            reject("Item data is missing");
            return;
        }

        // Set the ID of the new item
        itemData.id = items.length + 1;

        // Check if the published property is defined, otherwise default it to false
        itemData.published = itemData.published === true;

        // Add the new item to the array
        items.push(itemData);

        // Optionally, save the updated items list to the JSON file for persistence
        fs.writeFile(itemsFilePath, JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject("Failed to save item to file");
            } else {
                resolve(itemData);  // Resolve the promise with the new item data
            }
        });
    });
};

//search items by category // http://localhost:8080/items?category=1
module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        //convert to number make sure category is number
        const number = parseInt(category);
        
        const newarray = items.filter(item => item.category === number);
        if (newarray.length > 0) {
            resolve(newarray);
        } else {
            reject("No items found for category: " + category);
        }
    });
};

//search item by Date /http://localhost:8080/items?minDate=2023-05-20
module.exports.getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No items found with post date after: " + minDateStr);
        }
    });
};

// Route to get an item by ID http://localhost:8080/item/1
module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        const newarray = items.find(item => item.id.toString() === id.toString());
        if (newarray) {
            resolve(newarray);
        } else {
            reject("No item found with ID: " + id);
        }
    });
};
