
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const employeesRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const globalVars = require('./utils/globalVars');

const app = express();



app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
  next();
});


// app.use('', (req, res, next) => {
//   console.log(req.query)
//   next()
// });


app.use('/employees', employeesRoutes);
app.use('/auth', authRoutes);
app.use('/companies', companiesRoutes);

app.use((req, res, next) => {
  console.log("general url in app.js");
  console.log(req.url);
  res.status(404).json({ 
    message: "invalid url",
    type: "failure"
  });
});

app.use((error, req, res, next) => {
  console.log("an error cought and printed in app.js");
  console.log(error);
  res.status(error.statusCode || 500).json({ 
    // errors: [{
    //   msg: 'An unknown error occured'
    // }],
    type: 'failure'
  });
});

mongoose.connect(`mongodb://${globalVars.MONGO_DB_USER}:${globalVars.MONGO_DB_PASSWORD}@cluster0-shard-00-00-i3bvx.mongodb.net:27017,cluster0-shard-00-01-i3bvx.mongodb.net:27017,cluster0-shard-00-02-i3bvx.mongodb.net:27017/${globalVars.MONGO_DB_COLLECTION}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
)
.then(() => {
  const server = app.listen(globalVars.PORT);
  // const io = require('./socket').init(server);
  // io.on('connection', socket => {
  //   console.log("client connected");
  // });
})
.catch(err => console.log(err));


