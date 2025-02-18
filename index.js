const express = require("express");
const path= require("path");
const { connectToMongoDB } = require("./connect");
const cookieParser= require("cookie-parser");
const {restrictToLoggedinUserOnly, checkAuth} = require("./middleware/auth")
const URL = require("./models/url");


const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute= require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/dhinchak").then(() =>
  console.log("Connected to MongoDB")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));  //for supporting form data
app.use(cookieParser());



app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user",  userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
            timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
