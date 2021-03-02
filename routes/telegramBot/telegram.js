const config = require('../../config.js');
const fs = require('fs').promises;
const token = config.bot_Token;
const user = require('../../models/user');
const TelegramBotApi = require('telegram-bot-api');
const telegramBotApi = new TelegramBotApi({
    token: token,
    updates: {
        enabled: true
    }
});
telegramBotApi.on('message', onMessage);
function onMessage(message) {
    return processRequest(message).catch(() => {
        chat_id = message.chat_id;
        text = 'Dont mess with my crew';
        parse_mode = "HTML";
    })
}
function processRequest(message) {
    if (message.text == '/start') {
        let link =`Hello i'm Vlad Crow and dont mess with my crew . Make authorization with this link if you want to make subscribes https://vladich-bub.herokuapp.com/auth/login?chatId=${
            message.chat.id
        }`;
        return telegramBotApi.sendMessage({chat_id: message.chat.id, text: link});
    }else if(message.text == '/getViews'){
        console.log("CHAT ID SYKA" +message.chat.id)
        user.getByChatId(message.chat.id).then(result=>{
            if(result){
            return user.getViewsCount(result.chatId);
            }else{
                return Promise.resolve("unauth");
            }
        }).then(count =>{
            if(count == "unauth"){
                 return telegramBotApi.sendMessage({chat_id: message.chat.id, text: "Cccccaaaaarrrrrr you are not authorized Ccccaaaaaaarrrr  Ccccaaaaaaarrrr"});
            }else{
                return telegramBotApi.sendMessage({chat_id: message.chat.id, text: "Cccccaaaaarrrrrr you views count is " + count +"  Ccccaaaaaaarrrr  Ccccaaaaaaarrrr and  dont mess with my crew"});
            }  
        }).catch(err =>{
            console.error(err);
        })
    }
     else {
        return telegramBotApi.sendMessage({chat_id: message.chat.id, text: "Cccccaaaaarrrrrr Ccccaaaaaaarrrr"});
    }
}
module.exports = telegramBotApi
