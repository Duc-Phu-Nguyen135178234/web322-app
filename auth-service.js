const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; // To be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        //let db = mongoose.createConnection("mongodb+srv://Duc_Phu_Nguyen:Looking4themoon1@cluster0.qdp1qnx.mongodb.net/cluster0?retryWrites=true&w=majority&appName=Cluster0");
        let db = mongoose.createConnection("mongodb+srv://Duc_Phu_Nguyen:Looking4themoon1@cluster0.qdp1qnx.mongodb.net/UserName");

        db.on('error', (err) => {
            reject(err); // Reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

//registerUser
module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save()
                    .then(() => resolve())
                    .catch(err => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    });
            }).catch(err => {
                reject("There was an error encrypting the password");
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then(users => {
                if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, users[0].password).then((result) => {
                        if (result === true) {
                            users[0].loginHistory.push({
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            });

                            User.updateOne(
                                { userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } }
                            ).then(() => {
                                resolve(users[0]);
                            }).catch(err => {
                                reject("There was an error verifying the user: " + err);
                            });
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    });
                }
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};