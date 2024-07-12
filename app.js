// const express = require('express');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const User = require('./models/Users');
// const crypto = require('crypto');
// const cors = require('cors') ;
// dotenv.config();

// const app = express();

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected...'))
// .catch(err => console.error(err));

// app.use(cors()) ;
// app.use(express.json());

// const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 256 bits (32 characters)
// const IV_LENGTH = 16; // For AES, this is always 16

// function encrypt(text) {
//   let iv = crypto.randomBytes(IV_LENGTH);
//   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
//   let encrypted = cipher.update(text);

//   encrypted = Buffer.concat([encrypted, cipher.final()]);

//   return iv.toString('hex') + ':' + encrypted.toString('hex');
// }

// function decrypt(text) {
//   let textParts = text.split(':');
//   let iv = Buffer.from(textParts.shift(), 'hex');
//   let encryptedText = Buffer.from(textParts.join(':'), 'hex');
//   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
//   let decrypted = decipher.update(encryptedText);

//   decrypted = Buffer.concat([decrypted, decipher.final()]);

//   return decrypted.toString();
// }

// // Register route
// app.post('/api/auth/register', async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     user = new User({
//       name,
//       email,
//       password: encrypt(password),
//       role,
//     });

//     await user.save();

//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Login route
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     const decryptedPassword = decrypt(user.password);
//     if (password !== decryptedPassword) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Middleware to verify token
// const auth = (req, res, next) => {
//   const token = req.header('x-auth-token');

//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };

// // Fetch all admins route with decrypted passwords
// app.get('/api/auth/admins', auth, async (req, res) => {
//   try {
//     // Check if the requesting user is a superadmin
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
//     }

//     const admins = await User.find({ role: 'admin' });

//     const adminsWithDecryptedPasswords = admins.map(admin => ({
//       id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       role: admin.role,
//       password: decrypt(admin.password)
//     }));

//     res.json(adminsWithDecryptedPasswords);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Protected route example
// app.get('/api/auth/protected', auth, (req, res) => {
//   res.json({ msg: 'Welcome to the protected route', user: req.user });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const User = require("./models/Users");
const cors = require("cors");

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

// Register route
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password: encrypt(password),
      role,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const decryptedPassword = decrypt(user.password);
    if (password !== decryptedPassword) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Fetch all admins route with decrypted passwords
app.get("/api/auth/admins", auth, async (req, res) => {
  try {
    // Check if the requesting user is a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ msg: "Access denied. Superadmin only." });
    }

    const admins = await User.find({ role: "admin" });

    const adminsWithDecryptedPasswords = admins.map((admin) => ({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: decrypt(admin.password),
    }));

    res.json(adminsWithDecryptedPasswords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Route for admins to create users
app.post("/api/auth/create-user", auth, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the requesting user is an admin or superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin or Superadmin only." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password: encrypt(password),
      role: "user",
      createdBy: req.user.id,
    });

    await user.save();

    res.json({ msg: "User created successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Fetch all users created by an admin
app.get("/api/auth/users", auth, async (req, res) => {
  try {
    // Check if the requesting user is an admin or superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin or Superadmin only." });
    }

    let users;
    if (req.user.role === "admin") {
      users = await User.find({ createdBy: req.user.id }).select("-password");
    } else if (req.user.role === "superadmin") {
      users = await User.find({ role: "user" })
        .populate("createdBy", "name email")
        .select("-password");
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Fetch all users with admin details (superadmin only)
app.get("/api/auth/all-users", auth, async (req, res) => {
  try {
    // Check if the requesting user is a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ msg: "Access denied. Superadmin only." });
    }

    const users = await User.find({ role: "user" }).populate(
      "createdBy",
      "name email"
    );

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Edit user/admin route
app.put("/api/auth/edit-user/:id", auth, async (req, res) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.id;

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    if (currentUser.role === "admin" && role === "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin cannot edit other admins." });
    }

    if (currentUser.role === "admin") {
      const userToEdit = await User.findById(userId);
      if (!userToEdit) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (userToEdit.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ msg: "Access denied. Admin can only edit their own users." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        password: password ? encrypt(password) : undefined,
        role,
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete user/admin route
app.delete("/api/auth/delete-user/:id", auth, async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    // Check if the current user is allowed to delete the user/admin
    if (currentUser.role === "admin" && role === "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin cannot delete other admins." });
    }

    if (currentUser.role === "admin") {
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (userToDelete.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({
            msg: "Access denied. Admin can only delete their own users.",
          });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post('/api/auth/select-lottery-winner', auth, async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if the requesting user is a superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure the user is not an admin or superadmin
    if (user.role !== 'user') {
      return res.status(400).json({ msg: 'Cannot select an admin or superadmin for the lottery.' });
    }

    // Ensure the user has not already won the lottery this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (user.lastWinDate && user.lastWinDate >= startOfMonth) {
      return res.status(400).json({ msg: 'User has already won the lottery this month.' });
    }

    // Check if there is already a lottery winner for this month under the same admin
    const existingWinner = await User.findOne({
      createdBy: user.createdBy,
      role: 'user',
      lastWinDate: { $gte: startOfMonth }
    });

    if (existingWinner) {
      return res.status(400).json({ msg: 'This admin already has a lottery winner for this month.' });
    }

    // Check if all users under the same admin have won
    const usersUnderAdmin = await User.find({ createdBy: user.createdBy, role: 'user' });
    const usersWhoHaveNotWon = usersUnderAdmin.filter(u => !u.hasWonLottery);

    if (usersWhoHaveNotWon.length === 0) {
      // Reset hasWonLottery for all users under this admin
      await User.updateMany(
        { createdBy: user.createdBy, role: 'user' },
        { $set: { hasWonLottery: false } }
      );
      // Refetch the users after resetting
      const resetUsers = await User.find({ createdBy: user.createdBy, role: 'user' });
      // Check if the selected user has won the lottery previously
      const selectedUser = resetUsers.find(u => u._id.toString() === userId);
      if (selectedUser.hasWonLottery) {
        return res.status(400).json({ msg: 'Other users need to win the lottery first.' });
      }
    } else if (!usersWhoHaveNotWon.some(u => u._id.toString() === userId)) {
      return res.status(400).json({ msg: 'Other users need to win the lottery first.' });
    }

    // Update the user's lottery status
    user.hasWonLottery = true;
    user.lastWinDate = now;
    await user.save();

    res.json({ msg: 'Lottery winner selected', winner: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/auth/all-winners', auth, async (req, res) => {
  try {
    // Check if the requesting user is a superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
    }

    // Find all admins
    const admins = await User.find({ role: 'admin' });

    // Get all users who have won the lottery
    const allWinners = await User.find({ role: 'user', hasWonLottery: true });

    // Organize winners by their respective admin
    const adminWinners = admins.map(admin => {
      const adminUsers = allWinners.filter(user => user.createdBy.toString() === admin._id.toString());
      return {
        admin,
        winners: adminUsers
      };
    });

    res.json({ adminWinners });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/auth/admin-winners', auth, async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    // Find all users created by this admin who have won the lottery
    const winners = await User.find({ createdBy: req.user.id, role: 'user', hasWonLottery: true });

    res.json({ winners });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Protected route example
app.get("/api/auth/protected", auth, (req, res) => {
  res.json({ msg: "Welcome to the protected route", user: req.user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
