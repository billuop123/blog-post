import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { clearCache } from "ejs";
import session from "express-session";
const app = express();
const port = 4000;
const db = new pg.Client({
  user: "postgres",
  password: "mrcool10",
  database: "note",
  host: "localhost",
  port: 3000,
});
db.connect()
  .then(()=>{
    console.log("tables created");
    createTable()
  })
  .catch((error)=>{
    console.log("unable to create table");
  })
// In-memory data store


function createTable(){
  db.query("BEGIN")
    .then(()=>{
      return db.query(`create table if not exists post(
        id Serial ,
        title varchar(255) ,
        content Text,
        author varchar(255),
        date Date
      )`)
    })
}



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/posts", async(req, res) => {
  let response=await db.query(`SELECT *from post `);
let posts=response.rows
  res.json(posts);
});


app.get("/posts/:id",async (req, res) => {
  let response=await db.query(`SELECT *from post `);
let posts=response.rows
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});
let oldId=3
// POST a new post
app.post("/posts", async(req, res) => {
  let newId=oldId+1;
  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date(),
  };
oldId=newId
 

res.json(post)


  res.status(201).json();
});

app.patch("/posts/:id", async(req, res) => {
  let response=await db.query(`SELECT *from post `);
let posts=response.rows
let post=0
  // const post = posts.find((p) => p.id === parseInt(req.params.id));
  for(let i=0;i<response.rows.length;i++){
    if(response.rows[i].id==parseInt(req.params.id))
      {
        post=response.rows[i]
      }
  }
  if (!post) return res.status(404).json({ message: "Post not found" });

   if (req.body.title) /*post.title = req.body.title;*/await db.query("update post set title=$1 where id=$2",[req.body.title,req.params.id])

  if (req.body.content) await db.query("update post set content=$1 where id=$2",[req.body.content,req.params.id])

  if (req.body.author) await db.query("update post set author=$1 where id=$2",[req.body.author,req.params.id])

await db.query("COMMIT");
  res.json(post);
});
app.use(
session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
}))

// DELETE a specific post by providing the post id
app.delete("/posts/delete/:id", async(req, res) => {
  try {
    const result = await db.query('DELETE FROM post WHERE id = $1', [req.params.id]);
    await db.query("COMMIT");
    res.status(200).json({ message: 'Row deleted successfully' });
   
  } catch (error) {
    res.status(500).json({ message: 'Error deleting row', error: error.message });
  }
 });

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
