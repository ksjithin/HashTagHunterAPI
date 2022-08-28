const axios = require('axios');
var config = require('./config.js');
var Twitter = require('twitter');
var T = new Twitter(config);
var Tweet = require('../models/Tweet');
const TelegramBot = require('node-telegram-bot-api');

const token =process.env.TELEGRAMTOKEN
const chatId = process.env.TELEGRAMCHATID

const getAll = function (req, res) {

    var params = {
        q: '#bugbountytips'
    }

    T.get('search/tweets', params, function (err, data, response) {
        // If there is no error, proceed
        if (!err) {
            // Loop through the returned tweets
            for (let i = 0; i < data.statuses.length; i++) {
                // Get the tweet Id from the returned data
                let id = data.statuses[i].id_str
                let username = data.statuses[i].user.screen_name

                // Try to Favorite the selected Tweet
                //let username = response.user.sc

                //console.log(data.statuses[i]);
                let tweetId = id;
                console.log('Favorited: ', `https://twitter.com/${username}/status/${tweetId}`)
            }
        } else {
            console.log(err);
        }
        res.send(data.statuses);
    })

    // axios.get('https://api.twitter.com/1.1/search/tweets.json?q=cybersecurity',{
    //   headers: {
    //     'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAA'
    //   }
    // }).then(
    //   response => {
    //     const data = JSON.stringify(response)
    //     console.log(data);
    //     res.send(data);
    //   }
    // ).catch(error => {
    //   console.log(error)
    // })

}

const getStream = function (req, res) {
    console.log("reached loadstream")
    //  track: ['bugbounty','appsec','cybersecurity']
    var arr=["bugbounty","bugbountytips"]
    T.stream('statuses/filter', {      
        track: arr.join(',')
    }, function (stream) {
        stream.on('data', function (data) {
            

            let id = data['id_str']
                       
            var tweet = {
                twid: data['id'],
                active: false,
                author: data['user']['name'],
                avatar: data['user']['profile_image_url'],
                body: data['text'],
                date: data['created_at'],
                screenname: data['user']['screen_name'],
                url: `https://twitter.com/${data['user']['screen_name']}/status/${id}`
            };
            var tweetEntry = new Tweet(tweet);
            tweetEntry.save(function (err) {
                if (!err) {
                    console.log(data && data['text']);
                    
                }
            });
        });

        stream.on('error', function (error) {
           // throw error;
           console.log('Caught exception: ', error);
        });
        res.send("stream started");
    });


}


const getStreamFromDB = async (req, res) => {
    console.log("reached getfromdb")

    await Tweet.find({}, (err, tweets) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!tweets.length) {
            return res
                .status(404)
                .json({ success: false, error: `Movie not found` })
        }
        console.log(tweets)
        return res.status(200).json({ success: true, data: tweets })
    }).catch(err => console.log(err))

}
const test = async (req, res) => {
   
    res.send("test page reached");
}
const getStreamForTelegram = function (req, res) {
    console.log("reached loadstream")
    //  track: ['bugbounty','appsec','cybersecurity']
    var arr=["bugbounty","bugbountytips","cybersecurity","infosec"]
    T.stream('statuses/filter', {      
        track: arr.join(',')
    }, function (stream) {
        stream.on('data', function (data) {
           // console.log('data: ', data);

            let id = data['id_str']
                       
            var tweet = {
                twid: data['id'],
                active: false,
                author: data['user']['name'],
                avatar: data['user']['profile_image_url'],
                body: data['text'],
                date: data['created_at'],
                screenname: data['user']['screen_name'],
                url: `https://twitter.com/${data['user']['screen_name']}/status/${id}`
            };
            
            var tweetUrl=tweet.url            
            const bot = new TelegramBot(token, { polling: false });
            try {
                var txt=""
                txt=data['text']
                if(txt.startsWith("RT")){
                    console.log("skipping:"+ tweetUrl )
                }else{
                    console.log("url: "+tweetUrl)
                    bot.sendMessage(chatId, '<a>'+tweetUrl+'</a>', {
                        parse_mode: 'html'
                      });
                }
                
              } catch (err) {
                console.log('Something went wrong when trying to send a Telegram notification', err);
              }

        });

        stream.on('error', function (error) {
           // throw error;
           console.log('Caught exception: ', error);
        });
        

        res.send("telegram stream started");
    });


}

module.exports = {
    getAll,
    getStream,
    getStreamFromDB,
    test,
    getStreamForTelegram
};