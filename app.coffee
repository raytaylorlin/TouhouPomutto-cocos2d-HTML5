express = require 'express'
mongoose = require 'mongoose'

app = express.createServer()

############ Configure

mongourl = null

app.configure ->
  app.use '/assets', express.static __dirname + '/assets'
  app.use '/static', express.static __dirname + '/static'
  app.use express.bodyParser()
  app.use app.router

app.configure 'development', ->
  mongourl = "mongodb://localhost/db"
  app.use express.errorHandler dumpException: true, showStack: true
  app.set 'view options', pretty: true

app.configure 'production', ->
  app.use express.errorHandler()
  mongourl = process.env.MONGOHQ_URL

############ Mongo initialization

Score = null

mongoose.connect mongourl
db = mongoose.connection
db.on 'error', console.error.bind console, 'mongoose connection error: '
db.once 'open', ->
  scoreSchema = mongoose.Schema
    ip: String,
    'user-agent': String,
    mobile: String,
    name: String,
    ts: Date,
    score: Number
  # ensure desc index on 'score'
  scoreSchema.index 'score': -1
  Score = mongoose.model 'scores', scoreSchema

############ Visit mongodb

recordScore = (req, res) ->
  score = new Score
    "ip": req.get('x-forwarded-for') or req.connection.remoteAddress,
    "user-agent": req.get("User-Agent"),
    "log": req.body.log,
    "mobile": req.body.mobile,
    "name": req.body.name,
    "ts": new Date(),
    "score": require('./score').calcScore(req.body.log)
  # Insert the object then print in response
  # Note the _id has been created
  score.save (err, s) ->
    if err
      console.error err.message
      res.send 500, {code: 500, msg: err.message}
    else
      Score
        .count {score: {$gte: s.score}}, (err, count) ->
          rank = count
          Score
            .find({_id: {$ne: s._id}, score: {$gte: s.score}})
            .sort('score -ts')
            .select('name score -_id')
            .limit(-10)
            .exec (err, above) ->
              Score
                .find({_id: {$ne: s._id}, score: {$lte: s.score}})
                .sort('-score ts')
                .select('name score -_id')
                .limit(-10)
                .exec (err, below) ->
                  # add ranking
                  above = above.map (elem) -> return elem.toObject()
                  below = below.map (elem) -> return elem.toObject()
                  above.forEach (elem, idx) -> elem.rank = count - 1 - idx
                  below.forEach (elem, idx) -> elem.rank = count + 1 + idx
                  me =
                    rank: count,
                    name: s.name,
                    score: s.score
                  # surrounding
                  surrounding = above.reverse().concat([me]).concat(below)
                  res.send 200, {code: 200, msg: "success!", 'rank': rank, surrounding: surrounding}
      # Score.count {_id: {$lt: s.ts}, score: {$gt: s.score}}, (err, count) ->
      #   rank = count + 1
      #   Score
      #     .find({})
      #   res.send 200, {code: 200, msg: "success!", rank: rank, surrounding}


# BOARD_FIELDS =
#   'name': 1,
#   'score': 1,
#   '_id': 0

printBoard = (req, res) ->
  Score
    .find({})
    .limit(10)
    .sort('-score name')  # sort by score (high -> low), then by name
    .select('name score -_id')
    .exec (err, scores) ->
      res.json scores

############ Routes

app.get '/', (req, res) ->
  require('fs').readFile __dirname + '/assets/index.html', 'utf-8', (err, text) ->
    res.send text

app.post '/score', (req, res) ->
  recordScore req, res

app.get '/board', (req, res) ->
  printBoard req, res

############ Listen

app.listen process.env.VCAP_APP_PORT or 3000
