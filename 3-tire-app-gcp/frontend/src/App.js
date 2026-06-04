import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch messages and categories in parallel
      const [messagesRes, categoriesRes] = await Promise.all([
        axios.get('/api/messages'),
        axios.get('/api/categories')
      ]);

      setMessages(Array.isArray(messagesRes.data?.messages) ? messagesRes.data.messages : []);
      setCategories(Array.isArray(categoriesRes.data?.categories) ? categoriesRes.data.categories : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError('Failed to load data');
      setMessages([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle add message
  const handleAddMessage = async () => {
    if (!newMessage.trim() || !selectedCategory) {
      alert('Please enter a message and select a category');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/messages', {
        message: newMessage.trim(),
        category_id: parseInt(selectedCategory),
        author: 'User'
      });

      // Refresh messages
      await fetchData();
      setNewMessage('');
      setSelectedCategory('');
    } catch (err) {
      console.error("Add message failed:", err);
      setError('Failed to add message');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete message (archive)
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      await fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      setError('Failed to delete message');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 3-Tier Message Board</h1>
        <p>React + Node.js + MySQL on AWS ECS</p>

        {error && <div className="error-message">{error}</div>}

        {/* Add Message Form */}
        <div className="form-container">
          <h2>Add New Message</h2>
          <div className="form">
            <input 
              type="text" 
              placeholder="Enter your message..." 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              disabled={loading}
              onKeyPress={e => e.key === 'Enter' && handleAddMessage()}
            />

            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Category --</option>
              {Array.isArray(categories) &&
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.color && `(${cat.color})`}
                  </option>
                ))
              }
            </select>

            <button 
              onClick={handleAddMessage}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Message'}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="messages-container">
          <h2>All Messages ({messages.length})</h2>

          {loading && <p>Loading...</p>}

          {!loading && (!Array.isArray(messages) || messages.length === 0) ? (
            <p>No messages yet. Be the first to add one!</p>
          ) : (
            <table className="messages-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id} className={`status-${msg.status}`}>
                    <td className="id">{msg.id}</td>
                    <td className="category">
                      <span 
                        className="badge" 
                        style={{backgroundColor: msg.category_color}}
                      >
                        {msg.category_name}
                      </span>
                    </td>
                    <td className="message">{msg.message}</td>
                    <td className="author">{msg.author}</td>
                    <td className="date">{formatDate(msg.created_at)}</td>
                    <td className="action">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="delete-btn"
                        disabled={loading}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </header>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [messagesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/messages`),
        axios.get(`${API_URL}/api/categories`)
      ]);

      setMessages(
        Array.isArray(messagesRes.data?.messages)
          ? messagesRes.data.messages
          : []
      );

      setCategories(
        Array.isArray(categoriesRes.data?.categories)
          ? categoriesRes.data.categories
          : []
      );
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Failed to load data');
      setMessages([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Backend URL:', API_URL);
    fetchData();
  }, []);

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !selectedCategory) {
      alert('Please enter a message and select a category');
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/messages`, {
        message: newMessage.trim(),
        category_id: parseInt(selectedCategory),
        author: 'User'
      });

      await fetchData();

      setNewMessage('');
      setSelectedCategory('');
    } catch (err) {
      console.error('Add message failed:', err);
      setError('Failed to add message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${messageId}`);
      await fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 3-Tier Message Board</h1>
        <p>React + Node.js + MySQL on Google Cloud Run</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-container">
          <h2>Add New Message</h2>

          <div className="form">
            <input
              type="text"
              placeholder="Enter your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading}
              onKeyPress={(e) =>
                e.key === 'Enter' && handleAddMessage()
              }
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Category --</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddMessage}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Message'}
            </button>
          </div>
        </div>

        <div className="messages-container">
          <h2>All Messages ({messages.length})</h2>

          {loading && <p>Loading...</p>}

          {!loading && messages.length === 0 ? (
            <p>No messages yet. Be the first to add one!</p>
          ) : (
            <table className="messages-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.id}</td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            msg.category_color || '#3498db'
                        }}
                      >
                        {msg.category_name}
                      </span>
                    </td>

                    <td>{msg.message}</td>
                    <td>{msg.author}</td>
                    <td>{formatDate(msg.created_at)}</td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteMessage(msg.id)
                        }
                        disabled={loading}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
