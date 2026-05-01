import express from "express";
const app=express();

PORT=3000;
app.use(urlencoded);


app.post("/shortUrl",(req ,res)=>{
  
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});