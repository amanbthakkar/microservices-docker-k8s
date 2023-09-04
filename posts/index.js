const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts', async (req, res) => {
  // create a post and then send event to event bus
  const { title } = req.body;
  const id = randomBytes(4).toString('hex');

  posts[id] = {
    id,
    title,
  };
  console.log(title, id);
  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title,
    },
  });

  res.status(201).send(posts[id]);
});

// always listen to relevant events from event-bus
app.post('/events', (req, res) => {
  console.log('Received event: ', req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log('Posts microservice started');
  console.log('Listening on 4000...');
});
