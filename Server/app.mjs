import express from "express";
import cors from 'cors';
import connectionPool from "./utlis/db.mjs";


const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/books', async (req, res) => {
    try {
        const result = await connectionPool.query(`
            SELECT 
                books.book_id,
                books.title,
                books.author,
                books.status,
                members.name AS borrower_name
            FROM books
            LEFT JOIN borrow ON books.book_id = borrow.book_id
            LEFT JOIN members ON borrow.member_id = members.member_id
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/borrow', async (req, res) => {
    const { book_id, member_id } = req.body;

    try {
        // ตรวจสอบการยืมหนังสือ
        const bookStatus = await connectionPool.query('SELECT status FROM books WHERE book_id = $1', [book_id]);
        if (bookStatus.rows.length === 0) {
            return res.status(404).send('Book not found');
        }
        if (bookStatus.rows[0].status === 'Borrowed') {
            return res.status(400).send('Book is already borrowed');
        }

        // บันทึกการยืม
        const borrowDate = new Date();
        await connectionPool.query('INSERT INTO borrow (book_id, member_id, borrow_date) VALUES ($1, $2, $3)', [book_id, member_id, borrowDate]);

        // อัปเดตสถานะหนังสือเป็น Borrowed
        await connectionPool.query('UPDATE books SET status = \'Borrowed\' WHERE book_id = $1', [book_id]);

        res.status(201).send('Book borrowed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/return', async (req, res) => {
    const { book_id } = req.body;

    try {
        // ตรวจสอบวสถานะหนังสือ
        const bookStatus = await connectionPool.query('SELECT status FROM books WHERE book_id = $1', [book_id]);
        if (bookStatus.rows.length === 0) {
            return res.status(404).send('Book not found');
        }
        if (bookStatus.rows[0].status === 'Available') {
            return res.status(400).send('Book is not borrowed');
        }

        // อัปเดตสถานะหนังสือเป็น Available
        await connectionPool.query('UPDATE books SET status = \'Available\' WHERE book_id = $1', [book_id]);

        // อัปเดต return_date 
        const returnDate = new Date();
        await connectionPool.query('UPDATE borrow SET return_date = $1 WHERE book_id = $2 AND return_date IS NULL', [returnDate, book_id]);

        res.status(200).send('Book returned successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});