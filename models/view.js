const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;
const ViewSchema = new mongoose.Schema({
    registredAt: {
        type: Date,
        default: Date.now
    },
    viewerId: {
        type: ObjectId,
        ref: 'Users'
    }
}, {collection: 'Views'})
const ViewsModel = mongoose.model('Views', ViewSchema);
const fs = require('fs').promises;
class Views {
    constructor( registredAt, viewerId) {
        this.registredAt = registredAt;
        this.viewerId = viewerId;
    }
    static createView(view) {
        console.log("Parampam")
        return new ViewsModel(view).save();
    }
    static deleteView(viewId) {
        return ViewsModel.deleteOne({_id: viewId});
    }
    static getById(viewId){
        return ViewsModel.findById(viewId);
    }
}
module.exports = Views;
