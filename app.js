const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: '***********',
  host: 'localhost',
  database: 'my-local-bd',
  password: '***********',
  port: 5432,
});

app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM adv');
    const pets = result.rows;
    client.release();

    res.render('form', { pets });
  } catch (err) {
    console.error('Ошибка при выполнении SQL-запроса', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.post('/home', async (req, res) => {
  const { title, price } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO adv (title, price) VALUES ($1, $2)', [title, price]);
    client.release();

    res.status(201).send('Данные успешно сохранены');
  } catch (err) {
    console.error('Ошибка при выполнении SQL-запроса', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/adv', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM adv');
    const pets = result.rows;
    client.release();

    res.render('adv', { pets });
  } catch (err) {
    console.error('Ошибка при выполнении SQL-запроса', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.delete('/deletePet/:id', async (req, res) => {
  try {
    const client = await pool.connect();

    const idToDelete = req.params.id;

    const query = 'DELETE FROM adv WHERE id = $1';

    await client.query(query, [idToDelete]);
    client.release();

    res.status(200).send('Строка успешно удалена');
  } catch (err) {
    console.error('Ошибка при выполнении SQL-запроса', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});