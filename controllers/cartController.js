const Cart = require ('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne ({userId: req.user._id}).populate (
      'items.book'
    );

    if (cart) {
      cart.items.sort (
        (a, b) => new Date (b.book.createdAt) - new Date (a.book.createdAt)
      );
    }
    if (!cart) {
      return res.status (404).json ({message: 'Cart not found'});
    }
    res.status (200).json (cart);
  } catch (error) {
    res.status (500).json ({message: 'Server error', error: error.message});
  }
};

//add item to cart
exports.addToCart = async (req, res) => {
  const {bookId, quantity} = req.body;
  console.log (req.user, bookId, quantity);
  try {
    let cart = await Cart.findOne ({userId: req.user._id});
    if (!cart) {
      cart = new Cart ({userId: req.user._id, items: []});
    }

    const existingItemIndex = cart.items.findIndex (
      item => item.book.toString () === bookId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push ({book: bookId, quantity});
    }

    await cart.save ();
    res.status (200).json ({message: 'Item added to cart', cart});
  } catch (error) {
    res
      .status (500)
      .json ({message: 'Internal server error!', error: error.message});
  }
};

//remove item from cart
exports.removeFromCart = async (req, res) => {
  console.log (req.body);
  const {bookId} = req.body;
  try {
    const cart = await Cart.findOne ({userId: req.user._id});
    if (!cart) {
      return res.status (404).json ({message: 'Cart not found'});
    }

    cart.items = cart.items.filter (item => item.book.toString () !== bookId);

    await cart.save ();
    res.status (200).json ({message: 'Item removed from cart', cart});
  } catch (error) {
    res.status (500).json ({message: 'Server error', error: error.message});
  }
};

//update item quantity in cart
exports.updateCartItemQuantity = async (req, res) => {
  console.log (req.body);
  const {bookId, quantity} = req.body;
  try {
    const cart = await Cart.findOne ({userId: req.user._id});
    if (!cart) {
      return res.status (404).json ({message: 'Cart not found'});
    }

    const item = cart.items.find (item => item.book.toString () === bookId);
    if (!item) {
      return res.status (404).json ({message: 'Item not found in cart'});
    }

    item.quantity = quantity;
    await cart.save ();
    res.status (200).json ({message: 'Item quantity updated', cart});
  } catch (error) {
    res.status (500).json ({message: 'Server error', error: error.message});
  }
};
