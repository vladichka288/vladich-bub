const PlayList = require('./models/playlist')
const View = require('./models/view');
const fs = require('fs').promises;
const express = require('express');
const helpers = require('./routes/funcHelpers/funcHelpers')
const mustache = require('mustache-express');
const path = require('path');
const telegramBot = require('./routes/telegramBot/telegram.js');
const app = express();
const viewsDir = path.join(__dirname, 'views');
app.engine('mst', mustache(path.join(viewsDir, "partials")));
app.set('views', viewsDir);
app.set('view engine', 'mst');
const busboyBodyParser = require('busboy-body-parser');
app.use(express.static('public'));
app.use(express.static('data/fs'));
const video = require('./models/videos');
let text = "<div class=\"alert\"><span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span><strong>Danger!</strong> Indicates a dangerous or potentially negative action.</div>"
app.use(busboyBodyParser());
app.use(busboyBodyParser({limit: '35mb', multi: true}));
// ROUTER
// ROUTER

// ROUTER
// ROUTER
const mongoose = require('mongoose'); //
const config = require('./config')
const databaseUrl = config.DatabaseUrl;
const serverPort = config.ServerPort;
const connectOptions = {
    useNewUrlParser: true
};
//
const textIneed = "<li style =\"width : 15vw;\"><a href=\"/users\" style =\"width: 15vw;\"><i  style =\"width:3vw\" class=\"fa fa-users\" aria-hidden=\"true\"></i> Users</a></li>";


