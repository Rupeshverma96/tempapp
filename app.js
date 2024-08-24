import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

const secretKey = process.env.SECRET_KEY || "your-fallback-secret-key";
const port = process.env.PORT || 3000;

// Create an Express application
const app = express();

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  const { error, convertedTemp, fromUnit, toUnit, conversionHistory } = req.session;
  res.render("index", {
    error: error || null,
    convertedTemp: convertedTemp || null,
    fromUnit: fromUnit || null,
    toUnit: toUnit || null,
    conversionHistory: conversionHistory || [],
  });

  req.session.error = null;
  req.session.convertedTemp = null;
  req.session.fromUnit = null;
  req.session.toUnit = null;
});

app.post("/convert", (req, res) => {
  let temp = parseFloat(req.body.temp);
  let fromUnit = req.body.fromUnit;
  let toUnit = req.body.toUnit;
  let convertedTemp = null;
  let error = null;

  if (isNaN(temp)) {
    error = "Please enter a valid number for temperature.";
  } else {
    if (fromUnit === "celsius" && toUnit === "fahrenheit") {
      convertedTemp = (temp * 9) / 5 + 32;
    } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
      convertedTemp = ((temp - 32) * 5) / 9;
    } else {
      convertedTemp = temp;
    }
  }

  if (!req.session.conversionHistory) {
    req.session.conversionHistory = [];
  }

  if (!error) {
    req.session.conversionHistory.push({
      temp,
      fromUnit,
      toUnit,
      convertedTemp,
    });
  }

  req.session.error = error;
  req.session.convertedTemp = convertedTemp;
  req.session.fromUnit = fromUnit;
  req.session.toUnit = toUnit;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
