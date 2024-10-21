import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.mjs";

const app = express();
dotenv.config();
let PORT = process.env.PORT;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use("/api/users", userRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
