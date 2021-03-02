require('dotenv').config()

module.exports = {
    ServerPort: process.env["PORT"] || 3000,
    DatabaseUrl: process.env["DATABASE_URL"] || "mongodb://localhost:27017/sample",
    secret :"sviow",
    secretJWT : "300VIdsosi y traktori&ta",
    bot_Token: "1027229180:AAFSj114aBJ5j5e3HydzR96ho0Uyfz15qT8",
    google :{
        client_secret: "umIIxG3Ot7gGuGqYxnIluu4X",
        client_id:"969866526438-s3dm0p46nogmf9k0tvscd8rekldj98e4.apps.googleusercontent.com"
    }
};