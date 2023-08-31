//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event listener for connection timeout
mongoose.connection.on('timeout', () => {
  console.log('MongoDB connection timeout. Check if the MongoDB server is running.');
  process.exit(1); // Exit the application on timeout
});

// Event listener for successful connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Event listener for connection error
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to aff a new item"
});
const item3 = new Item({
  name: "<--Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems)
// .then(savedItem => {
//   console.log('Saved To-Do item:', savedItem);
// })
// .catch(err => {
//   console.error('Error saving To-Do item:', err);
// });

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// ... (Previous code)

app.get("/", async function(req, res) {
  try {
    const day = date.getDate();

    const foundItems = await Item.find({}); // Use await to get the result of the query
    if (foundItems.length === 0) {
      // Insert defaultItems into the database only if the database is empty
      await Item.insertMany(defaultItems);
      console.log("Default items inserted successfully!");
      // Now, retrieve the items again after insertion
      const updatedItems = await Item.find({});
      res.render("list", { listTitle: day, newListItems: updatedItems });
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// ... (Rest of the code)


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");
  
});

app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox;
  try {
    await Item.findOneAndDelete({ _id: checkedItemId });
    console.log("Successfully deleted checked item");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
