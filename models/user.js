const mongoose = require('mongoose');
const video = require('./videos.js');
let ObjectId = mongoose.mongo.ObjectId;

const UserSchema = new mongoose.Schema({
    subscribedUsers: [
        {
            type: ObjectId,
            ref: 'Users'
        }
    ],
    login: {
        type: String,
        required: false
    },
    fullname: {
        type: String
    },
    registredAt: {
        type: Date,
        default: Date.now
    },
    avaUrl: {
        type: String,
        default: "/images/defaultPhoto.jpg"
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user"
    },
    password: {
        type: String,
        required: false
    },
    videos: [
        {
            type: ObjectId,
            ref: 'Videos'
        }
    ],
    playlists: [
        {
            type: ObjectId,
            ref: 'Playlists'
        }
    ],
    chatId: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        default: ""
    }
}, {collection: 'Users'})
const UsersModel = mongoose.model('Users', UserSchema);
const fs = require('fs').promises;


class User {
    constructor(login, fullname, password) {
        this.id;
        this.login = login; // string
        this.fullname = fullname; // string
        this.password = password; // string
        this.role;
        this.registredAt;
        this.avaUrl;
        this.isDisabled;
        this.videos;
        this.playlists
        this.chatId;
        this.subscribedUsers;
        this.googleId;
        // ...
    }

