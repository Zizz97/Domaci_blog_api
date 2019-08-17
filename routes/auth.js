import express from 'express'
import { body } from 'express-validator/check'
import authController from '../controllers/auth'
import User from '../models/user'

const router = express.Router()

router.put(
    '/singup', 
    body('email')
        .isEmail()
        .withMessage('Please enter a walid email address.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-mail addres already exists!')
                    }
                })
            }),
    body('password')
        .trim()
        .isLength({ min: 5, max: 10}),
    body('name')
        .trim()
        .not()
        .isEmpty(),
    authController.singup
)

router.post('/login', authController.login)



module.exports = router
