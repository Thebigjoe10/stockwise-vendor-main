import mongoose from "mongoose";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "vendor",
  },
  zipCode: {
    type: String,
    required: true,
  },
  howdoyouhearaboutus: {
    type: String,
    required: true,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  commission: {
    type: Number,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  country: {
    type: String,
    required: true, 
  },
});

// sign in vendor with JWT
vendorSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

// comparing the password for vendor
vendorSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
export default Vendor;
