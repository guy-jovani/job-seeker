




const { body, query } = require('express-validator');
const express = require('express')
const router = express.Router();


const postsController = require('../controllers/posts');


router.post('/create', [
  body('authorId')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Missing the author.'),
  body('content')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Missing the content.'),
  body('kind').custom(kind => {
    if(kind !== 'Employee' && kind !== 'Company') {
      throw new Error('Invalid kind.');
    }
    return true;
  }),
], postsController.create);

router.get('/fetchPosts', [
  query('page')
    .isInt({ gt: 0 })
    .withMessage('The "page" field should be a positive number.'),
], postsController.fetchPosts);

router.get('/fetchLikes', [
  query('postId')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Missing the post ID.'),
  query('page')
    .isInt({ gt: 0 })
    .withMessage('The "page" field should be a positive number.'),
], postsController.fetchLikes);

router.get('/fetchComments', [
  query('postId')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Missing the post ID.'),
  query('page')
    .isInt({ gt: 0 })
    .withMessage('The "page" field should be a positive number.'),
], postsController.fetchComments);

module.exports = router;

