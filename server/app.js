
const path = require('path');
const express = require('express');
// const http2 = require('http2');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const employeesRoutes = require('./routes/employees');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const chatRoutes = require('./routes/chat');
const globalVars = require('./utils/globalVars');
const checkAuth = require('./middleware/check-auth');

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
  next();
});


// app.use('', (req, res, next) => {
//   console.log(req.query)
//   next()
// });

app.use('/auth', authRoutes);
app.use('/employees', checkAuth, employeesRoutes);
app.use('/companies', checkAuth, companiesRoutes);
app.use('/search', checkAuth, searchRoutes);
app.use('/chat', checkAuth, chatRoutes);

app.use((req, res, next) => {
  console.log("general url in app.js");
  console.log(req.url);
  res.status(200).json({ // the developer is the only one that can get here
    messages: ["invalid url"],
    type: "failure"
  });
});

app.use((error, req, res, next) => {
  console.log("====================================================");
  console.log("====================================================");
  console.log("an error cought and printed in app.js");
  console.log(error);
  res.status(error.statusCode || 500).json({ 
    // errors: [{
    //   msg: 'An unknown error occured'
    // }],
    messages: error.messages,
    type: 'failure'
  });
});

mongoose.set('useCreateIndex', true);
// mongoose.connect(globalVars.MONGO_DB,
mongoose.connect("mongodb://" + 
      process.env.MONGO_DB_USER + ":" + 
      process.env.MONGO_DB_PASSWORD + 
      "@cluster0-shard-00-00-i3bvx.mongodb.net:27017,cluster0-shard-00-01-i3bvx.mongodb.net:27017,cluster0-shard-00-02-i3bvx.mongodb.net:27017/" + 
      process.env.MONGO_DB_COLLECTION + 
      "?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
)
.then(() => {
  // const server = http2.createServer(app);
  const server = app.listen(process.env.PORT || globalVars.PORT); // process.env for the hosting provider
  // server.listen(process.env.PORT || globalVars.PORT);
})
.catch(err => console.log(err));


