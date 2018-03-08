var mongoose = require('mongoose');



var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/twitterdb", function(err, db) {
if(err) {
console.log('Nope', err);
} else {
console.log('Success')
}
})

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    default: 'https://horizons-static.s3.amazonaws.com/horizons_h.png'
  },
  displayName: {
    type: String,
  },
  bio: {
    type: String,
  }
  /* Add other fields here */
});

var FollowsSchema = mongoose.Schema({
  follower : {
    type : mongoose.Schema.ObjectId,
    ref: "User"
  },
  following : {
    type : mongoose.Schema.ObjectId,
    ref: "User"
  },

});





userSchema.methods.getFollows = function (callback){
  var thisUserId = this._id;
  Follow.find()
  .populate( 'follower' )
  .populate( 'following' )
  .exec(function(error, followers){
    if(error){ console.log('error finding followers and followings' +error); return; }
    var allFollowers = [];
    var allFollowings = [];
    for (let follower of followers) {
      if(follower.follower._id.toString() === thisUserId.toString()){
        allFollowings.push(follower);
      }
      if(follower.following._id.toString() === thisUserId.toString()){
        allFollowers.push(follower);
      }
    }
    return callback( {followers: allFollowers, followings: allFollowings} );
  });
}

userSchema.methods.isFollowing = function (profileFollowed, callback){
  this.getFollows(func)
}

userSchema.methods.follow = function (idToFollow, callback){
  var myId = this._id;
  Follow.findOne( { "follower": myId, "following": idToFollow  } )
  .populate('follower')
  .populate('following')
  .exec( function( error, followResult ) {
    if( error ) { console.log( "Could not Follow\n" + error ); return; }
    if( followResult ) { console.log( "Already followed\n" ); return; }
    var newFollow = Follow({
      follower: myId,
      following: idToFollow
    });
    newFollow.save( function( saveError, saveResult ) {
      if( saveError ) { console.log( "Error saving Follow\n" + saveError ); return; }
    });
  });
}

userSchema.methods.unfollow = function (idToUnfollow, callback){
  Follow.findOneAndRemove( { "follower": this._id, "following": idToUnfollow  } )
  .populate('follower')
  .populate('following')
  .exec( function( error, followResult ) {
    if( error ) { console.log( "Error getting Follow to unfollow\n" + error ); return; }
    console.log( "Unfollowed" );
  });
}

userSchema.methods.getTweets = function (callback){
  Tweet.find({"author": this._id})
  .populate('author')
  .exec(function(error,tweets){
    if( error ) { console.log( "Error getting tweets from you\n" + error ); return; }
    return callback(tweets);
  })
}

var tweetSchema = mongoose.Schema({
    content: {type: String,
      maxlength : 140}, 
    author: {
      type : mongoose.Schema.ObjectId,
      ref: "User"
    }

});

tweetSchema.methods.numLikes = function (tweetId, callback){


}


var User = mongoose.model('User', userSchema);
var Tweet = mongoose.model('Tweet', tweetSchema);
var Follow = mongoose.model('Follow', FollowsSchema);

module.exports = {
  User: User,
  Tweet: Tweet,
  Follow: Follow
};
