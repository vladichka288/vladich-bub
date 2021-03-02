var express = require('express');
var router = express.Router();
const user = require('./../models/user');
const view = require('./../models/view');
const video = require('./../models/videos');
const PlayList = require('./../models/playlist')
const helpers = require('./funcHelpers/funcHelpers')
const config = require('./../config')
const cloudinary = require('cloudinary');
cloudinary.config({cloud_name: "dlaoof6av", api_key: "367629461961258", api_secret: "aB7eI1HaXFNLAjqb3GBNOTG20KQ"});
//

require('../passport');
const passport = require('passport');
router.get('/me', passport.authenticate('basic', {session: false}), function (req, res) {
    res.json(req.user);
});
function checkAuth(req, res, next) {
    console.log("lololololol");
    if (! req.user) {
        console.log("blaa")
        res.status(401);
        res.render("autho");
        return;
    } else {
        next();
    }
}


// CRUD users

// create
router.post('/registration', (req, res) => {

    let valid = helpers.validationCreateUser(req.body);
    if (valid == "no error") {
        if (req.body.pass == req.body.confirm_pass) {
            user.getAll().then(allUsers => {
                for (let oneOfUsers of allUsers) {
                    if (oneOfUsers.login == req.body.login) {
                        console.log(oneOfUsers.login);
                        res.status(403);
                        res.json({err: "login already exist"})
                        return;
                    }
                }

                let newUser = new user(req.body.login, "baka", sha512(req.body.pass, config.secret).passwordHash)
                return user.insert(newUser);

            }).then(result => {
                res.status(200);
                res.json({user: result})
            }).catch(error => {
                console.log(error)
                res.status(200);
                res.json({err: "server error"})
                return;
            })
        } else {
            res.status(418);
            res.json({err: "passwords does not match"})
        }
    } else {
        res.status(400);
        res.json({err: valid})
    }
});
// create

