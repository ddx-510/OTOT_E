const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = 4000;
const client = redis.createClient();



client.connect();

client.on("connect", function() {
    console.log("You are now connected");
});

client.on("error", (error) => {
console.error(error);
});
   

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ddx',
  host: 'localhost',
  database: 'otot_e',
  password: '110119',
  port: 5432,
});

const getUsers = () => {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
}

app.get('/users', async (req, res) => {
    try {
        const cache = await client.get("Users");
        if (cache) {
            console.log("Cache");
            const Users = JSON.parse(cache);
            res.status(200).json(Users);
        } else {
            getUsers()
            .then(response => {
                client.setEx("Users", 1020, JSON.stringify(response));
                res.status(200).json(response);
            })
            .catch(error => {
                res.status(500).send(error);
            })            
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});