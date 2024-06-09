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
