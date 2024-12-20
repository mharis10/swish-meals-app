const express = require('express');

const { connectToDB } = require('./startup/db');
require('./models/associations');

const app = express();

const { startEmailCronJob, startOrdersCronJob } = require('./startup/cronJob');
startEmailCronJob();
startOrdersCronJob();

require('./startup/routes')(app);

connectToDB();

const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
