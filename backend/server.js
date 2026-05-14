const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoute = require("./api/chat");

const app = express();

app.use(cors({
    origin: "https://khanal-madhav.com.np"
}));
app.use(express.json());

app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});