const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
app.use(cookieParser());
app.use(session({
    secret: config.secret, // 'SEGReT$25_'
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

let authRouter = require('./auth');
let apiRouter = require('./routes/api');
let developerRouter = require('./routes/developer');
app.use('/auth', authRouter);
app.use('/api/v1', apiRouter);
app.use('/developer/v1', developerRouter);


mongoose.connect(databaseUrl, connectOptions).then(() => console.log('Mongo database connected')).then(() => app.listen(serverPort, function () {
    console.log('Server is ready');
})).catch(() => console.log('ERROR: Mongo database not connected'));
const user = require('./models/user');
const cloudinary = require('cloudinary');
cloudinary.config({cloud_name: "dlaoof6av", api_key: "367629461961258", api_secret: "aB7eI1HaXFNLAjqb3GBNOTG20KQ"});
require('./passport');

function pagesCount(length) {
    if ((length - 1) <= 0) 
        return 0;
     else 
        return length - 1


    


} //


app.post("/insert", checkAuth, function (req, res) {
    let new_video = new video();
    new_video.name = req.body.name;
    if (req.body.name.length > 30) {
        console.log("err");
        res.render('err', {err: "ne xutryite"});
        return;
    }
    new_video.authorId = req.user.id;
    new_video.description = req.body.description;
    if (req.body.description.length > 300) {
        console.log("err2");
        res.render('err', {err: "ne xutryite"});
        return;
    }
    if (! req.files.imageFile) {
        console.log("err3");;
        res.render('err', {err: "upload picture!!!"});
        return;
    }
    if (! req.files.videoFile) {
        console.log("err4");;
        res.render('err', {err: "upload video!!!"});
        return;
    }
    if (req.files.videoFile.mimetype != "video/mp4") {
        res.render('err', {err: "video must be mp4 formated!!!"});
        return;
    }
    if ((req.files.imageFile.mimetype != "image/jpeg") && (req.files.imageFile.mimetype != "image/jpg") && (req.files.imageFile.mimetype != "image/png")) {
        res.render('err', {err: "photo must be png jpeg jpg formated!!!"});
        return;
    }
    if (req.files.videoFile.size > 30000000) {
        res.render('err', {err: "video file size limit exceed"});
        return;
    }
    if (req.files.imageFile.size > 5000000) {
        res.render('err', {err: "photo file size limit exceed"});
        return;
    }
    if (! req.body.name) {
        console.log("err");
        res.render('err', {err: "name is required field"});
        return;
    }
    new_video.registredAt = new Date(); //
    console.log(new_video.imageUrl);

    let promise1 = new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({
            resource_type: 'video'
        }, function (error, result) {
            console.log(result, error)
            if (error) 
                reject(error)
             else 
                resolve(result)


            


        }).end(req.files.videoFile.data)
    })
    let promise2 = new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({
            resource_type: 'image'
        }, function (error, result) {
            console.log(result, error)
            if (error) 
                reject(error)
             else 
                resolve(result)


            


        }).end(req.files.imageFile.data)
    })
    Promise.all([promise1, promise2]).then(dataFiles => {
        new_video.videoUrl = dataFiles[0].secure_url
        console.log("\n\n\n\n" + new_video.videoUrl)
        new_video.imageUrl = dataFiles[1].secure_url
        console.log("\n\n\n\n" + new_video.imageUrl)
        return video.insert(new_video)
    }).then(result => {
        console.log("we here")
        return user.addVideo(result._id, req.user._id);
    }).then((videoId) => {
        return Promise.all([
            user.getById(req.user.id),
            videoId
        ])

    }).then(([res, videoId]) => {
        let promises = [];
        for (let i = 0; i < res.subscribedUsers.length; i++) {
            promises.push(user.getById(res.subscribedUsers[i]))
        }
        return Promise.all([Promise.all(promises), videoId]);

    }).then(([subscribedUsers, videoId]) => {
        let promises = [];
        for (let i = 0; i < subscribedUsers.length; i++) {
            promises.push(telegramBot.sendMessage({chat_id: subscribedUsers[i].chatId, text: `${
                    req.user.fullname
                } uploaded new video https://vladich-bub.herokuapp.com/tasks/${videoId}`, link: `/`}));
        }
        return Promise.all(promises);
    }).then((result) => {
        res.status(200);
        if (req.user.role == "admin") {
            res.render("myVideos", {
                userName: req.user.fullname,
                avaUrl: req.user.avaUrl,
                bag: "true",
                menu: "Exit",
                userId: req.user.id
            });
        } else {
            res.render("myVideos", {
                userId: req.user.id,
                userName: req.user.fullname,
                avaUrl: req.user.avaUrl,
                menu: "Exit"

            });
        }

    }).catch(err => {
        console.error(err);
        res.render('err', {err: "insert error"});
    })


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
function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        console.log("nbabax");
        res.status(403);
        res.render('err', {err: "only for admin"});
        return;
    };
    console.log("RTAX");
    next();
}
// //HOME
app.get("/", (req, res) => {
    if (req.user) {
        console.log(req.user.avaUrl);
        if (req.user.role == "admin") {
            res.render("index", {
                bag: "true",
                userId: req.user.id,
                userName: req.user.fullname,
                avaUrl: req.user.avaUrl,
                menu: "Exit"
            });
            return;
        }
        console.log(req.user.avaUrl);
        res.render("index", {
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit",
            userId: req.user.id
        });
        return;
    }
    res.render("index", {
        userName: "not auth",
        menu: "Log in"
    });
    return;
});
app.get("/updAdmin",checkAdmin, (req, res) => {

    user.updateToAdminById(req.query.id).then((result => {
        res.redirect(`users/${
            req.query.id
        }`)
    })).catch(err => {
        res.render("err", {err: "error upd user"})
    })
})
app.get("/updUser",checkAdmin, (req, res) => {
    user.downgradeToUserById(req.query.id).then((result => {
        res.redirect(`/users/${
            req.query.id
        }`)
    })).catch(err => {
        console.error(err)
        res.render("err", {err: "error upd user"})
    })
})
// HOME
// CREATE NEW VIDEO
app.get("/new", checkAuth, function (req, res) {
    console.log("new");
    res.render('new', {
        userId: req.user.id,
        userName: req.user.fullname,
        avaUrl: req.user.avaUrl,
        menu: "Exit"
    });
});
// // CREATE NEW VIDEO
app.get('/about', function (req, res) {
    if (req.user) {
        console.log(req.user.avaUrl);
        if (req.user.role == "admin") {
            res.render("about", {
                bag: "true",
                userId: req.user.id,
                userName: req.user.fullname,
                avaUrl: req.user.avaUrl,
                menu: "Exit"
            });
            return;
        }
        console.log(req.user.avaUrl);
        res.render("about", {
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit",
            userId: req.user.id
        });
        return;
    }
    res.render("about", {
        userName: "not auth",
        menu: "Log in"
    });
    return;
})
// //
app.get('/userPage', checkAuth, function (req, res) {

    if (req.query.userId) {
        user.getById(req.query.userId).then(result => {
            
            console.log("req.user.role = ",req.user.role)
            if(req.user.role !="user"){
                if (result.subscribedUsers.indexOf(req.user.id) == -1) {
                    let data = new Date(result.registredAt).toLocaleString()
                    console.log("data takaka");
                    res.render('users/user', {
                        photoUrl: result.avaUrl,
                        name: result.fullname,
                        date: data,
                        role: result.role,
                        videosCount: result.videos.length,
                        playlistCount: result.playlists.length,
                        userId: req.query.userId,
                        subscribe: true,
                        Admin:true
    
                    })
                } else {
                    let data = new Date(result.registredAt).toLocaleString()
                    console.log("pissss");
                    res.render('users/user', {
                        photoUrl: result.avaUrl,
                        name: result.fullname,
                        date: data,
                        role: result.role,
                        videosCount: result.videos.length,
                        playlistCount: result.playlists.length,
                        userId: req.query.userId,
                        Admin:true
                    })
                }
    
            }else{
                if (result.subscribedUsers.indexOf(req.user.id) == -1) {
                    let data = new Date(result.registredAt).toLocaleString()
                    console.log("data takaka");
                    res.render('users/user', {
                        photoUrl: result.avaUrl,
                        name: result.fullname,
                        date: data,
                        role: result.role,
                        videosCount: result.videos.length,
                        playlistCount: result.playlists.length,
                        userId: req.query.userId,
                        subscribe: true
    
                    })
                } else {
                    let data = new Date(result.registredAt).toLocaleString()
                    console.log("pissss");
                    res.render('users/user', {
                        photoUrl: result.avaUrl,
                        name: result.fullname,
                        date: data,
                        role: result.role,
                        videosCount: result.videos.length,
                        playlistCount: result.playlists.length,
                        userId: req.query.userId
                    })
                }
            }
        })
    } else {
        res.status(403);
        res.render('err', {err: "not valid data"});
    }

})
app.get('/users/:id', checkAuth,  function (req, res) {
    user.getById((req.params.id)).then(user => {
        if (user) {
            if (req.user.role == "admin") {
                console.log("KLAZ");
                res.render('users/user', {
                    userId: req.user.id,
                    Image: user.avaUrl,
                    Login: user.login,
                    Fullname: user.fullname,
                    Date: user.registredAt,
                    role: user.role,
                    userId: req.params.id,
                    bag: "true",
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                })
            } else {
                console.log("PULZ");
                res.render('users/user', {
                    userId: req.user.id,
                    Image: user.avaUrl,
                    Login: user.login,
                    Fullname: user.fullname,
                    Date: user.registredAt,
                    role: user.role,
                    toAdmin: "true",
                    userId: req.params.id,
                    bag: "true",
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                })
            }
        } else {
            res.render('err', {err: "invalid user id!!!"});
        }
    }).catch(err => {
        res.status(404);
        console.error(err);
        res.render('err', {err: "invalid user id!!!"});
    })
});
// //


