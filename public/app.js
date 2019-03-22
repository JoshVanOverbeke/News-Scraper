$(document).ready(function () {
  update()
  // Grab the articles as a json
  // $.getJSON("/articles", function(data) {
  //   // For each one
  //   for (var i = 0; i < data.length; i++) {
  //     // Display the apropos information on the page
  //     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  //   }
  // });


  // Whenever someone clicks a p tag
  $(document).on("click", "h3", function() {
    // Empty the comments from the note section
    $("#comments").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the comment information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#comments").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#comments").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Comment</button>");

        // If there's a comment in the article
        if (data.comments.length > 0) {
          for(var i in data.comments){
          // Place the title of the note in the title input
          var div = $("<div>", {id: data.comments[i]._id});
          div.append("<h4>"+data.comments[i].title+"</h4>");
          div.append("<p>"+data.comments[i].body+"</p>");
          div.append("<button data-id='" + data.comments[i]._id + "' id='delcomment'>Delete</button>");
          $("#comments").append(div);
          }
        }
      });
  });

  // When you click the comment button
  $(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the comments section
        $("#comments").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
});

// When you click the delete button
$(document).on("click", "#delcomment", function() {
  // Grab the id associated with the article from the submit button
  var thatId = $(this).attr("data-id");

  // Run a DELETE request to delete the comment, using what's entered in the inputs
  $.ajax({
    method: "DELETE",
    url: "/comments/" + thatId,
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the comments section
      location.reload()
    });
});
function update(){
  $.ajax({
    url: "/scrape",
    type: 'GET',
}).then(function (result) {
    console.log("changes made!");
})
}

