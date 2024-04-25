import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import session from "express-session";
const app = express();
const port = 9000;
const API_URL = "http://localhost:4000";
const db = new pg.Client({
  user: "postgres",
  password: "mrcool10",
  database: "note",
  host: "localhost",
  port: 3000,
});

db.connect()
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

app.get("/edit/:id", async (req, res) => {
  try {
    
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
  
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
   try{
    const date= new Date()
    const response = await axios.post(`${API_URL}/posts`,req.body);
    const insertQuery='insert into post(title,content,author,date) values($1,$2,$3,$4)';
    const values=[response.data.title,response.data.content,response.data.author,date];
    const result=await db.query(insertQuery,values)
    res.redirect("/");
   } catch (error) {
   res.status(500).json({ message: "Error creating post" +error.message})
  }})
   


// Partially update a post
app.post("/api/posts/:id", async (req, res) => {

  try {
    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );
   
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});


// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
   {
    const response=await axios.delete(`${API_URL}/posts/delete/${req.params.id}`);
    
    res.redirect("/");
  } //catch (error) {
    //res.status(500).json({ message: "Error deleting post" +error.message});
  //}
});
console.log("hahaa");
await db.query("COMMIT");

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
