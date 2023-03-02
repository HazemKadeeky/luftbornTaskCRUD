const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const { mongoose } = require("./config/dbConnect");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const errorMW = require("./middlewares/errorHandlerMW");

// Sets Up Global Configuration Access.
dotenv.config({ path: "./config/config.env" });

// Sets Up An Express Server App.
const app = express();

// Set Security For HTTP Headers
app.use(helmet());

// Parses The Request Body & Set As JSON In req.body.
app.use(bodyParser.json());

// ------------- ROUTES -------------
app.use("/user", userRoutes);
app.use("/task", taskRoutes);

// Checks For An ENV Port, If Not Run On Port 5000.
let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});

app.use(errorMW);
