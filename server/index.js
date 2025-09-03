require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const sessionOpts = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
};

const app = express();

app.use(session(sessionOpts));
app.use(cookieParser());

let credentials = {};
credentials.zotero_api_key = process.env.API_KEY_ZOTERO;

app.use(function (req, res, next) {
  console.log("Checking for cookie")
  // check if client sent cookie
  var zotero_cookie = req.cookies.gecko_zotero_key;
  if (zotero_cookie === undefined) {
    // no: set a new cookie
    res.cookie('gecko_zotero_key', credentials.zotero_api_key, { maxAge: 900000, httpOnly: false });
  }
  next(); // <-- important!
});

app.use(express.static(path.join(path.dirname(__dirname), 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(path.dirname(__dirname), 'build', 'index.html'));
});

app.get('/services/mendeley/authenticate', require('./services/mendeley/authenticate'));
app.get('/services/mendeley/verify', require('./services/mendeley/verify'));
app.get('/services/mendeley/getFolders', require('./services/mendeley/getFolders'));
app.get(
  '/services/mendeley/getDocumentsInFolder',
  require('./services/mendeley/getDocumentsInFolder')
);
app.get('/services/zotero/authenticate', require('./services/zotero/authenticate'));
app.get('/services/zotero/verify', require('./services/zotero/verify'));
app.get('/services/zotero/login', require('./services/zotero/login'));
app.get('/services/zotero/getCollections', require('./services/zotero/getCollections'));
app.get('/services/zotero/getItemsInCollection', require('./services/zotero/getItemsInCollection'));
app.post('/services/zotero/addItems', require('./services/zotero/addItems'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`CitationGecko server listening on...${PORT}`));
