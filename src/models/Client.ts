import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
