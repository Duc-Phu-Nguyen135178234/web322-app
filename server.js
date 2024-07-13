
/**
*  WEB322 - Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites, friends gpt or otherwise) or distributed to other students.
*  I understand that if caught doing so, I will receive zero on this assignment and possibly 
*  fail the entire course.
*  Name: Duc Phu Nguyen
*  Student ID: 135178234
*  Date: July 13 2024
*  Vercel Web App URL:https://vercel.com/kevins-projects-b2072a7e/web322-assignment4/79Nv8mJvgj1kYYfXz75eWqHqRM2g
*  GitHub Repository URL: https://github.com/Duc-Phu-Nguyen135178234/web322-app
**/

const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');
const storeService = require('./store-service'); 
const exphbs = require('express-handlebars'); 

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



// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars setup
const hbs = exphbs.create({
    extname: '.hbs',
    //defaultLayout: 'main', // Set the default layout to "main"
    //layoutsDir: path.join(__dirname, 'views', 'layouts'), // Path to the layouts directory
    helpers: {
        navLink: function(url, options){
            return (
                '<li class="nav-item"><a class="' +
                (url == app.locals.activeRoute ? 'nav-link active' : 'nav-link') +
                '" href="' + url + '">' +
                options.fn(this) +
                '</a></li>'
            );
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },

        
    }
});
// Handlebars setup
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));



// Middleware to set the active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// [GET] / Routes Home redirect to about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// [GET] /about route
app.get('/about', (req, res) => {
    res.render('about');
});

// [GET] /shop route
app.get("/shop", async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }
        //items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let item = items[0];

        viewData.items = items;
        viewData.item = item;
    } catch (err) {
        console.error("Error fetching items:", err);
        viewData.message = "no results";
    }

    try {
        let categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        console.error("Error fetching categories:", err);
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

// [GET] /shop/:id route to get an item by ID
app.get('/shop/:id', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }
        items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.items = items;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.item = await storeService.getItemById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

//[GET] Route items /items?category=1 /items?minDate=2023-01-01
app.get('/items', async (req, res) => {
    //if query have category call function getItembyCategory in file store-service.js
    if (req.query.category) {
        await storeService.getItemsByCategory(req.query.category).then(items => {
            res.render('items', { items });
        }).catch(err => {
            res.render('items', { message: "no results" });
        });
    } else if (req.query.minDate) {
        await storeService.getItemsByMinDate(req.query.minDate).then(items => {
            res.render('items', { items });
        }).catch(err => {
            res.render('items', { message: "no results" });
        });
    } else {
        await storeService.getAllItems().then(items => {
            res.render('items', { items });
        }).catch(err => {
            res.render('items', { message: "no results" });
        });
    }
});


// [GET] Route to get an item by ID http://localhost:8080/item/1
app.get('/item/:id', (req, res) => {
    const id = parseInt(req.params.id); 
    storeService.getItemById(id)
        .then(entry => {
            res.json(entry);
        })
        .catch(error => {
            res.status(404).send({ error });
        });
});



//[GET] /items/add route
app.get('/items/add', (req, res) => {
    res.render('addItem');
});


//[POST] /items/add route
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

// [GET] categories route
app.get('/categories', (req, res) => {
    storeService.getCategories().then(categories => {
        res.render('categories', { categories });
    }).catch(err => {
        res.render('categories', { message: "no results" });
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

