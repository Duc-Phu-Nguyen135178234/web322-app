
/**
*  WEB322 - Assignment 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites, friends gpt or otherwise) or distributed to other students.
*  I understand that if caught doing so, I will receive zero on this assignment and possibly 
*  fail the entire course.
*  Name: Duc Phu Nguyen
*  Student ID: 135178234
*  Date: June 10 2024
*  Vercel Web App URL:
*  GitHub Repository URL: https://github.com/Duc-Phu-Nguyen135178234/web322-app
**/


const express = require('express'); // Import the Express 
const path = require('path'); // Import the Path module 
const app = express(); 
const storeService = require('./store-service'); // Import the store-service module

app.set('views', path.join(__dirname, 'views')); // Set the views directory for the application
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" 

const PORT = process.env.PORT || 8080; 

app.get('/', (req, res) => { // Define a route for the root URL
    res.redirect('/about'); 
});

app.get('/about', (req, res) => { // Define a route for the "/about" URL
    res.sendFile(path.join(__dirname, 'views', 'about.html')); 
});

app.get('/shop', (req, res) => { // Define a route for the "/shop" URL
    storeService.getPublishedItems().then((data) => {  // Get published items in store-service
        res.json(data); 
    }).catch((err) => { 
        res.json({ message: err }); 
    });
});

app.get('/items', (req, res) => { 
    storeService.getAllItems().then((data) => { 
        res.json(data); // Get items in store-service
    }).catch((err) => { 
        res.json({ message: err }); 
    });
});

app.get('/categories', (req, res) => { // Define a route for the "/categories" URL
    storeService.getCategories().then((data) => { // Get items in store-service
        res.json(data); 
    }).catch((err) => { 
        res.json({ message: err }); 
    });
});

app.use((req, res) => { // Handle 404 errors (routes not found)
    res.status(404).send("Page Not Found"); 

});

storeService.initialize().then(() => { // Initialize the store service
    app.listen(PORT, () => { 
        console.log(`Express http server listening on port ${PORT}`); 
    });
}).catch((err) => { 
    console.log(`Failed to start server: ${err}`); 
});

require('pg'); // Import the pg (PostgreSQL) module
