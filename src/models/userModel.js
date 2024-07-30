import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSuspended: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  phoneNumber: { type: String },
  preferredName: { type: String },
  gender: { type: String, enum: ["male", "female", "non-binary"] },
  preferredGender: { type: String, enum: ["male", "female", "non-binary"] },
  dateOfBirth: { type: Date },
  homeLocation: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
  },
  lastLogin: { type: Date },
  registeredWith: {
    type: String,
    enum: ["email", "google", "facebook", "apple", "phone"],
    default: "email",
  },
  lastLoginWith: {
    type: String,
    enum: ["email", "google", "facebook", "apple", "phone"],
    default: "email",
  },
  privacySetting: {
    fullName: {
      type: String,
      enum: ["anyone", "nearby", "neighborhood", "connection"],
      default: "anyone",
    },
    profilePhoto: {
      type: String,
      enum: ["anyone", "nearby", "neighborhood", "connections"],
      default: "anyone",
    },
    profile: {
      type: String,
      enum: ["anyone", "nearby", "neighborhood", "connections"],
      default: "anyone",
    },
    discoverability: {
      type: String,
      enum: ["anyone", "nearby", "neighborhood", "hidden"],
      default: "anyone",
    },
    mention: { type: Boolean, default: true },
    directMessage: {
      type: String,
      enum: ["anyone", "nearby", "neighborhood", "hidden"],
      default: "anyone",
    },
    emailDiscovery: { type: Boolean, default: true },
    phoneDiscovery: { type: String, default: true },
    sendInvitation: { type: Boolean, default: false },
  },
});

UserSchema.index({ location: "2dsphere" });

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
