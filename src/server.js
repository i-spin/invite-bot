const express = require('express');
const { port } = require('../config.json');

const app = express();

app.get('/', (request, response) => response.sendFile('index.html', { root: './src/' }));

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
