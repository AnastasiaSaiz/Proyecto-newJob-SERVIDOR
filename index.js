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
    tipo: req.user.tipo,
    email: req.user.email,
    lugar: req.user.lugar,
    rol: req.user.rol,
    experiencia: req.user.experiencia,
    habilidades: req.user.habilidades,
    dsocial: req.user.dsocial,
    tamanyo: req.user.tamanyo,
    actividad: req.user.actividad,
    direccion: req.user.direccion,
    poblacion: req.user.poblacion,
    pais: req.user.pais,
    provincia: req.user.provincia,
    cp: req.user.cp,
    telefono: req.user.telefono,
    web: req.user.web,
    twitter: req.user.twitter,
    descripcion: req.user.descripcion,
    persona: req.user.persona,
    password: req.user.password

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
      res.send({ registrado: true });
    }
  })
})

app.put("/editarcandidato", function (req, res) {
  console.log(req.body);
  const email = req.body.email;
  const candidato = {
    lugar: req.body.lugar,
    rol: req.body.rol,
    experiencia: req.body.experiencia,
    habilidades: req.body.habilidades,

  };

  db.collection("users").updateOne({ email: email }, { $set: candidato }, function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else {
      res.send(datos);
    }
  })
});

app.put("/editarempresa", function (req, res) {
  console.log(req.body);
  const email = req.body.email;
  const empresa = {
    nombre: req.body.nombre,
    dsocial: req.body.dsocial,
    tamanyo: req.body.tamanyo,
    actividad: req.body.actividad,
    direccion: req.body.direccion,
    poblacion: req.body.poblacion,
    pais: req.body.pais,
    provincia: req.body.provincia,
    cp: req.body.cp,
    telefono: req.body.telefono,
    web: req.body.web,
    twitter: req.body.twitter,
    descripcion: req.body.descripcion,
    persona: req.body.persona,
    password: req.body.password

  };

  db.collection("users").updateOne({ email: email }, { $set: empresa }, function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else {
      res.send(datos);
    }
  })
});


app.get("/Candidatos/:email", function (req, res) {
  const email = req.params.email
  db.collection("users").find({ email: email }).toArray(function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else res.send(datos);
  })
});

app.post("/nuevaOferta", function (req, res) {
  const oferta = req.body
  db.collection("ofertas").insertOne(oferta, function (error, datos) {
    if (error !== null) {
      res.send(error);
    } else {
      res.send(datos);
    }
  })
})




app.listen(3000)