import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator/check'
import User from '../models/user'
import nodemailer from 'nodemailer'
import sendgridTransport from 'nodemailer-sendgrid-transport'

const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: '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'
      }
    })
  );

exports.singup = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                name: name,
                email: email,
                password:  hashedPassword
            })
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'User created',
                userId: result._id
            })
            transporter.sendMail({
                to: result.email,
                from: 'test@test.com',
                subject: 'Test',
                html: `<h1 style="border: 2px solid DodgerBlue"> Hello <span style="color: DodgerBlue"> ${result.name} </span></h1>`
            })
        })
        .catch(err => {
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err)
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    let loadedUser 
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!')
                error.statusCode = 401
                throw error
            }
            
            // MD5 Encryption kao secure key (stefan1997)
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, '1ff1d761e8714d1cca6dbe645e6bbc83',
            { expiresIn: '1h'})
            
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) 
                err.statusCode = 500;
            next(err)
        })
}

exports.resetPassword = (req, res, next) =>{
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    const error = new Error('A user with this email could not be found')
                    error.statusCode = 401
                    throw error
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {
                transporter.sendMail({
                    to: req.body.email,
                    from: 'Domaci (reset password - a)',
                    subject: 'Reset password',
                    html: `<p>You requested a password reset</p>
                           <h1 style="border: 2px solid DodgerBlue"> 
                                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                           </h1>`
                })
            })
    })
}