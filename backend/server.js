 require('dotenv').config();
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT
app.listen(PORT,()=>{
      console.log(`server is running at PORT ${PORT}`)
})