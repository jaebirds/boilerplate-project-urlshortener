require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const urlSchema = new Schema({
  id: { type: Number, required: true },
  url: { type: String, required: true }
});
const MongoURL = mongoose.model("MongoURL", urlSchema);

app.post('/api/shorturl', function(req, res) {

  let url;
  try {
    url = new URL(req.body.url);
    if (url.protocol != "http:" && url.protocol != "https:")
      res.json({ error: 'invalid url' });
  } catch(err) {
    res.json({ error: 'invalid url' });
  }

  // find the number of items in the database to set the id
  MongoURL.find().count().then((count) => {
    console.log("count: " + count);
  
    let urlToSave = new MongoURL({id: count, url: req.body.url});
    urlToSave.save().then((data) => {
      console.log("saved url", data);
      res.json({
        original_url: req.body.url,
        short_url: data.id
      });
    }).catch((err) => {
      console.error(err);
    });
  
  }).catch((err) => {
    console.error(err);
  });

});

app.get('/api/shorturl/:num', function(req, res) {

  MongoURL.findOne({id: req.params.num}).then((data) => {
    if (data == null)
      res.json({ error: 'invalid id' });
    else
    res.redirect(data.url);
  }).catch((err) => {
    console.error(err);
  });
});