    static getByChatId(chatId) {
        return UsersModel.findOne({chatId: chatId});
    }
    static getById(idP) {
        return UsersModel.findById(idP)
    }
    static getUserObjectById(idP) {
        return UsersModel.findById(idP).then(result => {
            let userObject = {};
            userObject.id = result.id;
            userObject.fullname = result.fullname; // string
            userObject.avaUrl = result.avaUrl;
            userObject.registredAt = new Date(result.registredAt).toLocaleString();
            return userObject;
        })
    }
    static getAll() {
        return UsersModel.find()

    }
    static insert(user) {
        return new UsersModel(user).save();
    }
    static fintUserByGoogleId(googleId) {

        return UsersModel.findOne({googleId: googleId});
    }
    static getByLoginAndHashPass(username, hashedPass) {
        console.log("n\\nn\n\n\n");
        console.log(`password : (${hashedPass})`);
        console.log(`username : (${username})`);
        return UsersModel.findOne({login: username, password: hashedPass});
    }
    static updateToAdminById(userId) {
        return UsersModel.findById(userId).then(result => {
            const whom = {
                _id: result.id
            }
            const how = {
                role: "admin"
            }
            return UsersModel.updateOne(whom, how);
        })
    }
    static userUpdatePhoto(userId, photoPath) {
        return UsersModel.findById(userId).then(result => {
            const whom = {
                _id: result.id
            }
            const how = {
                avaUrl: photoPath
            }
            return UsersModel.updateOne(whom, how);
        })
    }
    static downgradeToUserById(userId) {
        return UsersModel.findById(userId).then(result => {
            const whom = {
                _id: result.id
            }
            const how = {
                role: "user"
            }
            return UsersModel.updateOne(whom, how);
        })
    }
    static getPaginationUsers(page) {
        let countOnPage = 5;
        console.log(countOnPage * page);
        return UsersModel.find().skip(countOnPage * page).limit(countOnPage);
    }
    static updateUser(id, newName, newAvaFile) {
        return UsersModel.findById(id).then(result => {
            const whom = {
                _id: result.id
            }
            const how = {
                fullname: newName,
                avaUrl: newAvaFile
            }
            return UsersModel.updateOne(whom, how);
        }).catch(err => console.log(err))
    }
    static deleteById(idP) {
        return this.getById(idP).then(result => {
            if (result) 
                return UsersModel.remove({_id: idP});
             else 
                return Promise.reject("error user with this id deos not exist")


            


        })

    };
    static findByName(name, page) {
        let countOnPage = 5;
        return UsersModel.find({fullname: name}).skip(countOnPage * page).limit(countOnPage);
    }
    static findAllByName(name, page) {

        return UsersModel.find({fullname: name});
    }
    static findCountOfAllVideosById(id) {
        console.log("id" + id);
        return UsersModel.findById(id).then(result => {
            let counter = 0;
            for (let i = 0; i < result.videos.length; i++) {
                counter++;
            }
            return counter;
        }).catch(err => console.error(err))
    }
    static findVideosById(id) {
        return UsersModel.findById(id).then(result => {
            return result.videos;
        }).catch(err => {
            console.log("we here")
            console.error(err)
        })
    }
    static addVideo(videoId, userId) {

        return UsersModel.findById(userId).then(result => {
            if (result) {
                result.videos.push(videoId);
                const whom = {
                    _id: result._id
                }
                const how = {
                    videos: result.videos
                }
                return UsersModel.updateOne(whom, how);
            } else {
                return Promise.reject("video does not exist")
            }
        }).then(result => {
            return videoId;
        }).catch(err => {
            console.error(err)
        })
    }
    static deleteVideo(userId, videoId) {
        console.log("userId = " + userId);
        return UsersModel.findById(userId).then(result => {
            console.log(result);
            for (let i = 0; i < result.videos.length; i++) {
                if (result.videos[i] == videoId) {
                    console.log("we here");
                    result.videos.splice(i, 1);
                    const whom = {
                        _id: userId
                    }
                    const how = {
                        videos: result.videos
                    }
                    return UsersModel.updateOne(whom, how);
                }
            }
        })
    }
    static addPlaylist(playlistId, userId) {
        return UsersModel.findById(userId).then(result => {
            result.playlists.push(playlistId);
            const whom = {
                _id: userId
            }
            const how = {
                playlists: result.playlists
            }
            return UsersModel.updateOne(whom, how);
        })
    }
    static deletePlayList(userId, playlistId) {
        return UsersModel.findById(userId).then(result => {

            for (let i = 0; i < result.playlists.length; i++) {
                if (result.playlists[i] == playlistId) {
                    result.playlists.splice(i, 1);
                }
            }
            const whom = {
                _id: userId
            }
            const how = {
                playlists: result.playlists
            }
            return UsersModel.updateOne(whom, how);
        })
    }
    static getAllUserPlaylists(userId) {
        return UsersModel.findById(userId).then(result => {
            return result.playlists
        })
    }
    static getPaginationUserPlayLists(userId, page) {
        console.log("page = " + page);
        console.log("userId = " + userId);
        let countOnPage = 3;
        console.log(page * countOnPage);
        console.log((page * countOnPage) + page)
        return this.getAllUserPlaylists(userId).then(arrayOfIndexPlaylist => {
            return [
                arrayOfIndexPlaylist.slice(
                    ((page - 1) * countOnPage),
                    ((page - 1) * countOnPage) + countOnPage
                ),
                arrayOfIndexPlaylist.length
            ]
        }).catch(err => {
            console.log("error")
        })
    }
    static addSubscribe(userId, subscribeId) {
        console.log(userId);
        return UsersModel.findById(userId).then(result => {
            if (result) {
                console.log("userId");
                if (result.subscribedUsers.indexOf(subscribeId) == -1) {
                    console.log("id tap tap  " + result._id);
                    let array = result.subscribedUsers;
                    array.push(subscribeId);
                    const whom = {
                        _id: result._id
                    }
                    const how = {
                        subscribedUsers: array
                    }
                    return UsersModel.updateOne(whom, how);
                } else {
                    return Promise.reject("you has already subscribed");
                }

            } else {
                return Promise.reject("user not found");
            }

        })
    }
    static unsubscribe(userId, subscribeId) {
        console.log(userId);
        return UsersModel.findById(userId).then(result => {
            if (result) {
                console.log("userId");
                if (result.subscribedUsers.indexOf(subscribeId) != -1) {
                    console.log("id tap tap  " + result._id);
                    let array = result.subscribedUsers;
                    array.splice(array.indexOf(subscribeId), 1);
                    const whom = {
                        _id: result._id
                    }
                    const how = {
                        subscribedUsers: array
                    }
                    return UsersModel.updateOne(whom, how);
                } else {
                    return Promise.reject("subscribe first");
                }

            } else {
                return Promise.reject("user not found");
            }

        })
    }
    static findByChatId(chatId, userId) {
        console.log(chatId);
        return Promise.all([
            UsersModel.findOne(
                {chatId: chatId}
            ),
            UsersModel.findById(userId)
        ]).then(([userFondedByChatId, userFoundedById]) => {
            console.log(userFondedByChatId);
            if (userFondedByChatId) {
                if (userFoundedById.chatId == "") {

                    return UsersModel.updateOne({
                        _id: userFoundedById.id
                    }, {chatId: chatId});
                } else {
                    if (userFondedByChatId == userFoundedById) {
                        return result;
                    } else {
                        if ((userFondedByChatId.id != userFoundedById.id) && (userFondedByChatId.chatId == userFoundedById.chatId)) {

                            return UsersModel.updateOne({
                                id: userFoundedById.id
                            }, {chatId: userFoundedById.chatId});
                        } else if ((userFondedByChatId.chatId != userFoundedById.chatId) && (userFondedByChatId.id == userFoundedById.id)) {


                            return UsersModel.updateOne({
                                id: userFoundedById.id
                            }, {chatId: userFoundedById.chatId});

                        } else {
                            return Promise.reject("pizda");

                        }
                    }
                }
            } else {
                return UsersModel.updateOne({
                    _id: userFoundedById.id
                }, {chatId: chatId});
            }

        }).catch(err => {
            console.error(err)
        })
    }
    static getViewsCount(chatId) {
        return UsersModel.findOne({chatId: chatId}).then(result => {
            return result.videos;
        }).then(videos => {
           
            let promises =[] 
            for (let i = 0; i < videos.length; i++) {
                promises.push(video.getById(videos[i]))
            }
            return Promise.all(promises);
        }).then(result =>{
            let counter = 0;
            for(let i = 0; i < result.length; i++) {
                counter += result[i].views.length;
            }
            return counter;
        })
        .catch(err => console.error(err));
    }
}
module.exports = User;
