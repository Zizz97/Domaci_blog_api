import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import feedRoutes from './routes/feed'
import authRoutes from './routes/auth'

const mongoDbUrl = 'mongodb+srv://stefan:Qw7g18sWEs4golB9@cluster0-hdguq.mongodb.net/domaci?retryWrites=true&w=majority'

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use('/auth', authRoutes)
app.use('/feed', feedRoutes)




app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

mongoose.connect(mongoDbUrl, { useNewUrlParser: true }) 
    .then(result => {
        app.listen(8080, () => {
            console.log('Server listening at port http://localhost:8080')
        })
    })
    .catch(err => {
        console.log(err)
    })