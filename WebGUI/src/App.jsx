import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/books'); 
        setBooks(response.data);
      } catch (err) {
        console
        .error(err);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="App">
      <h1>รายการหนังสือของเรา</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อหนังสือ</th>
            <th>ผู้แต่ง</th>
            <th>สถานะ</th>
            <th>ผู้ยืมล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.book_id}>
              <td style={{ paddingLeft: 10 }} >{book.book_id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.status}</td>
              <td>{book.borrower_name || 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;