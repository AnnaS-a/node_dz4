const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const pathToFile = path.join(__dirname, 'usersData.json'); 

app.use(express.static('static'));

const Joi = require('joi');
const schema = Joi.object({
  name: Joi.string().min(2).required(), // min 2 символа и обязательность поля
    secondName: Joi.string().min(3).required(),
    city: Joi.string().min(2),
    age: Joi.number().min(0).required(),
})

app.use(express.json());

//получить всех пользователей
app.get('/users', (req, res) => {
  const pathToFile = path.join(__dirname, 'usersData.json'); 
  const data = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
  res.send({data});
});

// получить конкретного пользователя
app.get('/users/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
  
  let id = +req.params.id;
  const user = data.find((user) => user.id === Number(req.params.id));

  if (user) {
    res.send({user});
  } else {
    res.status(404);
    res.send({user: null});
  }
});

// создать пользователя
app.post('/users', (req, res) => {
  const pathToFile = path.join(__dirname, 'usersData.json'); 
  const data = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));

  console.log(req.body);
  const result = schema.validate(req.body);
  if (result.error){
    return res.status(404).send({error: result.error.details});
  }
  let uniqueID = Object.keys(data).length;
  uniqueID += 1;

  data.push({
    id: uniqueID,
    ...req.body
  });

  res.send({id: uniqueID});

  fs.writeFileSync(pathToFile, JSON.stringify(data, null, 3)); 
});

// изменить (обновить) пользователя
app.put('/users/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));

  const result = schema.validate(req.body);
  if (result.error){
    return res.status(404).send({error: result.error.details});
  }

  let id = +req.params.id;
  const user = data.find((user) => user.id === Number(req.params.id));

  if (user) {
    user.name = req.body.name;
    user.secondName = req.body.secondName;
    user.age = req.body.age;
    user.city = req.body.city;
 
    res.send({user});
  } else {
    res.status(404);
    res.send({user: null});
  }

  fs.writeFileSync(pathToFile, JSON.stringify(data, null, 3)); 
});

//удалить 
app.delete('/users/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));

  const user = data.find((user) => user.id === Number(req.params.id));

  if (user) {
    const userIndex = data.indexOf(user);
    data.splice(userIndex, 1);

    res.send({user});
  } else {
    res.status(404);
    res.send({user: null});
  } 

  fs.writeFileSync(pathToFile, JSON.stringify(data, null, 3)); 
});

// обработка несуществующих роутов
app.use((req, res) => {
  res.status(404).send({
    message: 'URL not found!'
  })
});

app.listen(3001);