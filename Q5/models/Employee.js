import mongoose from "mongoose";
const LeaveSchema = new mongoose.Schema({
  date: String,
  reason: String,
  granted: { type: Boolean, default: false }
}, { _id: false });

const EmployeeSchema = new mongoose.Schema({
  empid: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  department: String,
  leaves: [LeaveSchema]
});
export default mongoose.model("Emp", EmployeeSchema);
