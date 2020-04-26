
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');

const employeesRoutes = require('./routes/employees');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const chatRoutes = require('./routes/chat');
const jobsRoutes = require('./routes/jobs');
const checkAuth = require('./middleware/check-auth');

const app = express();


app.use(compression());
app.use(helmet());


app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.url);
  console.log(req.body);
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/files', express.static(path.join(__dirname, 'files')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
  next();
});

app.use('/auth', authRoutes);
app.use('/employees', checkAuth, employeesRoutes);
app.use('/companies', checkAuth, companiesRoutes);
app.use('/search', checkAuth, searchRoutes);
app.use('/chat', checkAuth, chatRoutes);
app.use('/jobs', checkAuth, jobsRoutes);

app.use((req, res, next) => {
  console.log('general url in app.js');
  console.log(req.url);
  res.status(200).json({ // the developer is the only one that can get here
    messages: ['Invalid url.'],
    type: 'failure',
  });
});

app.use((error, req, res, next) => {
  console.log('====================================================');
  console.log('====================================================');
  console.log('An error caught and printed in app.js');
  console.log(error);

  if (typeof(error) !== 'object') {
    error = {messages: [error]};
  }
  if (!error.messages.includes(
      'Tried to upload wrong mime type. Choose a different file.') &&
      !error.messages.includes('Auth Fail. You need to login.')) {
    error.messages.push('Please refresh the page and try again. ' +
                'If the error is still happening please notify the admins.');
  }
  res.status(error.statusCode || 500).json({ 
    messages: error.messages,
    type: 'failure',
  });
});

mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://' +
      process.env.MONGO_DB_USER + ':' +
      process.env.MONGO_DB_PASSWORD +
      '@cluster0-shard-00-00-i3bvx.mongodb.net:27017,cluster0-shard-00-01-i3bvx.mongodb.net:27017,cluster0-shard-00-02-i3bvx.mongodb.net:27017/' +
      process.env.MONGO_DB_COLLECTION +
      '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
)
.then(() => {
  const server = app.listen(process.env.PORT); 
  const io = require('./socket').socketInitializer.init(server);
  io.on('connection', socket => {
    console.log('connected')
    require('./socket').socketHandler(socket);
  });
})
.catch(err => console.log(err));


