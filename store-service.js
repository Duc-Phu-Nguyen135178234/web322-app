const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'database_owner', '20yDwnRuEVSi', {
    host: 'ep-dark-truth-a5sqml8z-pooler.us-east-2.aws.neon.tech',
    dialectModule: require('pg'),
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// const fs = require('fs'); // Import the fs module to work with the file system
// const path = require('path');

// const itemsFilePath = path.join(__dirname, 'data', 'items.json');
// const categoriesFilePath = path.join(__dirname, 'data', 'categories.json');
//Define the Item and Category models


const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// belongsTo Relationship
Item.belongsTo(Category, {foreignKey: 'category'});


//update initialize
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve("Success");
        }).catch(err => {
            reject("unable to sync the database");
        });
    });
};


//update getAllItems
module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll().then(data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};


//update getItemsbyCategory
module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        }).then(data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

//update getItemsbyMinDate
module.exports.getItemsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op;

    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};


//update getItembyID
module.exports.getItemById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await Item.findAll({
                where: { id: id }
            });

            if (data.length > 0) {
                resolve(data[0]);
            } else {
                reject("no results returned");
            }
        } catch (error) {
            reject("no results returned");
        }
    });
};


// update addItem
module.exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        for (let prop in itemData) {
            if (itemData[prop] === "") itemData[prop] = null;
        }
        itemData.postDate = new Date();

        Item.create(itemData).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to create item");
        });
    });
};

//update getPublishedItems
module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        try {
            Item.findAll({
                where: { published: true }
            }).then(data => {
                resolve(data);
            }).catch(() => {
                reject("no results returned");
            });
        } catch (error) {
            reject("no results returned");
        }
    });
};

//update getPublishedItemsByCategory
module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        try {
            Item.findAll({
                where: { published: true, category: category }
            }).then(data => {
                resolve(data);
            }).catch(() => {
                reject("no results returned");
            });
        } catch (error) {
            reject("no results returned");
        }
    });
};

//update getCategories
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        try {
            Category.findAll().then(data => {
                resolve(data);
            }).catch(() => {
                reject("no results returned");
            });
        } catch (error) {
            reject("no results returned");
        }
    });
};




//add new addCategory
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") categoryData[prop] = null;
        }
        Category.create(categoryData).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to create category");
        });
    });
};

//add deleteCategoryByID
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to remove category / category not found");
        });
    });
};

//deletePostbyID

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to remove item / item not found");
        });
    });
};