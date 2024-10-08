const express = require('express')
const createError = require('http-errors')
var path = require('path')
var session = require('express-session')
var settingsRouter = require('./routes/settings.route')
var homeRouter = require('./routes/home.route')
var apinewsanpham = require('./routes/apinewsanpham')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
const app = express()
const MongoStore = require('connect-mongo')
var db = require('./models/db')
const uri =
  'mongodb+srv://ducbinhnguyennd:ducbinhnguyennd@cluster0.sck9o.mongodb.net/giahuystore?retryWrites=true&w=majority'
const mongoStoreOptions = {
  mongooseConnection: db.mongoose.connection,
  mongoUrl: uri,
  collection: 'sessions'
}

// app.set('view engine', 'ejs');
// view engine setup
app.use(
  session({
    secret: 'adscascd8saa8sdv87ds78v6dsv87asvdasv8',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create(mongoStoreOptions)
    // ,cookie: { secure: true }
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
// app.use('/', homeRouter);
app.use('/home', homeRouter)
// app.use('/api', apiAccRouter);
// app.use('/accounts', accountsRouter);
app.use('/', settingsRouter)
// app.use('/',sitmaprouter);

// app.use('/test', testRouter);
app.use('/', apinewsanpham)

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/uploads')))

// // Middleware để log địa chỉ IP của máy khách
// app.use((req, res, next) => {
//   // Lấy địa chỉ IP từ header x-forwarded-for hoặc từ remoteAddress
//   const forwardedFor = req.headers['x-forwarded-for']
//   const clientIp = forwardedFor
//     ? forwardedFor.split(',')[0]
//     : req.connection.remoteAddress

//   // Nếu địa chỉ IP là loopback IPv6, chuyển đổi nó thành IPv4 loopback
//   const normalizedIp = clientIp === '::1' ? '127.0.0.1' : clientIp

//   console.log(`Client IP: ${normalizedIp}`)
//   next()
// })

// app.get('/testcheckip', (req, res) => {
//   res.send('Hello World!')
// })

app.use(function (req, res, next) {
  next(createError(404))
})
app.listen(8080, () => {
  console.log('Server is running on port 8080')
  console.log(__dirname)
})
module.exports = app
