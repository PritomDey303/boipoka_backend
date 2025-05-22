const Book = require ('../models/Book');
const mongoose = require ('mongoose');
exports.createBooks = async (req, res, next) => {
  try {
    const books = req.body;

    if (!Array.isArray (books) || books.length === 0) {
      return res.status (400).json ({message: 'No books provided'});
    }
    console.log (books);

    const insertedBooks = await Book.insertMany (books);
    res.status (201).json ({
      message: `${insertedBooks.length} books inserted successfully`,
      data: insertedBooks,
    });
  } catch (err) {
    console.error ('Bulk insert error:', err);
    res
      .status (500)
      .json ({message: 'Failed to insert books', error: err.message});
  }
};

//get all books
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find ();
    res.status (200).json ({
      message: 'Books fetched successfully',
      data: books,
    });
  } catch (err) {
    console.error ('Error fetching books:', err);
    res.status (500).json ({
      message: 'Failed to fetch books',
      error: err.message,
    });
  }
};
///////
//get searched books

exports.getSearchedBooks = async (req, res, next) => {
  try {
    let dataFrom = req.query.data_from.trim ();
    let search = req.query.search.trim ();
    const price = req.query.price;
    let limit = parseInt (req.query.limit);

    if (!dataFrom || !search) {
      return res.status (400).json ({message: 'Invalid Query!'});
    }

    //checking limit
    if (isNaN (limit) || limit <= 0) {
      limit = 10;
    }
    let sortOrder = 1;
    if (price === 'desc') {
      sortOrder = -1;
    }

    let books = [];
    //conditionally data fetching
    if (dataFrom === 'category') {
      books = await Book.find ({category: search})
        .sort ({discount_price: sortOrder})
        .limit (limit);
      console.log (books);
    } else if (dataFrom === 'tags') {
      books = await Book.find ({tags: search})
        .sort ({discount_price: sortOrder})
        .limit (limit);
    } else {
      return res.status (400).json ({message: 'Invalid Query'});
    }

    return res.status (200).json ({
      message: 'Data fetched successfully.',
      data: books,
    });
  } catch (err) {
    console.log (err.message);
    res.status (500).json ('Internal server error!');
  }
};

///////////
//get book by id

exports.getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid (bookId)) {
      return res.status (400).json ({
        message: 'Invalid book id!',
      });
    }

    const book = await Book.findById (bookId);
    if (!book) {
      return res.status (404).json ({message: 'Book not found'});
    }

    return res.status (200).json ({
      message: 'data fetched successfully!',
      data: book,
    });
  } catch (err) {
    console.log (err.message);
    res.status (500).json ({
      message: 'Internal server error!',
    });
  }
};

//create book

exports.createSingleBook = async (req, res, next) => {
  try {
    const {
      title_bn,
      title_en,
      author_bn,
      author_en,
      category,
      tags,
      price,
      discount_price,
      description,
      language,
      publication,
    } = req.body;

    const cover_image = req.file?.path;

    const parsedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // Creating book instance
    const book = new Book({
      title_bn,
      title_en,
      author_bn,
      author_en,
      category,
      tags: parsedTags,
      price,
      discount_price,
      description,
      language,
      publication,
      cover_image,
    });

    const savedBook = await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      data: savedBook,
    });
  } catch (err) {
    console.error('Create book error:', err);
    res.status(500).json({
      message: 'Internal server error!',
    });
  }
};