// read ::ID
router.get('/getUserById/:id', passport.authenticate('basic', {session: false}), function (req, res) {

    if (req.user.role == "admin") {
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(req.params.id);
            user.getById((String(req.params.id))).then(result => {
                if (result) {
                    res.status(200);
                    res.json({user: result});
                } else {
                    res.status(404)
                    res.json({err: "user with this id does not exist"});
                }
            }).catch(err => {
                res.status(500);
                res.json({err: "server error"})
                console.error(err);
            })
        } else {
            res.status(400)
            res.json({error: "this type is not ObjectId type"});
        }
    } else {
        res.status(403)
        res.json({error: "only for admins"})
    }

});
// read
router.get('/usersVideo', checkAuth, function (req, res) {
    let countOnPage = 5;
    if (req.query.userId) {
        if (req.query.search) {
            let userId = req.query.userId;
            console.log(userId);
            if (req.query.page) {
                if (parseInt(req.query.page)) {
                    let page = req.query.page;
                    return user.findVideosById(userId).then(videosArray => {
                        let promises = [];
                        for (let i = 0; i < videosArray.length; i++) {
                            promises.push(video.getById(videosArray[i]));
                        }
                        return Promise.all(promises);

                    }).then(arrayOfVideos => {
                        let filtredPromisesVideo = []
                        for (let i = 0; i < arrayOfVideos.length; i++) {
                            if (video.filterSearch(req.query.search, arrayOfVideos[i].name) == true) {
                                filtredPromisesVideo.push(arrayOfVideos[i]);
                            }
                        }
                        return Promise.all(filtredPromisesVideo);
                    }).then(niceVideos => {
                        if (niceVideos.length == 0) {
                            res.status(200).json({lastPage: 0, videos: niceVideos})
                        } else {
                            res.status(200);
                            res.json({
                                lastPage: Math.ceil(niceVideos.length / 5),
                                videos: niceVideos
                            })
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    res.status(400);
                    res.json({err: "not valid data"})
                }

            } else {
                res.status(400);
                res.json({err: "not enough argument(page=value)"})
            }
        } else {
            let userId = req.query.userId;
            if (req.query.page) {

                if (parseInt(req.query.page)) {
                    let page = req.query.page;
                    return user.findVideosById(userId).then(videosArray => {
                        let resultArray = [];
                        for (let i = 0; i < videosArray.length; i++) {
                            if ((i >= (page - 1) * countOnPage) && (i < page * countOnPage)) {
                                resultArray.push(videosArray[i]);
                            }
                        }
                        console.log("kla klak +=" + resultArray.length)
                        let promisesOfVideos = [];
                        for (let oneOfVideo of resultArray) {
                            promisesOfVideos.push(video.getById(oneOfVideo))
                        }
                        return Promise.all(promisesOfVideos);

                    }).then(allVideos => {
                        return Promise.all([user.findCountOfAllVideosById(userId), allVideos])
                    }).then(([countOfVideo, allVideos]) => {
                        console.log(countOfVideo);
                        if (countOfVideo == 0) {
                            res.status(200).json({lastPage: 0, videos: allVideos})
                        } else {

                            if (countOfVideo < countOnPage) {
                                res.json({lastPage: 1, videos: allVideos})
                            } else {
                                res.json({
                                    lastPage: Math.ceil(countOfVideo / countOnPage),
                                    videos: allVideos
                                })
                            }

                        }

                    }).catch(err => {
                        console.log("piska")
                        console.error(err);
                        res.status(500);
                        res.json({error: err})
                    })
                } else {
                    res.status(400);
                    res.json({err: "not valid data"})
                }
            } else {
                res.status(400);
                res.json({err: "not enough argument(page=value)"})
            }
        }
    }
})

// read ::ALL/*
router.get('/users', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.user.role == "admin") {
        if (req.query.page) {
            if ((parseInt(req.query.page) > 0 || req.query.page == 0)) {
                user.getAll().then(result => {
                    return Promise.all([
                        user.getPaginationUsers(req.query.page),
                        result
                    ])
                }).then(result => {
                    if (result[0].length != 0) {
                        res.status(200);
                        res.json({
                            users: result[0],
                            link: {
                                firstPage: `/api/v1/users?page=0`,
                                lastPage: `/api/v1/users?page=${
                                    Math.floor(result[1].length / 5)
                                }`
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({attention: "pystota"});
                    }
                }).catch(err => {
                    console.error(err);
                    res.status(500);
                    res.json({err: "err server error"});
                })
            } else {
                res.status(400);
                res.json({err: "forgot id parameter", link: "/api/v1/users?page=0"})
            }
        } else {
            res.status(400);
            res.json({err: "forgot page parameter", link: "/api/v1/users?page=0"})
        }

    } else {
        res.status(403);
        res.json({err: "only for admins"})
    }
});
// read::ALL
// find::NAME
router.get('/usersByName/:name', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.user.role == "admin") {
        console.log("yra");
        if (req.query.page) {
            if ((parseInt(req.query.page) > 0 || req.query.page == 0)) {
                user.findAllByName(req.params.name).then(result => {
                    return Promise.all([
                        user.findByName(req.params.name, req.query.page),
                        result
                    ])
                }).then(result => {

                    if (result[0].length != 0) {
                        res.status(200);
                        res.json({
                            users: result[0],
                            link: {
                                firstPage: `/api/v1/usersByName/${
                                    req.params.name
                                }?page=0`,
                                lastPage: `/api/v1/usersByName/${
                                    req.params.name
                                }?page=${
                                    Math.floor(result[1].length / 5)
                                }`
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({attention: "pystota"});
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

            user.findByName(req.params.name, 0).then(result => {
                if (result.length == 0) {
                    res.status(200);
                    res.json({attention: "pystota"});
                } else {
                    res.status(200);
                    res.json({users: result, nextPage: `/api/v1/usersByName/${
                            req.params.name
                        }?page=0`});
                }
            })

        }
    } else {
        res.status(403);
        res.json({error: "only for admins"})
    }
});
// find::NAME

// update::ID
router.put('/users/:id', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.user.role == "admin" || req.user._id == req.params.id) {

        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            user.getById(req.params.id).then(userResult => {
                if (userResult) {
                    let valid = helpers.validationUpdateUser(req);
                    if (valid == "no error") {
                        return new Promise((resolve, reject) => {
                            cloudinary.v2.uploader.upload_stream({
                                resource_type: 'image'
                            }, function (error, result) {
                                if (error) 
                                    reject(error)
                                 else 
                                    resolve(result)


                                


                            }).end(req.files.photo.data)
                        }).then(resultVideoUrl => {
                            return user.updateUser(req.params.id, req.body.newName, resultVideoUrl.secure_url)
                        }).then((result) => {
                            if (result) {
                                res.status(200);
                                res.json({newUser: result})
                            } else {
                                res.status(200);
                                res.json({newUser: result})
                            }
                        }).catch(err => {
                            res.status(500);
                            res.json({err: "internal server error"})
                        })
                    } else {
                        res.status(422);
                        res.json({err: valid});
                    }

                } else {
                    res.status(404);
                    res.json({err: "user with this id does not found"})
                }
            })
        } else {
            res.status(400)
            res.json({error: "this type is not ObjectId type"});
        }

    } else {
        res.status(403);
        res.json({error: "not enough rights"})
    }
})
// update::ID

// delete::ID
router.delete('/users/delete/:id', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.user.role == "admin" || req.user._id == req.params.id) {
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            user.deleteById(req.params.id).then(result => {
                res.status(200);
                res.json({result: "delete has been successfully"});
            }).catch(err => {
                res.status(500);
                res.json({error: err});
            })
        } else {
            res.status(400)
            res.json({error: "this type is not ObjectId type"});
        }
    } else {
        res.status(403);
        res.json({error: "not enough rights"})
    }
})
// delete::ID

//


// CRUD VIDEO

// create video
router.post('/createVideo', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.user) {
        let new_video = new video();
        new_video.name = req.body.name;
        if (! req.body) {
            res.status(400);
            res.json({error: "feel body please"});
            return
        }
        if (! req.body.name) {
            res.status(400);
            res.json({error: "feel name"});
            return;
        }
        if (req.body.name.length > 30) {
            res.status(413);
            res.json({length: "name is too long"});
            return;
        }
        if (! req.body.description) {
            res.status(400);
            res.json({error: "feel description"});
            return;
        }
        if (req.body.description.length > 300) {
            res.status(413);
            res.json({length: "description is too long"});
            return;
        }
        if (! req.body.authorId) {
            res.status(400);
            res.json({error: "feel authorId"});
            return;
        }
        if (! req.body.authorId.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(404);
            res.json({error: "it is not id type"});
            return;
        }
        user.getById(req.body.authorId).then(result => {
            if (result) {

                new_video.description = req.body.description;
                new_video.authorId = req.body.authorId;
                let validationFiles = helpers.videoValidation(req.files);
                if (validationFiles == "no error") {
                    new_video.registredAt = new Date();
                    return helpers.cloudinaryFileUpload(req.files);
                } else {
                    return Promise.reject(validationFiles);
                }
            } else {
                res.status(404);
                res.json({error: "author with this id does not exist"});
                return;
            }
        }).then(videoFile => {
            if (videoFile) 
                console.log("\n\n\n\n\n\n\n");
            


            new_video.videoUrl = videoFile[0].secure_url
            console.log("\n\n\n\n" + new_video.videoUrl)
            new_video.imageUrl = videoFile[1].secure_url
            console.log("\n\n\n\n" + new_video.imageUrl)
            return video.insert(new_video)

        }).then(result => {
            res.status(200);
            res.json({newVideo: result})
        }).catch(err => {
            res.status(500);
            console.error(err);
            res.json({error: err});
        })
    } else {
        res.status(403);
        res.json({error: "not enough rights"})
    }
})

// create video

//
// read Video
router.get('/getAllVideos', function (req, res) {
    helpers.authentificationAll(req, res);
})
router.get('/getAllVideosApi', passport.authenticate('basic', {session: false}), function (req, res) {
    helpers.authentificationAll(req, res);
})

router.get("/videoGetById/:id", function (req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        video.getById(req.params.id).then(result => {
            if (result) {
                res.status(200);
                res.json({video: result});
            } else {
                res.status(404)
                res.json({error: "video with this id does not exist"});
            }
        }).catch(err => {
            res.status(500);
            res.json({err: "server error"})
            console.error(err);
        })
    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})

router.get("/videosGetByName/:name", function (req, res) {
    helpers.authentificationName(req, res);
})
router.get("/videosGetByNameApi/:name", passport.authenticate('basic', {session: false}), function (req, res) {
    helpers.authentificationName(req, res);
})

router.put("/updateVideo/:id", passport.authenticate('basic', {session: false}), function (req, res) {

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        video.getById(req.params.id).then(result => {
            if (result) {
                if (req.user.role == "admin" || req.user.id == result._id) {
                    console.log(result._id);
                    result.name = req.body.newName;
                    result.description = req.body.description
                    return video.update(result);
                } else {
                    res.status(403);
                    res.json({err: "not enough rights"})
                }
            } else {
                res.status(404);
                res.json({err: "video with this id does not exist"})
            }

        }).then(result => {
            res.status(200);
            res.json({updVideo: result});
        }).catch(() => {
            res.status(500);
            res.json({err: "internal server error UPDATE"})
        })
    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})
router.delete('/videoDeleteById/:id', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        video.getById(req.params.id).then(result => {
            if (result) {
                if (req.user.role == "admin" || req.user.id == result._id) {
                    return video.deleteById(req.params.id);
                } else {
                    res.status(403);
                    res.json({err: "not enough rights"})
                }
            } else {
                res.status(404);
                res.json({err: "video with this id does not exist"})
            }
        }).then(result => {
            res.status(200);
            res.json({status: "video has been delete"});
        }).catch(() => {
            res.status(500);
            res.json({err: "internal server error DELETE"})
        })
    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})
