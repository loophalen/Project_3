const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.static("public"));

// app.get('/', (req, res) => {
//   res.send('index')
// });

const playlistController = require('./controllers/playlist.js');
app.use('/playlist', playlistController);

app.listen(3000, () => {
  console.log('listening......');
});

//Mongoose Connection
mongoose.connect("mongodb://localhost:27017/Music", { useNewUrlParser: true } );
mongoose.connection.once("open", () => {
  console.log("Connected to mongoose!");
});