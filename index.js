const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose')
const cors = require('cors');
const dotenv = require('dotenv')

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

//const result = dotenv.config()

app.set('port', PORT);
app.set('env', NODE_ENV);
app.use(cors());


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

const connectionstr="mongodb+srv://"+process.env.DBCRED+"@cluster0.jyjwr.mongodb.net/tweetsdb?retryWrites=true&w=majority"
mongoose.connect(connectionstr);
app.use('/', require(path.join(__dirname, 'routes')));

app.use((req, res, next) => {
  const err = new Error(`${req.method} ${req.url} Not Found`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});