// CRUD PLAYLIST
// create PLaylist
router.post("/createPlayList", passport.authenticate('basic', {session: false}), function (req, res) {
    let valid = helpers.validationCreatePlayList(req);
    console.log(req.body);
    if (valid == "no error") {
        let newPlayList = new PlayList(req.body.name, req.user._id, req.body.description);
        PlayList.createPlaylist(newPlayList).then(result => {
            res.status(200);
            res.json({newPlayList: result})
        }).catch(err => {
            res.status(500);
            res.json({err: "err create PlayList"});
        })
    } else {
        res.status(422);
        res.json({err: valid})
    }
})

//
// read playlist
router.get('/getUserPlayList', checkAuth, function (req, res) {
    if (req.query.page) {
        let page = req.query.page;

        if ((parseInt(page) > 0)) {

            return user.getPaginationUserPlayLists(req.user.id, page).then(([arrayOfIndexOnPage, playlistsCount]) => {
                console.log("count = " + playlistsCount);
                if (playlistsCount == 0) {
                    return Promise.reject("user has not playlists");
                } else {
                    console.log("page=" + req.query.page);
                    if (arrayOfIndexOnPage.length == 0) {
                        return Promise.reject("user has not playlists");
                    } else {

                        let promises = [];
                        for (let i = 0; i < arrayOfIndexOnPage.length; i++) {
                            console.log("arrayOfIndexOnPage.length " + i);

                            promises.push(PlayList.getObjectByid(arrayOfIndexOnPage[i]))

                        }
                        return Promise.all([Promise.all(promises), playlistsCount]);

                    }

                }
            }).then(([arrayOfPlaylists, count]) => {


                let promises = [];
                for (let i = 0; i < arrayOfPlaylists.length; i++) {
                    if (!arrayOfPlaylists[i].description) {
                        arrayOfPlaylists[i].description = "there is no desc here"
                    }
                    let playListsVideos = [];
                    for (let j = 0; j < 3; j++) {

                        if (arrayOfPlaylists[i].videosId[j]) {
                            promises.push(video.getById(arrayOfPlaylists[i].videosId[j]).then(oneOfVideo => {
                                playListsVideos.push(oneOfVideo);
                            }))
                        }


                    }
                    arrayOfPlaylists[i].Videos = playListsVideos;

                }
                promises.push(Promise.resolve(arrayOfPlaylists));
                return Promise.all([Promise.all(promises), count]);
            }).then(([result, count]) => {
                playlists = result[result.length - 1]
                res.status(200);
                res.json({
                    allPlayLists: playlists,
                    countOfPages: Math.ceil(count / 3)
                })
            }).catch(err => {
                if (err == "user has not playlists") {
                    console.error(err);
                    res.status(405);
                    res.json({err: err});
                } else {
                    console.error(err);
                    res.status(404);
                    res.json({err: err});
                }
            })
        } else {
            res.status(422); // / not valid data
            res.json({err: "not valid data", allPlayLists: []});
        }
    } else {
        res.status(400);
        res.json({
            err: "forgot page parameter",
            link: {
                nextPage: `/api/v1/getUserPlayList?page=0`
            },
            allPlayLists: []
        })
    }
})


