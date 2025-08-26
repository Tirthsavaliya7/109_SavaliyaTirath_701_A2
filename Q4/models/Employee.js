import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  empid: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  department: String,
  baseSalary: Number,
  hra: Number,
  da: Number,
  gross: Number,
  passwordHash: String,
}, { timestamps: true });

export default mongoose.model("Employee", EmployeeSchema);
