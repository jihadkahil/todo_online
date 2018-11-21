require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authentication } = require('./middelware/authentication');
const bcrypt = require('bcryptjs');
var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authentication, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authentication, (req, res) => {
  Todo.find({ "_creator": req.user._i }).then((todos) => {
    res.send({ todos });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authentication, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    "_id": id,
    "_creator": req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send({"error":"Todo not found"});
    }

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send({"error":e});
  });
});

app.delete('/todos/:id',authentication, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({"_creator":req.user._id,"_id":id}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id',authentication, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({"_creator:":req.user.id,"_id":id}, { $set: body }, { new: true }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});


app.get('/users/me', authentication, (req, res) => {
  res.send(req.user);

})

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {

    return user.generateAuthToken().then((token) => {

      res.header("x-auth", token).send(user);
    })
  }).catch((err) => {
    res.status('404').send({ 'error': err });
  })

});


app.delete('/users/me/token', authentication, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send({ 'success': true });

  }).catch((err) => {

    re.status('404').send({ 'error': err });

  })

})


module.exports = { app };
