const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CommunityAdmin = require("../model/communityAdmin");

// SECRET key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Add (Register new Community Admin)
const addCommunityAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if email already exists
    const existing = await CommunityAdmin.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If single role provided as string, convert to array
    const roleArray = Array.isArray(role) ? role : role ? [role] : [];

    const admin = await CommunityAdmin.create({
      username,
      email,
      password: hashedPassword,
      role: roleArray,
    });

    res.status(201).json({ message: "Community Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Error creating Community Admin", error });
  }
};

// ✅ Get all admins
const getAllCommunityAdmins = async (req, res) => {
  try {
    const admins = await CommunityAdmin.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Community Admins", error });
  }
};

// ✅ Get admin by ID
const getCommunityAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await CommunityAdmin.findByPk(id);

    if (!admin) return res.status(404).json({ message: "Community Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Community Admin", error });
  }
};

// ✅ Update admin
const updateCommunityAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const admin = await CommunityAdmin.findByPk(id);
    if (!admin) return res.status(404).json({ message: "Community Admin not found" });

    let updatedData = { username, email };

    // Hash password if provided
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Handle role updates (convert to array if not already)
    if (role) {
      updatedData.role = Array.isArray(role) ? role : [role];
    }

    await admin.update(updatedData);
    res.json({ message: "Community Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Error updating Community Admin", error });
  }
};

// ✅ Delete admin
const deleteCommunityAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await CommunityAdmin.findByPk(id);

    if (!admin) return res.status(404).json({ message: "Community Admin not found" });

    await admin.destroy();
    res.json({ message: "Community Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Community Admin", error });
  }
};

// ✅ Login with role-based response
const loginCommunityAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await CommunityAdmin.findOne({ where: { email } });

    if (!admin) return res.status(404).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Include roles in JWT payload
    const token = jwt.sign(
      { id: admin.caid, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: admin.caid,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// ✅ Logout
const logoutCommunityAdmin = async (req, res) => {
  try {
    // For JWT, logout is handled client-side by removing the token
    res.json({ message: "Logout successful. Please clear token from client storage." });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

module.exports = {
  addCommunityAdmin,
  getAllCommunityAdmins,
  getCommunityAdminById,
  updateCommunityAdmin,
  deleteCommunityAdmin,
  loginCommunityAdmin,
  logoutCommunityAdmin,
};