app.get('/videosAll', function (req, res) {
    if (req.query.userId) {
        if (! req.user) {
            res.render('tasks', {
                menu: "Log in",
                userName: "not auth",
                userId: req.query.userId,
                userFilter: req.query.userId
            });
        } else {
            if (req.user.role == "admin") {
                res.render('tasks', {
                    userId: req.user.id,
                    bag: "true",
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit",
                    userFilter: req.query.userId
                });
            } else {
                res.render('tasks', {
                    userId: req.user.id,
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit",
                    userFilter: req.query.userId
                });
            }
        }
    } else {
        if (! req.user) {
            res.render('tasks', {
                menu: "Log in",
                userName: "not auth"

            });
        } else {
            if (req.user.role == "admin") {
                res.render('tasks', {
                    userId: req.user.id,
                    bag: "true",
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                });
            } else {
                res.render('tasks', {
                    userId: req.user.id,
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                });
            }
        }
    }


});
app.get("/subscribeOnUser", checkAuth, function (req, res) {
    if (req.query.userId) {
        let subsId = req.user.id;
        console.log("id = " + req.query.userId);
        if (req.user.chatId != "") {
            return user.addSubscribe(req.query.userId, subsId).then(result => {
                res.status(200);
                res.redirect(`/userPage?userId=${
                    req.query.userId
                }`);
            }).catch(err => {
                console.error(err);
                res.status(500);
                res.render('err', {err: err});
            });
        } else {
            console.log(req.user.fullname);
            res.status(200);
            res.redirect(`https://web.telegram.org/#/im?p=@Crow_vlad_bot`);
        }

    }
})
app.get("/UnsubscribeOnUser", checkAuth, function (req, res) {
    let subsId = req.user.id;
    if (req.user.chatId) {
        return user.unsubscribe(req.query.userId, subsId).then(result => {
            res.status(200);
            res.redirect(`/userPage?userId=${
                req.query.userId
            }`);
        }).catch(err => {
            console.error(err);
            res.status(500);
            res.render('err', {err: err});
        });
    } else {
        res.redirect(300, `https://телеграм.онлайн/#/im?p=@Crow_vlad_bot`);
    }

})

