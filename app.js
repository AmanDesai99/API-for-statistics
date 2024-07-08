const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema for the Transactions collection
const transactionSchema = new mongoose.Schema({
  dateOfSale: Date,
  saleAmount: Number,
  product: {
    title: String,
    description: String,
    price: Number
  },
  region: String,
  isSold: Boolean
});

// Create the Transactions model
const Transactions = mongoose.model('Transactions', transactionSchema);

// API to get statistics for a selected month
app.get('/statistics/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
  const endDate = new Date(startDate.getTime() + 31 * 24 * 60 * 60 * 1000);

  const totalSaleAmount = await Transactions.aggregate([
    {
      $match: {
        dateOfSale: { $gte: startDate, $lt: endDate },
        isSold: true
      }
    },
    {
      $group: {
        _id: null,
        totalSaleAmount: { $sum: '$saleAmount' }
      }
    }
  ]);

  const totalSoldItems = await Transactions.countDocuments({
    dateOfSale: { $gte: startDate, $lt: endDate },
    isSold: true
  });

  const totalNotSoldItems = await Transactions.countDocuments({
    dateOfSale: { $gte: startDate, $lt: endDate },
    isSold: false
  });

  res.send({
    totalSaleAmount: totalSaleAmount[0].totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
