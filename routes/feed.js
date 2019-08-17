import express from 'express'
import { body } from 'express-validator/check'
import isAuth from '../middleware/is-auth'
import feedController from '../controllers/feed'

const router = express.Router()

router.post(
    '/post', 
    isAuth, 
    [
        body('title')
            .trim()
            .isLength({ min: 5, max: 10}),
        body('content')
            .trim()
            .isLength({ min: 5, max: 400})
    ],
    feedController.createPost)

router.get('/posts', feedController.getPosts)

router.get('/posts', isAuth, feedController.getAdminPosts)

router.put(
    '/post/:postId', 
    isAuth, 
    [
        body('title')
            .trim()
            .isLength({ min: 5, max: 10}),
        body('content')
            .trim()
            .isLength({ min: 5, max: 400})
    ]
    ,feedController.updatePost
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router

