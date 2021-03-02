const mongoose = require('mongoose');
let ObjectId = mongoose.mongo.ObjectId;

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    registredAt: {
        type: Date,
        default: Date.now
    },
    authorId: {
        type: ObjectId,
        ref: 'Users'
    },
    videosId: [
        {
            type: ObjectId,
            ref: 'Videos'
        }
    ],
    description: {
        type: String
    }
}, {collection: 'Playlists'})
const PlaylistModel = mongoose.model('Playlists', PlaylistSchema);
const fs = require('fs').promises;
class PlayList {
    constructor(name, authorId, description) {
        this.id;
        this.name = name;
        this.registredAt;
        this.authorId = authorId;
        this.videosId = [];
        this.description = description
    }
    static createPlaylist(playlist) {
        return this.getAllPlayLists().then(arrayOfPlayLists => {
            for (let i = 0; i < arrayOfPlayLists.length; i++) {
                if (arrayOfPlayLists[i].name == playlist.name) {
                    return Promise.reject("playlist with this id already exist");
                }
            }
            return new PlaylistModel(playlist).save();
        })
    }
    static deletePlayListById(idP) {
        return PlaylistModel.remove({_id: idP});
    }
    static getById(idP) {
        return PlaylistModel.findById(idP);
    }
    static addVideoToPlayList(userId, nameP, video_idP) {
        console.log("play list name = " + nameP);
        return PlaylistModel.findOne({name: nameP}).then(result => {
            if (result) {
                console.log("author id" + result.authorId);
                console.log("userIdd" + userId);
                if (result.authorId == userId) {
                    if (result.videosId.includes(video_idP)) {
                        return Promise.reject("video has been already added")
                    } else {
                        result.videosId.push(video_idP);
                        const whom = {
                            _id: result._id
                        }
                        const how = {
                            videosId: result.videosId
                        }
                        return PlaylistModel.updateOne(whom, how);
                    }
                } else {
                    return Promise.reject("playlist with this name does not exist")
                }

            } else {
                return Promise.reject("playlist with this name does not exist")
            }

        })
    }
    static deleteVideoFromPlayList(playlistId, video_idP) {
        console.log(playlistId)
        return this.getById(playlistId).then(result => {
            console.log('RESULT = ' + result);
            let index = result.videosId.indexOf(video_idP);
            if (index !== -1) {
                result.videosId.splice(index, 1);
                const whom = {
                    _id: result.id
                }
                const how = {
                    videosId: result.videosId
                }
                return PlaylistModel.updateOne(whom, how);
            } else {
                return Promise.reject("BYDY REZAT BLAAAA");
            }
        })
    }
    static getPlaylistsWithThisVideo(videoId) {
        return PlaylistModel.find().then(playlists => {
            let arrayOfPlaylistsWithThisVideo = [];
            for (let playlist of playlists) {
                if (playlist.videosId.indexOf(videoId) !== -1) {
                    arrayOfPlaylistsWithThisVideo.push(playlist);
                }
            }
            return arrayOfPlaylistsWithThisVideo;
        })
    }
    static getAllPlayListVideo(playlistId) {
        return this.getById(playlistId).then(result => {
            return result.videosId;
        })
    }
    static getAllPlayLists(page) {
        let countOnPage = 5;
        return PlaylistModel.find().skip(countOnPage * page).limit(countOnPage);
    }
    static getAllPlayListsWithoutPagination() {
        return PlaylistModel.find();
    }
    static updatePlayList(id, new_name, desc) {
        const whom = {
            _id: id
        };
        const how = {
            name: new_name,
            description: desc
        }
        return PlaylistModel.updateOne(whom, how)
    }
    static findByName(name, page) {
        let countOnPage = 5;
        console.log(name);
        return PlaylistModel.find({name: name}).skip(countOnPage * page).limit(countOnPage);
    }
    static findAllByName(name) {


        return PlaylistModel.find({name: name});
    }
    static getObjectByid(id) {
        return PlaylistModel.findById(id).then(result => {
            let playlist = {};
            playlist.name = result.name;
            playlist.id = result._id;
            playlist.registredAt = result.registredAt;
            playlist.authorId = result.authorId;
            playlist.videosId = result.videosId;
            playlist.description = result.description;
            return playlist;
        })
    }
}
module.exports = PlayList;
