import express from "express";
import { User } from "./interfaces/todos/user.model";

const app = express();

const PORT = process.env.PORT || 3001;

app.get('/',
  (req, res) => res.send('Hello World')
);


// User.create({
//   id: new Date().toString(),
//   name: 'msaad',
//   email: 'msaad78@gmail.com',
//   isActive: 'ACTIVE'
// }).then((user) => console.log(user))


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});