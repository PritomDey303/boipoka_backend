const Review = require ('../models/Review');
const mongoose = require ('mongoose');
exports.addReview = async (req, res, next) => {
  try {
    const {bookId, rating, comment} = req.body;
    const userId = req.user.id;
    const reviewData = {
      user: userId,
      book: bookId,
      rating: rating,
      comment: comment,
    };
    if (!mongoose.Types.ObjectId.isValid (bookId)) {
      return res.status (400).json ({message: 'Invalid book id!'});
    }

    const review = await Review.create (reviewData);
    review.save ();
    res.status (201).json ({
      message: 'Review added successfully!',
      review: review,
    });
  } catch (err) {
    console.log (err.message);
    res.status (500).json ({message: 'Internal server error!'});
  }
};

//get reviews using post id
exports.getReviews = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid (bookId)) {
      res.status (400).json ({message: 'Invalid book id.'});
    }
    const review = await Review.find ({book: bookId})
      .populate ({
        path: 'user',
        select: 'name email',
      })
      .sort ({createdAt: -1});
    if (!review) {
      return res.status (404).json ({message: 'No reviews found!'});
    }
    return res.status (200).json ({
      message: 'Data fetched successfully!',
      data: review,
    });
  } catch (err) {
    console.log (err.message);
    res.status (500).json ({
      message: 'Internal server error!',
    });
  }
};
