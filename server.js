var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

const PORT = process.env.PORT || 3000;


// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//For express and handlebars to talk to each others
// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// all the handlebars are in the ‘view’ folder, the following path will look for handlerbar in this folder
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
// A GET route for scraping the startribune/local website
app.get("/", function(req,res){
  db.Article.find({})
  .then (function (dbArticle){
    res.render("index", dbArticle)
  })
})
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.startribune.com/local/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("div.tease").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(element)
          .find("a")
          .text()
          .trim();
        result.summary = $(element)
          .find("div.tease-summary")
          .text();
        result.link = $(element)
          .find("a")
          .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}) 
    .then( articles => res.json(articles))
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id}) 
    .populate("comments")
    .then( article => res.json(article))
});

// Route for saving/updating an Article's associated comments
app.post("/articles/:id", function(req, res) {

  // save the new note that gets posted to the Notes collection
  db.Comment.create(req.body)
  // then find an article from the req.params.id
    .then( dbComment => db.Article.findOneAndUpdate(
            {_id:req.params.id},
            {$push:{comments:dbComment._id}}, { new: true })    
    )
    .then(dbArticle => res.json(dbArticle))
    .catch( err => res.json(500, err))
  // and update it's "note" property with the _id of the new note

});

app.delete("/comments/:id", function (req, res) {
  db.Comment.findOneAndDelete({_id: req.params.id})
  .then(function (data) {
    res.json("Deleted")

    })
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
