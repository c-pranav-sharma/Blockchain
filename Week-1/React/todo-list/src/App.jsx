import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Check, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTodos([newTodo, ...todos])
    setInputValue('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="todo-container">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Tasks</h1>
      </motion.header>

      <form onSubmit={addTodo} className="input-group">
        <input 
          type="text" 
          placeholder="Add a new task..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="add-btn">
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </form>

      <div className="todo-list">
        <AnimatePresence mode='popLayout'>
          {todos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <ClipboardList size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No tasks yet. Start by adding one!</p>
            </motion.div>
          ) : (
            todos.map((todo) => (
              <motion.div 
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="todo-item"
              >
                <div 
                  className={`checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && <Check size={14} color="white" />}
                </div>
                
                <span 
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.text}
                </span>

                <button 
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {todos.length > 0 && (
        <div className="stats">
          <span>{todos.length} total tasks</span>
          <span>{completedCount} completed</span>
        </div>
      )}
    </div>
  )
}

export default App
