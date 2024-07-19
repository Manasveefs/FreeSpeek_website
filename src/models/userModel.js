import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  phoneNumber: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  preferredName: { type: String },
  gender: { type: String, enum: ["male", "female", "non-binary"] },
  preferredGender: { type: String, enum: ["male", "female", "non-binary"] },
  dateOfBirth: { type: Date },
  homeLocation: { type: String },
  isSuspended: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
  },
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
