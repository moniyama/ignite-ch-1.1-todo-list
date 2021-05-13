const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const hasAccount = users.find(user => user.username === username)
  if (!hasAccount) {
    response.status(404).json({
      error: 'Usuário inexistente'
    })
  }
  request.user = hasAccount
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
  const user = request.user
  response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos = [...user.todos, newTodo]
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    response.status(404).json({
      error: 'Mensagem do erro'
    })
  }
  todo.title = title || todo.title
  todo.deadline = new Date(deadline) || todo.deadline

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    response.status(404).json({
      error: 'Mensagem do erro'
    })
  }
  todo.done = !todo.done
  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    response.status(404).json({
      error: 'Mensagem do erro'
    })
  }
  const index = user.todos.indexOf(todo)
  const result = user.todos.splice(index)
  return response.status(204).json(result)
});

module.exports = app;