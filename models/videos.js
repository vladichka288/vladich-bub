// let Promise = require('promise');
const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

const VideosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    registredAt: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    authorId: {
        type: ObjectId,
        ref: 'Users'
    },
    views: [
        {
            type: ObjectId,
            ref: 'Views'
        }
    ]
}, {collection: 'Videos'})
const VideosModel = mongoose.model('Videos', VideosSchema);
const fs = require('fs').promises;

class Video {

    constructor(id, name, authorId) {
        this.id = id;
        this.name = name;
        this.authorId = authorId;
        this.registredAt;
        this.videoUrl;
        this.description;
        this.imageUrl;
        this.views;
    }
    static filterSearch(searchText, videoName) {
        let lowerSearchText = searchText.toLowerCase();
        let lowerVideoName = videoName.toLowerCase();

        if (lowerVideoName.indexOf(lowerSearchText) !== -1) {
            return true;
        }
        return false;
    }
    static insert(element) {
        return new VideosModel(element).save();
    }

    static findAllByName(name) {
        return VideosModel.find().then((result => {
            let arrayOfAcceptVideos = [];
            for (let i = 0; i < result.length; i++) {
                if (Video.filterSearch(name, result[i].name)) {
                    arrayOfAcceptVideos.push(result[i]);
                    console.log("+");
                }
            }
            console.log(arrayOfAcceptVideos.length);
            return [arrayOfAcceptVideos, arrayOfAcceptVideos.length];

        }))
    }
    static findByName(name, page) {
        let countOnPage = 5;
        return this.findAllByName(name).then(([resultArray, count]) => {
            let bam = [];
            bam = resultArray.slice(countOnPage * (page - 1), countOnPage * (page - 1) + countOnPage);
            return [bam, count];
        })
    }
    static getById(idP) {
        return VideosModel.findById(idP);
    };
    static update(new_element) {
        const whom = {
            _id: new_element._id
        }
        const how = {
            $set: {
                _id: new_element._id,
                name: new_element.name,
                description: new_element.description,
                registredAt: new_element.registredAt,
                imageUrl: new_element.imageUrl,
                videoUrl: new_element.videoUrl
            }
        }
        return VideosModel.updateOne(whom, how);

    };
    static deleteById(idP) {
        return VideosModel.deleteOne({_id: idP});
    };
    static getAll() {
        return VideosModel.find();
    };
    static getAllApiVersion(page) {
        let countOnPage = 5;
        return VideosModel.find().skip(countOnPage * (page - 1)).limit(countOnPage);
    }
    static paginationData(page, pagIndex, arrayOfVideos) {
        let paginationVideo = [];
        for (let i = 0; i < arrayOfVideos.length; i++) {
            if ((i >= pagIndex * page) && (i < (pagIndex * page) + pagIndex)) {
                paginationVideo.push(arrayOfVideos[i])
            }
        }
        return paginationVideo;
    };
    static countOfPages(number, array) {
        let arrayOfIndex = [];
        let count = Math.ceil(array.length / number);
        for (let i = 0; i < count; i++) {
            arrayOfIndex.push({pageId: i});
        }
        return arrayOfIndex;
    };
    static addView(videoId, view) {
        return VideosModel.findById(videoId).then(result => {
            const whom = {
                _id: result._id
            }
            result.views.push(view);
            const how = {
                views: result.views
            }
            return VideosModel.updateOne(whom, how);
        })
    }
    static deleteView(videoId, viewId) {
        return VideosModel.findById(videoId).then(result => {
            const whom = {
                _id: result._id
            }
            result.views.splice(result.views.indexOf(viewId), 1);
            const how = {
                views: result.views
            }
            return VideosModel.updateOne(whom, how);
        })
    }
    static getAllViews(videoId) {
        return VideosModel.findById(videoId).then(result => {
            if(result){
                return result.views;
            }
            else{
                return Promise.reject("video with thisid does not exist")
            };
        })
    }


}

module.exports = Video;
