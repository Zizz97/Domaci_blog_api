import { validationResult } from 'express-validator/check'

import Post from '../models/post'
import User from '../models/user'


exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        const error = new Error('UNPROCESSABLE ENTITY')
        error.statusCode = 422
        throw error
    }
    const title = req.body.title
    const content = req.body.content
    let creator
    const post = new Post({
        title: title,
        content: content,
        creator: req.userId
    })
    post.save()
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            creator = user
            user.posts.push(post)
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err);
        })
}


exports.getPosts = (req, res, next) => {
    Post.find() 
        .then(posts => {
            res.status(200).json({
                message: 'Fetched posts',
                posts: posts,
            })
        })
        .catch(err => {
            serverError(err)
        })
}


exports.getAdminPosts = (req, res, next) => {
    Post.find() 
        .then(posts => {
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!')
                error.statusCode = 403
                throw error
            }
            res.status(200).json({
                message: 'Fetched posts',
                posts: posts,
            })
        })
        .catch(err => {
            serverError(err)
        })
}


exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({
                message: "Post fetched.",
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err);
        })
} 


exports.updatePost = (req, res, next) => {
    const postId = req.params.postId
    const title = req.body.title
    const content = req.body.content
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorect')
        errors.statusCode = 404
        throw error
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.')
                error.status = 404
                throw error
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!')
                error.statusCode = 403
                throw error
            }
            //console.log(req.userId)
            post.title = title
            post.content = content
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post updated',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post =>{
            if (!post) {
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }
            if (post.creator.toString() !== req.userId) {
                const error = 403
                throw error
            }
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId)
            return user.save()
        })
        .then(result => {
            res.status(200).json({
                message: "Deleted post."
            })
        })
        .catch(err =>{
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err);
        })
}

