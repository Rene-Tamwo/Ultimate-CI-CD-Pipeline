import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://todo-backend-jdtl.onrender.com'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setError('')
      const response = await axios.get(`${API_URL}/todos`)
      setTodos(response.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
      setError('Failed to load todos')
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    
    try {
      setLoading(true)
      setError('')
      await axios.post(`${API_URL}/todos`, { 
        title: title.trim(), 
        description: description.trim() 
      })
      setTitle('')
      setDescription('')
      await fetchTodos() // Recharger la liste
    } catch (error) {
      console.error('Error adding todo:', error)
      setError('Failed to create todo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Todo App</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={addTodo} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Todo title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginRight: '10px', padding: '8px', width: '200px' }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginRight: '10px', padding: '8px', width: '200px' }}
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          style={{ marginTop: '10px', padding: '8px 16px' }}
          disabled={loading || !title.trim()}
        >
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
      </form>

      <div>
        <h2>Todos ({todos.length})</h2>
        {todos.length === 0 ? (
          <p>No todos yet. Create your first one!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map(todo => (
              <li key={todo.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <strong>{todo.title}</strong>
                {todo.description && <p style={{ margin: '5px 0' }}>{todo.description}</p>}
                <small style={{ color: '#666' }}>
                  Created: {new Date(todo.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
