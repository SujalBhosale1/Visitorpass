const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic input checks - make sure required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Simple email format check
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Password must be at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if someone already registered with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Hash the password before storing it
    // bcrypt.hash takes the plain password and a "salt rounds" count (10 is the standard)
    // Salt rounds determine how strong the hash is - higher = slower but more secure
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user document in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee" // default to employee if role not given
    });

    res.status(201).json({ message: "Account created successfully", userId: user._id });

  } catch (err) {
    // catch duplicate email errors from MongoDB as well
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    res.status(500).json({ error: err.message });
  }
};

// LOGIN - verify credentials and return a token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input before hitting the database
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Look up the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    // Use bcrypt to compare the entered password with the stored hash
    // bcrypt.compare returns true if they match, false if not
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create a JWT token
    // jwt.sign() takes a payload (data to store), the secret key, and options
    // We store user id and role so we can use them in protected routes
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // token expires in 1 day
    );

    // Send back the token and basic user info (no password)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};