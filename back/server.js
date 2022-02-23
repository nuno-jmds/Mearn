//import
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";

import mongoMessages from "./messageModel.js";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1096396",
  key: "2cc51935dc611995d984",
  secret: "f6f62dacd11dff3671ad",
  cluster: "eu",
  useTLS: true,
});

//middlewares
app.use(cors());
app.use(express.json());
//db config
const mongoURI =
  "mongodb+srv://admin:uAWzWlV1aJE2oVJc@cluster0.nldos.mongodb.net/messenger-clone?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("messages").watch();
  //on chage we want to firre off this function
  changeStream.on("change", (change) => {
    pusher.trigger("messages", "newMessage", { change: change });
  });
});
//api routes
app.get("/", (req, res) => res.status(200).send("Hello World😄!"));

app.post("/save/messages", (req, res) => {
  const dbMessage = req.body;

  mongoMessages.create(dbMessage, (err, data) => {
    if (err) {
      //if we got a error
      res.status(500).send(err);
    } else {
      //if posted
      res.status(201).send(data);
    }
  });
});

app.get("/retrieve/conversation", (req, res) => {
  console.log("get:/retrieve/conversation");
  mongoMessages.find((err, data) => {
    console.log("get:/retrieve/conversation Inside mongo find");
    if (err) {
      //if we got a error
      console.log("get:/retrieve/conversation ERROR");
      res.status(500).send(err);
    } else {
      //sort data first
      console.log("get:/retrieve/conversation OK");
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      //if posted
      res.status(200).send(data);
    }
  });
});

//listen
app.listen(port, () => console.log(`listening on localhos: ${port}`));
