var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Tweet = models.Tweet;

// THE WALL - anything routes below this are protected by our passport (user must be logged in to access these routes)!
router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

router.get('/', function(req, res) {
  // res.send("Success! You are logged in.");
  res.redirect('/users/' + req.user._id);
});

router.get('/users/', function(req, res, next) {
  // Gets all users
  User.find( function( error, allUsers ) {
    var notYou = [];
    for( var i = 0; i < allUsers.length; i++ ) {
      if( allUsers[i]._id.toString() !== req.user._id.toString() ) {
        notYou.push( allUsers[i] );
      }
    }
    res.render( 'profiles', {
      currentUser: req.user,
      userArray: notYou
    });
  });
});

router.get('/users/:userId', function(req, res, next) {
  // var isFollowing = false;
  // Follow.find( { "follower": req.user._id, "following": req.params.userId } )
  // .populate( 'following' )
  // .populate( 'follower' )
  // .exec( function( error, result ) {
  //   if( error ) { console.log( "Error checking for User Follow status\n" + error ); return; }
  //   if( result.length !== 0 ) { isFollowing = true; }
  //   User.findById( req.params.userId, function( error, foundUser) {
  //     if( error ) { console.log( "Error loading User\n" + error ); return; }
  //     function renderFollowers( followData ) {
  //       res.render('singleProfile', {
  //         user : foundUser, 
  //         followed: isFollowing, 
  //         followers : followData.followers , 
  //         followings: followData.followings 
  //       });
  //     }
  //     foundUser.getFollows( renderFollowers );
  //   });
  // });

  User.findById(req.params.userId, function(error, thisPageUser){
    if( error ) { console.log( "Error getting user" + error ); return; }
    thisPageUser.getFollows( function(followData){
      var isFollowing = false;
     for (let i = 0; i < followData.followers.length; i++) {
        if( thisPageUser._id.toString() === followData.followers[i].follower._id.toString() ){
          isFollowing = true;
        }
     }
      thisPageUser.getTweets( function(tweetData){
        res.render('singleProfile', {
          user: thisPageUser,
          followed :isFollowing,
          followers: followData.followers,
          followings:followData.followings,
          tweets: tweetData
        })
      })
    })
  })
});

router.post('/follow/:userId', function(req, res, next) {
  req.user.follow( req.params.userId );
  res.redirect( '/users/' + req.params.userId );
});

router.post('/unfollow/:userId', function(req, res, next) {
  req.user.unfollow( req.params.userId );
  res.redirect( '/users/' + req.params.userId );
});

router.get('/tweets/new', function(req, res, next) {
  console.log('something')
  res.render('newTweet', { currentUser: req.user })

});

router.post('/tweets/new', function(req, res, next) {
  var newTweet = new Tweet({
    content: req.body.content,
    author: req.user._id
  })
  newTweet.save(function(error){
    if(error){
      console.log('franky sucks' + error);
    }
  })
  res.redirect('/tweets/')
});

router.get('/tweets/', function(req, res, next) {
// Gets all users
  Tweet.find()
  .populate('author')
  .exec(function( error, allTweets ) {
    res.render( 'tweets', {
      tweetArray: allTweets,
      currentUser : req.user._id
    });
  });
});

router.get('/tweets/:tweetId', function(req, res, next) {
  //Get all information about a single tweet
});

router.get('/tweets/:tweetId/likes', function(req, res, next) {
  //Should display all users who like the current tweet
});

router.post('/tweets/:tweetId/likes', function(req, res, next) {
  //Should add the current user to the selected tweets like list (a.k.a like the tweet)
});

router.get( '/feed/', function( req, res, next ) {
  req.user.getFollows( function( followData ) {
    var tweetArray = [];
    for (let i = 0; i < followData.followings.length; i++) {
      followData.followings[i].following.getTweets(function( tweetData ){
        for( var tweet in tweetData ) {
          tweetArray.push( tweetData[tweet] );
        }
        if( i === followData.followings.length - 1 ) {
          res.render( 'feed', {
            currentUser: req.user._id,
            tweetData: tweetArray
          });
        }
      });
    }
  });
});

module.exports = router;
