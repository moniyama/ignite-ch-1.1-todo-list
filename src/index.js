const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const hasAccount = users.some(user => user.username === username)
  if (!hasAccount) {
    response.status(404).json({
      error: 'Usuário inexistente'
    })
  }
  request.username = username
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  const hasUser = users.some(user => user.username === username)
  if (hasUser) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  }

  users.push(newUser)
  response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = users.find(user => user.username === request.username).todos
  response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  users.forEach(user => {
    if (user.username === request.username) {
      user.todos = [...user.todos, newTodo]
    }
  })
  response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  let post = {}
  users.forEach(user => {
    user.todos.forEach(todo => {
      if (todo.id === id) {
        todo.title = title || todo.title
        todo.deadline = new Date(deadline) || todo.deadline
      }
      post.title = todo.title
      post.deadline = todo.deadline
      post.done = todo.done
    })
  })
  response.status(201).json(post)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;