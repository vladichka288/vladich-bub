const cloudinary = require('cloudinary');
const video = require("../../models/videos");
cloudinary.config({cloud_name: "dlaoof6av", api_key: "367629461961258", api_secret: "aB7eI1HaXFNLAjqb3GBNOTG20KQ"});
module.exports = {
    authentificationAll: function (req, res) {
        if (req.query.page) {
            if ((parseInt(req.query.page) > 0 || req.query.page == 0)) {
                video.getAll().then(result => {
                    return Promise.all([
                        video.getAllApiVersion(req.query.page),
                        result
                    ])
                }).then(result => {
                    if (result[0].length != 0) {
                        res.status(200);

                        res.json({
                            videos: result[0],
                            link: {
                                firstPage: `/api/v1/getAllVideos?page=1`,
                                lastPage: `/api/v1/getAllVideos?page=${
                                    Math.ceil(result[1].length / 5)

                                }`,
                                lastPageApi: Math.ceil(
                                    (result[1].length / 5)
                                )
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({attention: "pystota", videos: result[0]});
                    }
                }).catch(err => {
                    console.error(err);
                    res.status(500);
                    res.json({err: "err server error"});
                })


            } else {
                res.status(422); // / not valid data
                res.json({err: "not valid data"});
            }
        } else {

            video.getAll().then(result => {
                res.status(400);
                res.json({
                    err: "forgot page parameter",
                    link: {
                        page0: "/api/v1/getAllVideos?page=1",
                        lastPage: `/api/v1/getAllVideos?page=${
                            Math.ceil(result.length / 5)
                        }`
                    }
                })
            });

        }

    },
    authentificationName: function (req, res) {

        if (req.query.page) {

            if ((parseInt(req.query.page) > 0)) {
                return video.findByName(req.params.name, req.query.page).then(([videosResult, count]) => {

                    console.log("length = " + videosResult);
                    if (videosResult.length != 0) {
                        res.status(200);
                        res.json({
                            videos: videosResult,
                            link: {
                                page0: `/api/v1/videosGetByName/${
                                    req.params.name
                                }?page=0`,
                                lastPage: `/api/v1/videosGetByName?page=${
                                    Math.ceil(count / 5)
                                }`,
                                lastPageApi: Math.ceil(
                                    (count / 5)
                                )
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({attention: "pystota", videos: videosResult});
                    }
                }).catch(err => {
                    console.error(err);
                    res.status(500);
                    res.json({err: "err server error"});
                })
            } else {
                res.status(422); // / not valid data
                res.json({err: "not valid data"});
            }
        } else {

            video.findByName(req.params.name, 1).then(result => {
                if (result.length == 0) {
                    res.status(404);
                    res.json({attention: "videos with this name do not exist"});
                } else {
                    res.status(200);
                    res.json({videos: result, nextPage: `/api/v1/videosGetByName/${
                            req.params.name
                        }?page=2`});
                }
            })

        }
    },


    videoValidation: function (files) {
        if (! files.imageFile) 
            return "error image file absent";
        


        if (! files.videoFile) 
            return "error video file absent";
        


        if (files.videoFile.mimetype != "video/mp4") 
            return "video must be mp4 formated!!!";
        


        if ((files.imageFile.mimetype != "image/jpeg") && (files.imageFile.mimetype != "image/jpg") && (files.imageFile.mimetype != "image/png")) 
            return "image must be png/jpg/jpeg formated!!!";
        


        if (files.videoFile.size > 30000000) 
            return "video file size limit exceed(30mb)";
        


        if (files.imageFile.size > 5000000) 
            return "photo file size limit exceed(5mb)";
        


        return "no error";
    },
    cloudinaryFileUpload: function (files) {
        let promise1 = new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream({
                resource_type: 'video'
            }, function (error, result) {
                if (error) 
                    reject("yyyx syka")
                 else 
                    resolve(result)


                


            }).end(files.videoFile.data)
        })
        let promise2 = new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream({
                resource_type: 'image'
            }, function (error, result) {

                if (error) 
                    reject("yyyx syka")
                 else 
                    resolve(result)


                


            }).end(files.imageFile.data)
        })
        return Promise.all([promise1, promise2]);
    },
    validationCreatePlayList: function (req) {
        console.log("PIZDA")
        if (! req.body) 
            return "fill body";
        


        if (! req.body.description) {
            console.log("PIZDA");
            return "fill description field";
        }
        if (! req.body.name) 
            return "fill name field";
        


        if (req.body.name.length > 30) {
            return "name field length too long"
        }
        if (req.body.description.length > 100) {
            return "description field length too long"
        }
        return "no error";
    },
    validationUpdatePlaylist: function (body) {

        if (! body) 
            return "fill body";
        


        if (! body.newDesc) {
            console.log("PIZDA");
            return "fill newDesc field";
        }
        if (! body.newName) 
            return "fill newName field";
        


        if (body.newName.length > 30) {
            return "name field length too long"
        }
        if (body.newDesc.length > 100) {
            return "description field length too long"
        }
        return "no error";
    },

    validationCreateUser: function (body) {

        if (! body) 
            return "fill body";
        


        if (! body.pass) {
            console.log("PIZDA");
            return "fill pass field";
        }
        if (! body.confirm_pass) 
            return "fill confirm_pass field";
        


        if (! body.login) {
            return "fill login field"
        }

        return "no error";
    },
    validationUpdateUser: function (req) {
        if (! req.body) 
            return "fill body";
        


        if (! req.body.newName) {
            console.log("PIZDA");
            return "fill newName field";
        }
        if (! req.files.photo) 
            return "send file please";
        


        if ((req.files.photo.mimetype != "image/jpeg") && (req.files.photo.mimetype != "image/jpg") && (req.files.photo.mimetype != "image/png")) 
            return "image must be png/jpg/jpeg formated!!!";
        


        return "no error";
    },
    getCurrnetDate: function (videoPostedDate, getCurrnetDate) {
        let curentYear = getCurrnetDate.getFullYear();
        let curentMonth = getCurrnetDate.getMonth();
        let curentDate = getCurrnetDate.getDate();
        let currentHours = getCurrnetDate.getHours();
        let currentMinutes = getCurrnetDate.getMinutes();
        let videoYear = videoPostedDate.getFullYear();
        let videoMonth = videoPostedDate.getMonth();
        let videoDate = videoPostedDate.getDate();
        let videoHours = videoPostedDate.getHours();
        let videoMinutes = videoPostedDate.getMinutes();
        //
        let differenceYear = curentYear - videoYear;
        let differnceMonth = curentMonth - videoMonth;
        let differnceDate = curentDate - videoDate;
        let differnceHours = currentHours - videoHours;
        let differnceMinutes = currentMinutes - videoMinutes;

        let resultString = "This video was posted ";
        if (differenceYear == 0) {
            if (differnceMonth == 0) {
                if (differnceDate == 0) {
                    if (differnceHours == 0) {
                        if (differnceMinutes == 0) {
                            resultString = resultString + 'now';
                        } else {
                            resultString = resultString + differnceMinutes + " minutes ago";
                        }
                    } else {
                        if (differnceHours == 1) {
                            resultString = resultString + differnceHours + ' hour ago'
                        } else {
                            resultString = resultString + differnceHours + ' hours ago'
                        }
                    }
                } else {
                    if (differnceDate == 1) {
                        resultString = resultString + differnceDate + ' day ago'
                    } else {
                        resultString = resultString + differnceDate + ' days ago'
                    }
                }
            } else {
                if (differnceMonth == 1) {
                    resultString = resultString + differnceMonth + ' month ago'
                } else {
                    resultString = resultString + differnceMonth + ' months ago'
                }
            }

        } else {
            if (differenceYear == 1) {
                resultString = resultString + differenceYear + ' year ago'
            } else {
                resultString = resultString + differenceYear + ' years ago'
            }
        }
        return resultString;

    }
}
