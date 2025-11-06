import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`)
      setTodos(response.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/todos`, { title, description })
      setTitle('')
      setDescription('')
      fetchTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Todo App</h1>
      
      <form onSubmit={addTodo} style={{ marginBottom: '20px' }}>
        <div>
          <input
            type="text"
            placeholder="Todo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginRight: '10px', padding: '5px' }}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginRight: '10px', padding: '5px', width: '200px' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '10px', padding: '5px 10px' }}>
          Add Todo
        </button>
      </form>

      <div>
        <h2>Todos ({todos.length})</h2>
        <ul>
          {todos.map(todo => (
            <li key={todo.id} style={{ marginBottom: '10px' }}>
              <strong>{todo.title}</strong>
              {todo.description && <p>{todo.description}</p>}
              <small>Created: {new Date(todo.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