router.get('/getAllPlaylists', checkAuth, function (req, res) {
    if (req.query.page) {
        if ((parseInt(req.query.page) > 0)) {
            PlayList.getAllPlayListsWithoutPagination().then(result => {
                return Promise.all([
                    PlayList.getAllPlayLists(req.query.page),
                    result
                ]);
            }).then(result => {
                if (result[0].length != 0) {
                    res.status(200);
                    res.json({
                        playlists: result[0],
                        link: {
                            page0: "/api/v1/getAllPlaylists?page=0",
                            lastPage: `/api/v1/getAllPlaylists?page=${
                                Math.floor(result[1].length / 5)
                            }`
                        }
                    });
                } else {
                    res.status(404);
                    res.json({attention: "pystota"});
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
        PlayList.getAllPlayLists(0).then(result => {
            res.status(400);
            res.json({
                err: "forgot page parameter",
                link: {
                    nextPage: `/api/v1/getAllPlaylists?page=0`
                }
            })
        });

    }
})
router.get('/getPlayListById', checkAuth, function (req, res) {
    console.log("ERROR BAKAFLAT");
    let countOnPage = 5;
    console.log(req.query.playlistId);
    if (req.query.playlistId.match(/^[0-9a-fA-F]{24}$/)) {

        PlayList.getById(req.query.playlistId).then(result => {
            if (result.authorId == req.user.id) {
                if (parseInt(req.query.page) > 0) {
                    let page = req.query.page;
                    if (result.videosId.length == 0) {
                        return Promise.reject("playlist does not contain any video");
                    } else {
                        let paginationArray = result.videosId.slice(countOnPage * (page - 1), (page - 1) * countOnPage + countOnPage);
                        if (paginationArray.length == 0) {
                            return Promise.reject("this page does not contain videos");
                        } else {
                            let promises = [];
                            for (let i = 0; i < paginationArray.length; i++) {
                                promises.push(video.getById(paginationArray[i]));
                            }
                            return Promise.all([Promise.all(promises), result.videosId.length]);
                        }

                    }
                } else {
                    return Promise.reject("not valid data");
                }
            } else {
                return Promise.reject("nema prav");
            }
        }).then(([videos, count]) => {
            console.log("videos =" + videos);
            console.log("count=" + count);
            res.status(200);
            res.json({
                videos: videos,
                count: Math.ceil(count / 5)
            });

        }).catch(err => {
            if (err = "playlist does not contain any video") {
                console.log("paramtamtam");
                res.statusMessage = "playlist does not contain videos"
                console.log("paramtamysysy");
                console.log("krak = " + res.statusMessage);
                res.status(404);
                res.json({kek: 'spek'});
            } else {
                console.error(err);
                res.status(404);
                res.render('err', {err: err});
            }
        })

    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})
router.get('/getPlayListByName/:name', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.query.page) {
        if ((parseInt(req.query.page) > 0 || req.query.page == 0)) {

            PlayList.findAllByName(req.query.name).then(result => {
                return Promise.all([
                    PlayList.findByName(req.params.name, req.query.page),
                    result
                ])
            }).then(result => {
                if (result[0].length != 0) {
                    res.status(200);
                    res.json({
                        videos: result[0],
                        link: {
                            page0: `/api/v1/getPlayListByName/${
                                req.params.name
                            }?page=0`,
                            lastPage: `/api/v1/getPlayListByName?page=${
                                Math.floor(result[1].length / 5)
                            }`
                        }
                    });
                } else {
                    res.status(404);
                    res.json({attention: "pystota"});
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
        PlayList.findByName(req.params.name, 0).then(result => {
            if (result.length == 0) {
                res.status(404);
                res.json({attention: "playlist with this name do not exist"});
            } else {
                res.status(200);
                res.json({videos: result, nextPage: `/api/v1/getPlayListByName/${
                        req.params.name
                    }?page=0`});
            }
        })

    }
})
router.put("/updatePlayListById/:id", passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        PlayList.getPlayListById(req.params.id).then(result => {
            if (result) {
                if (req.user.role == "admin" || req.user.id == result.authorId) {

                    let valid = helpers.validationUpdatePlaylist(req.body);
                    if (valid == "no error") {

                        return PlayList.updatePlayList(req.params.id, req.body.newName, req.body.newDesc);
                    } else {

                        res.status(422);
                        res.json({err: valid});
                        return;
                    }
                } else {
                    res.status(403);
                    res.json({err: "not enough rights"})
                }
            } else {
                res.status(404);
                res.json({err: "playlist with this id does not exist"})
            }

        }).then(result => {
            if (result) {

                res.status(200);
                res.json({updPlaylist: result});
            }
            return;
        }).catch((err) => {

            res.status(500);
            console.error(err);
            res.json({err: err})
            return;
        })
    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})
router.delete('/playlistDeleteById/:id', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        PlayList.getPlayListById(req.params.id).then(result => {
            if (result) {
                if (req.user.role == "admin" || req.user.id == result.authorId) {
                    return PlayList.deletePlayListById(req.params.id);
                } else {
                    res.status(403);
                    res.json({err: "not enough rights"})
                }
            } else {
                res.status(404);
                res.json({err: "playlist with this id does not exist"})
            }
        }).then(result => {
            res.status(200);
            res.json({status: "playlist has been delete"});
        }).catch(() => {
            res.status(500);
            res.json({err: "internal server error DELETE"})
        })
    } else {
        res.status(400)
        res.json({error: "this type is not ObjectId type"});
    }
})
router.get('/videosScript', passport.authenticate('basic', {session: false}), function (req, res) {
    if (req.query.name) {
        video.findAllByName(req.query.name).then(videos => {
            console.log(videos);
            if (Number(req.query.page) < Math.floor(videos.length / 5) || req.query.page == 0) {
                return Promise.all([
                    videos.length, video.findByName(req.query.name, req.query.page)
                ])
            } else {
                return Promise.reject("not valid URL");
            }
        }).then(([pages, videosArray]) => {
            if (req.user.role == "admin") {
                res.json({
                    Videos: videosArray,
                    html_text: text,
                    countOfPages: pages,
                    pageNumber: req.query.page,
                    bag: "true",
                    userName: req.user.login
                })
            } else {
                console.log(videosArray);
                res.json({Videos: videosArray, html_text: text, countOfPages: pages, pageNumber: req.query.page, userName: req.user.login})
            }
        }).catch((err) => {
            console.error(err)
        })
    } else {
        video.getAll().then(videos => {
            if (Number(req.query.page) < Math.floor(videos.length / 5) || req.query.page == 0) {
                return Promise.all([
                    videos.length, video.getAllApiVersion(req.query.page)
                ])
            } else {
                return Promise.reject("not valid URL");
            }
        }).then(([pages, videosArray]) => {
            if (req.user.role == "admin") {
                res.json({
                    Videos: videosArray,
                    html_text: text,
                    countOfPages: pages,
                    pageNumber: req.query.page,
                    bag: "true",
                    userName: req.user.login
                })
            } else {
                res.json({Videos: videosArray, html_text: text, countOfPages: pages, pageNumber: req.query.page, userName: req.user.login})
            }
        }).catch((err) => {
            console.error(err)
        })
    }
})
router.get('/viewers/:videoId', function (req, res) {
    if (req.params.videoId.match(/^[0-9a-fA-F]{24}$/)) {

        videoId = req.params.videoId
        video.getAllViews(videoId).then(views => {
            let promiseViews = [];
            for (let i = 0; i < views.length; i++) {
                promiseViews.push(view.getById(views[i]));
            }

            return Promise.all(promiseViews);
        }).then(views => {
            console.log("STAGE 2)")
            let users = [];
            for (let i = 0; i < views.length; i++) {
                users.push(user.getUserObjectById(views[i].viewerId));
            }
            return Promise.all([views, Promise.all(users)]);
        }).then(([views, users]) => {
            let renderArray = [];
            for (let i = 0; i < views.length; i++) {
                let renderObject = {};
                renderObject.registredAt =  new Date(views[i].registredAt).toLocaleString();
                renderObject.avaUrl = users[i].avaUrl;
                renderObject.fullname = users[i].fullname;
                renderObject.id = users[i].id;
                renderArray.push(renderObject);
            }
            res.status(200);
            res.json({views: renderArray,count:renderArray.length});
        }).catch(err => {
            console.log("PIPARATATA")
            console.log(err);
            res.status(500);
            res.json(boob);
        })
    } else {
        res.status(400);
        res.json({err: "invalid Id"})
    }
})
module.exports = router;
