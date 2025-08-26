import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }
});
export default mongoose.model("Product", ProductSchema);
