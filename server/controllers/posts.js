

const Post = require('../models/post');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const skippedDocuments = require('../utils/shared').skippedDocuments;
const mongoose = require('mongoose');


exports.create = async (req, res, next) => {
  try { 
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    
    const post = await Post.create({ author: req.body.authorId, content: req.body.content, onModel: req.body.kind });

    res.status(200).json({
      type: 'success',
      post
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error creating the post."));
  }
};


exports.fetchPosts = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }

    let posts = await Post.aggregate([
      { $skip: skippedDocuments(req.query.page) },
      { $limit: +process.env.DOCS_PER_PAGE },
      { $project: {
          numLikes: { 
            $cond: { 
              if: { $isArray: "$likes" },
              then: { $size: "$likes" }, 
              else: 0 
            }
          },
          author: 1, 
          content: 1, 
          comments: 1, 
          createdAt: 1,
          onModel: 1,
          updatedAt: 1,
          allowComments: 1, 
        }
      },
      { $sort: {
        'updatedAt': -1
      }}
    ]);

    posts = await Post.populate(posts, { path: 'author', select: 'profileImagePath name firstName lastName email' });
    const total = await Post.find().countDocuments();
    
    res.status(200).json({
      type: 'success',
      posts,
      total
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the posts."));
  }
};


exports.likeAPost = async (userId, postId, kind) => {
  try {
    let post = await Post.findOneAndUpdate(
      { _id: postId, 'likes.user': { $ne: userId } }, 
      { $push: {
          'likes': { 
            user: userId,
            onModel: kind
          } 
        }
      },
      { new: true }
    );
    

    if(!post) { // unlike
      post = await Post.findOneAndUpdate(
        { _id: postId, 'likes.user': { $eq: userId } }, 
        { $pull: {
            'likes': { 
              user: userId
            } 
          } 
        },
        { new: true }
      );
    }
    post = post.toObject();
    post['numLikes'] = post.likes.length;
    post['userLike'] = userId;
    Reflect.deleteProperty(post, 'likes');
    Reflect.deleteProperty(post, '__v');
    return post;
    
  } catch (error) {
    throw errorHandling.handleServerErrors(error, 500, 'There was a problem liking the post.');
  }
};



exports.fetchLikes = async (req, res, next) => {
  try {
    let post = await Post.findById(
      { _id: req.query.postId },
      { 
        likes: {
          $slice: [skippedDocuments(req.query.page), +process.env.DOCS_PER_PAGE]
        }
      }
    );
    post = await Post.populate(post, { path: 'likes.user', select: 'profileImagePath name firstName lastName email' });

    res.status(200).json({
      type: 'success',
      likes: post['likes']
    });
    
  } catch (error) {
    throw errorHandling.handleServerErrors(error, 500, 'There was a problem fetching the likes of the post.');
  }
};


