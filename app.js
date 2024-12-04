const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Wanderlust");
}
main().then(() => console.log("connected to DB")).catch(err => console.log(err));

// app.get("/testListing", async (req, res) => {
//   try {
//     let sampleListing = new Listing({
//       title: "my new villa",
//       description: "By the beach",
//       price: 1200,
//       location: "Calangute Goa",
//       country: "India",
//     });
//     await sampleListing.save();
//     res.send("successful testing");
//   } catch (err) {
//     res.status(500).send("Failed to save listing");
//   }
// });

//home route
app.get("/", (req, res) => {
  res.render("home.ejs");
})

//index route
app.get("/listings", async(req, res) => {
   const allListing = await Listing.find({});
   res.render("index.ejs", {allListing});
})

//New route
app.get("/listings/new", async (req, res) => {
  res.render("new.ejs");
});

//show route
app.get("/listings/:id", async(req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("show.ejs", {listing});
})

//create Route
app.post("/listings", async (req, res) => {
  console.log(req.body); // Inspect the structure of req.body
  try {
    const newListing = new Listing(req.body.listing); // req.body.listing now matches the schema
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(400).send(`Error: ${err.message}`);
  }
});

// DELETE route to remove a listing
app.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  console.log("Listing:", listing);
  
  if (listing) {
    res.render("edit.ejs", { listing });  // Only render if listing is found
  } else {
    res.redirect("/somewhere");  // Redirect if listing is not found
  }
});


// Update route - Handle the form submission
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
