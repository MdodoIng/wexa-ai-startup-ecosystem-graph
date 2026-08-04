require("dotenv").config();
const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER || "cognodb";
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.error(
    "Missing required environment variables: COGNODB_URI and COGNODB_PASSWORD",
  );
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const verifyConnectivity = async () => {
  try {
    await driver.verifyConnectivity();
    console.log("Connected to CognoDB successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

const getSession = (database = "neo4j") => {
  return driver.session({ database });
};

const closeDriver = async () => {
  await driver.close();
};

module.exports = { driver, getSession, verifyConnectivity, closeDriver };
