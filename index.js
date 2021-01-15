const passport = require("passport");
const session = require("express-session");

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const cors = require("cors");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

MongoClient.connect("mongodb+srv://AnastasiaSaiz:AnastasiaSaiz@cluster0.qkb37.mongodb.net/newJob?retryWrites=true&w=majority", function (error, client) {
  if (error !== null) {
    console.log(error);
  } else {
    db = client.db("newJob");
  }
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (email, password, done) {
      db.collection("users")
        .find({ email: email })
        .toArray(function (err, users) {
          if (users.length === 0) {
            done(null, false);
          }
          const user = users[0];
          if (password === user.password) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user.email);
});
passport.deserializeUser(function (id, done) {
  db.collection("users")
    .find({ email: id })
    .toArray(function (err, users) {
      if (users.length === 0) {
        done(null, null);
      }
      done(null, users[0]);
    });
});
app.post(
  "/api/login",
  passport.authenticate("local", {
    successRedirect: "/api",
    failureRedirect: "/api/fail",
  })
);
app.get("/api/fail", function (req, res) {
  res.status(401).send({ mensaje: "denegado" });
});
app.get("/api", function (req, res) {
  const user = {
    nombre: req.user.nombre,
    tipo: req.user.tipo
  }
  if (req.isAuthenticated() === false) {
    return res.status(401).send({ mensaje: "necesitas loguearte" });
  }
  res.send({ mensaje: "logueado correctamente", usuario: user });
});


app.post("/registro", function (req, res) {
  const candidato = req.body
  db.collection("users").insertOne(candidato, function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else {
      res.send(datos);
    }
  })
})


app.get("/Candidatos", function (req, res) {
  db.collection("users").find().toArray(function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else res.send(datos);
  })
});





app.listen(3000)