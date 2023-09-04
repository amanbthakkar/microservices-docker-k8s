const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://localhost:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }

  res.send({});
});

app.listen(4003, async () => {
  console.log('Comment Moderation microservice started');
  console.log('Listening on 4003...');

  // ideally get all events and moderate them
  try {
    const res = await axios.get('http://localhost:4005/events');
    console.log('Got responses: ', res.data);
    for (let event of res.data) {
      const { type, data } = event;
      if (type === 'CommentCreated') {
        const status = data.content.includes('orange')
          ? 'rejected'
          : 'approved';

        await axios.post('http://localhost:4005/events', {
          type: 'CommentModerated',
          data: {
            id: data.id,
            postId: data.postId,
            status,
            content: data.content,
          },
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});
