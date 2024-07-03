
/**
*  WEB322 - Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites, friends gpt or otherwise) or distributed to other students.
*  I understand that if caught doing so, I will receive zero on this assignment and possibly 
*  fail the entire course.
*  Name: Duc Phu Nguyen
*  Student ID: 135178234
*  Date: July 03 2024
*  Vercel Web App URL:https://web322-app-flame.vercel.app/about
*  GitHub Repository URL: https://github.com/Duc-Phu-Nguyen135178234/web322-app
**/


const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service'); // Import the store-service module

const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dehcsl5k3',
    api_key: '383359944116932',
    api_secret: 'xKuPfNKlod7sB1CWJU0iPxUysNk',
    secure: true
});

const upload = multer(); // No disk storage
// Read JSON data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'items.json')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Routes Home
app.get('/', (req, res) => {
    res.redirect('/about');
});

//Route about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

//Route shop
app.get('/shop', (req, res) => { // Define a route for the "/shop" URL
    storeService.getPublishedItems().then((data) => {  // Get published items in store-service
        res.json(data); 
    }).catch((err) => { 
        res.json({ message: err }); 
    });
});

//Route items /items?category=1 /items?minDate=2023-01-01
app.get('/items', (req, res) => {
    //if query have category call function getItembyCategory in file store-service.js
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category).then(items => {
            res.json(items);
        }).catch(err => {
            res.status(500).send("Error fetching items by category: " + err);
        });
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate).then(items => {
            res.json(items);
        }).catch(err => {
            res.status(500).send("Error fetching items by minimum date: " + err);
        });
    } else {
        storeService.getAllItems().then(items => {
            res.json(items);
        }).catch(err => {
            res.status(500).send("Error fetching all items: " + err);
        });
    }
});

// Route to get an item by ID http://localhost:8080/item/1
app.get('/item/:id', (req, res) => {
    const id = parseInt(req.params.id); 
    const entry = data.find(item => item.id === id);

    if (entry) {
        res.json(entry);
    } else {
        res.status(404).send({ error: 'Entry not found' });
    }
});


app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    
    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        streamUpload(req).then(result => {
            processItem(result.url);
        }).catch(error => {
            res.status(500).send("Failed to upload image: " + error.message);
        });
    } else {
        processItem('');
    }
    
    function processItem(imageUrl) {
        req.body.featureImage = imageUrl || '';
        storeService.addItem(req.body).then(() => {
            res.redirect('/items');
        }).catch(err => {
            res.status(500).send(err.message);
        });
    }
});

app.get('/categories', (req, res) => {
    storeService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(500).send("Error fetching categories: " + err);
    });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});




storeService.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`);
    });
}).catch((err) => {
    console.log(`Failed to start server: ${err}`);
});