app.get("/users", checkAuth, checkAdmin, function (req, res) {
    console.log("in |all users |");
    user.getAll().then(Users => {
        res.render('users', {
            Users,
            bag: "true",
            userId: req.user.id,
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit"
        })
    }).catch(err => {
        res.status(404)
        console.error(err);
        res.render('err');
    })
});


app.get('/tasks/:id', checkAuth, function (req, res) {

    video.getById((req.params.id)).then(result => {
        let views = [];
        for (let i = 0; i < result.views.length; i++) {
            views.push(View.getById(result.views[i]));
        }
        return Promise.all(views);
    }).then((views) => {
        console.log("views" + views);
        let checked = false;
        for (let i = 0; i < views.length; i++) {
            if (views[i].viewerId == req.user.id) {
                checked = true;
            }
        }
        if (checked == false) {
            let view = new View(new Date(), req.user.id);
            return View.createView(view)
        }
    }).then(result => {
        console.log("result", result);
        if (result) {
            console.log(result);
            return video.addView(req.params.id, result.id);
        }
    }).then(result => {
        return video.getById((req.params.id))
    }).then(video => {
        return Promise.all([
            video, user.getById(video.authorId),
        ])
    }).then(([result, authorVideo]) => {
        return Promise.all([
            video.getAllViews(result.id),
            result,
            authorVideo
        ])
    }).then(([views, result, authorVideo]) => {
        console.log(views);
        if (req.user) {
            if (req.user.role == "admin") {
                res.render('tasks/task', {
                    id: result.id,
                    Video: result.videoUrl,
                    Name: result.name,
                    Description: result.description,
                    Date: helpers.getCurrnetDate(result.registredAt, new Date()),
                    bag: "true",
                    userId: req.user.id,
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit",
                    display: "block",
                    _id: req.params.id,
                    authorName: authorVideo.fullname,
                    photoUrl: authorVideo.avaUrl,
                    authorId: authorVideo.id,
                    views: views.length
                });
                return;
            } else {
                if (req.user.videos.indexOf(req.params.id) !== -1) {
                    console.log("parm")
                    res.render('tasks/task', {
                        id: result.id,
                        Video: result.videoUrl,
                        Name: result.name,
                        Description: result.description,
                        Date: helpers.getCurrnetDate(result.registredAt, new Date()),
                        display: "block",
                        userId: req.user.id,
                        userName: req.user.fullname,
                        avaUrl: req.user.avaUrl,
                        menu: "Exit",
                        _id: req.params.id,
                        authorName: authorVideo.fullname,
                        photoUrl: authorVideo.avaUrl,
                        authorId: authorVideo.id,
                        views: views.length
                    });
                    return;
                } else {
                    res.render('tasks/task', {
                        id: result.id,
                        Video: result.videoUrl,
                        Name: result.name,
                        Description: result.description,
                        Date: helpers.getCurrnetDate(result.registredAt, new Date()),
                        display: "none",
                        userId: req.user.id,
                        userName: req.user.fullname,
                        avaUrl: req.user.avaUrl,
                        menu: "Exit",
                        _id: req.params.id,
                        authorName: authorVideo.fullname,
                        photoUrl: authorVideo.avaUrl,
                        authorId: authorVideo.id,
                        views: views.length
                    });
                    return;

                }


            }
        } else {
            res.render('tasks/task', {
                id: result.id,
                Video: result.videoUrl,
                Name: result.name,
                Description: result.description,
                Date: helpers.getCurrnetDate(result.registredAt, new Date()),
                userName: "not auth",
                menu: "Log in",
                display: "none",
                authorName: authorVideo.fullname,
                photoUrl: authorVideo.avaUrl,
                authorId: authorVideo.id,
                views: views.length

            });
        }
    }).catch(err => {
        res.status(404)
        console.error(err);
        res.render('err', {err: "invalid id!!!"});
    });
})
app.post('/tasks/:id', checkAuth, function (req, res) {
    let videoId = req.params.id;
    if (req.user.role == "admin") {
        return video.getById(req.params.id).then(result => {
            return user.deleteVideo(result.authorId, req.params.id);
        }).then(() => {
            return video.deleteById((req.params.id))
        }).then(() => {
            return PlayList.getPlaylistsWithThisVideo(videoId);
        }).then(arrayOfPlaylists => {
            let promises = [];
            for (playlist of arrayOfPlaylists) {
                promises.push(PlayList.deleteVideoFromPlayList(playlist.id, videoId))
            }
            return Promise.all(promises);
        }).then(() => {
            return user.getById(req.user.id)
            res.redirect('/videosAll')
        }).catch(err => {
            res.status(404)
            console.error(err);
            res.render('err');
        })
    } else {
        if (req.user.videos.indexOf(req.params.id) !== -1) {
            return video.getById(req.params.id).then(result => {
                return user.deleteVideo(req.user.id, req.params.id);
            }).then(() => {
                return video.deleteById((req.params.id))
            }).then(() => {
                return PlayList.getPlaylistsWithThisVideo(videoId);
            }).then(arrayOfPlaylists => {
                let promises = [];
                for (playlist of arrayOfPlaylists) {
                    promises.push(PlayList.deleteVideoFromPlayList(playlist.id, videoId))
                }
                return Promise.all(promises);
            }).then(() => {
                res.redirect('/videosAll')
            }).catch(err => {
                res.status(404)
                console.error(err);
                res.render('err');
            })
        } else {
            res.render('err', {err: "пососеш ок!!!"});
        }
    }
});
app.get("/myVideos", checkAuth, function (req, res) {
    res.status(200);
    res.render("myVideos", {
        userId: req.user.id,
        userName: req.user.fullname,
        avaUrl: req.user.avaUrl,
        menu: "Exit"
    });
})
app.get("/api/users", checkAuth, checkAdmin, function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            user.getAll().then(result => (res.json(result))).catch(err => {
                console.error(err);
                res.render('err');
            })

        }
        user.getAll().then(result => (res.json(result))).catch(err => {
            console.error(err);
            res.render('err');
        });
    };
});
app.get('/api/users/:id', checkAuth, checkAdmin, function (req, res) {

    user.getById(req.params.id).then(result => {
        res.json(result);
    }).catch(err => {
        console.error(err);
        res.render('err', {err: "invalid id!!!"});
    })
});
app.get('/playlists', checkAuth, function (req, res) {
    PlayList.getAllPlayLists().then(allPlayLists => {
        let promises = [];
        for (let i = 0; i < allPlayLists.length; i++) {
            if (!allPlayLists[i].description) {
                allPlayLists[i].description = "there is no desc here"
            }

            let playListsVideos = [];
            let counter = 0;
            for (let j = 0; j < allPlayLists[i].videosId.length; j++) {

                promises.push(video.getById(allPlayLists[i].videosId[j]).then(oneOfVideo => {
                    if (oneOfVideo && counter < 3) {
                        counter++;
                        console.log("vak");
                        playListsVideos.push(oneOfVideo);
                    }
                }))
            }
            allPlayLists[i].Videos = playListsVideos;
        }
        promises.push(Promise.resolve(allPlayLists));
        return Promise.all(promises)

    }).then((result) => {
        if (req.user) {
            if (req.user.role == "admin") {
                res.render('playlists', {
                    allPlayLists: result[result.length - 1],
                    bag: "true",
                    userId: req.user.id,
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                });
            } else {
                res.render('playlists', {
                    userId: req.user.id,
                    allPlayLists: result[result.length - 1],
                    userName: req.user.fullname,
                    avaUrl: req.user.avaUrl,
                    menu: "Exit"
                });
            }
        } else {
            res.render('playlists', {
                allPlayLists: result[result.length - 1],
                userName: "not auth",
                menu: "Log in"

            });
        }
    }).catch(err => {
        res.status(404)
        console.error(err);
        res.render('err');
    })
})
app.post("/updateUserPhoto", checkAuth, function (req, res) {


    if (! req.files.photoFile) {
        console.log("err3");;
        res.render('err', {err: "upload picture!!!"});
        return;
    }
    if ((req.files.photoFile.mimetype != "image/jpeg") && (req.files.photoFile.mimetype != "image/jpg") && (req.files.photoFile.mimetype != "image/png")) {
        res.render('err', {err: "photo must be png jpeg jpg formated!!!"});
        return;
    }
    if (req.files.photoFile.size > 5000000) {
        res.render('err', {err: "photo file size limit exceed"});
        return;
    }

    let promise = new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({
            resource_type: 'image'
        }, function (error, result) {
            console.log(result, error)
            if (error) 
                reject(error)
             else 
                resolve(result)


            


        }).end(req.files.photoFile.data)
    })
    promise.then(dataFiles => {

        imageUrl = dataFiles.secure_url
        console.log("\n\n\n\n" + imageUrl)
        return user.userUpdatePhoto(req.user._id, imageUrl);

    }).then(result => {
        res.status(200);
        res.redirect('/');
    }).catch(err => {
        console.error(err);
        res.render('err', {err: "insert error"});
    })
})
app.get('/newPlayList', checkAuth, function (req, res) {
    console.log(req.user.login)

    res.render('newPlayList', {
        userId: req.user.id,
        userName: req.user.fullname,
        avaUrl: req.user.avaUrl,
        menu: "Exit"
    })
})
app.post('/insertPlayList', function (req, res) {
    if (req.body.name.length > 30) {
        res.render('err');
        return;
    }
    if (req.body.description.length > 200) {
        res.render('err');
        return;
    }
    let newPlayList = new PlayList(req.body.name, req.user.id, req.body.description);
    PlayList.createPlaylist(newPlayList).then(result => {
        return user.addPlaylist(result.id, req.user.id);
    }).then(result => {
        res.redirect('/playlists')
    }).catch(err_2 => {
        res.render('err', {err: err_2});
    })
});
app.get('/selectedPlayList', checkAuth, function (req, res) {
    if (req.query.playlistId) 
        res.render('selectedPlayList', {
            userId: req.user.id,
            playlistId: req.query.playlistId,
            PlaylistId: req.query.playlistId,
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit"
        });
     else {
        res.status(200);
        res.send("дай бог тебе по сасалам");
    }
})
app.post('/deleteVideoFromPlaylist', checkAuth, function (req, res) {
    let playlistId = req.body.playlistId;
    let videoId = req.body.videoId;
    PlayList.getById(playlistId).then(result => {
        if (result.authorId == req.user.id) {
            return PlayList.deleteVideoFromPlayList(result.id, videoId)
        } else {
            res.status(403);
            res.render('err', 'dai bog tebe po sosalam');
        }
    }).then(result => {
        res.status(200);
        res.redirect(`/selectedPlayList?page=1&playlistId=${playlistId}`)
    }).catch(err => {
        console.log(err);
        if (err == "BYDY REZAT BLAAAA") {
            res.status(400);
            res.render('err', {err: "BYDY REZAT BLAAAA"})
        } else {
            res.status(404)
            console.error(err);
            res.render('err');
        }

    })
})
app.get('/addVideoToPlayList', checkAuth, function (req, res) {
    let videosId = req.query.videoId;
    user.getAllUserPlaylists(req.user).then(result => {
        if (result.length == 0) {
            res.redirect('/newPlayList');
        } else {
            let promises = [];
            for (let id of result) {
                promises.push(PlayList.getById(id));
            }
            return Promise.all(promises);
        }
    }).then(result => {
        console.log(result);
        playlists = [];
        for (let playlist of result) {
            if (playlist.videosId.indexOf(videosId) == -1) {
                playlists.push(playlist.name);
            }
        }
        res.render('addVideoToPlayList', {
            userId: req.user.id,
            id: req.query.videoId,
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit",
            playlists: playlists
        })
    }).catch(err => {
        console.error(err);
        res.status(500);

    })
})
app.post('/insertVideoToPlayList', checkAuth, function (req, res) {

    PlayList.addVideoToPlayList(req.user.id, req.body.name, req.body.videoId).then(() => {
        console.log(req.body.name);
        console.log(req.body.videoId);
        res.redirect('/playlists')
    }).catch(err_2 => {
        res.status(404)
        console.error(err_2);
        res.render('err', {err: err_2});
    })
})
app.get('/editPlayList', checkAuth, function (req, res) {
    PlayList.getPlayListById(req.query.id).then(result => {
        res.render('editPlayList', {
            userId: req.user.id,
            name: result.name,
            desc: result.description,
            id: req.query.id,
            userName: req.user.fullname,
            avaUrl: req.user.avaUrl,
            menu: "Exit"
        });
    }).catch(err_2 => {
        res.status(404)
        console.error(err_2);
        res.render('err', {err: "server error"});
    })
})
app.post('/editList', checkAuth, function (req, res) {
    console.log("\n\n" + req.body.listId + req.body.name + "\n\n");
    PlayList.updatePlayList(req.body.listId, req.body.name, req.body.description).then(result => {
        res.redirect(`/playlists`)
    }).catch(err_2 => {
        res.status(404)
        console.error(err_2);
        res.render('err', {err: "update ne ydalca"});
    })
})
app.post('/deletePlayList', checkAuth, function (req, res) {
    let playlistId = req.body.playlistId;
    PlayList.getById(playlistId).then(result => {
        if (result) {
            if (result.authorId == req.user.id) {
                return PlayList.deletePlayListById(playlistId);
            } else {
                return Promise.reject("not enough rights");
            }
        } else {
            return Promise.reject("playlist does not exist");
        }
    }).then(result => {
        return user.deletePlayList(req.user.id, playlistId);
    }).then(result => {
        res.status(200);
        res.redirect('/playlists');
    }).catch(err => {
        if (err == "not enough rights") {
            res.status(403);
            res.render('err', {err: err});
        } else if (err == "playlist does not exist") {
            res.status(400);
            res.render('err', {err: err});
        } else {
            res.status(500);
            res.render('err', {err: "Ooops"});
        }


    })
})
app.get('/createPlayList', checkAuth, function (req, res) {
    res.render('newPlayList', {
        userId: req.user.id,
        userName: req.user.fullname,
        avaUrl: req.user.avaUrl,
        menu: "Exit"
    });
})
app.get('/viewersVideos', checkAuth, function (req, res) {
    res.render('viewsUsers');
})
app.get('*', (req, res) => {
    res.render('err', {err: "page not found"})
}); 
