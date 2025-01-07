import mongoose from 'mongoose';

const ActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const REActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  actions: [ActionSchema],
  reactions: [REActionSchema],
});

const Service = mongoose.model('Service', ServiceSchema);

export default Service;
