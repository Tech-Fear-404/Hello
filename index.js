const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();

app.use(express.json());
app.use(cors());

// Import schemas
const stationSchema = require('./schema/stationSchema');
const getStationComplaintModel = require('./schema/stationComplaint');
const adminSchema = require('./schema/adminSchema');
// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect('mongodb+srv://techie_1:KO4ehGVm2V3IPRwy@sih.y3uy8.mongodb.net/?retryWrites=true&w=majority&appName=SIH');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

// Calculate bounding box for the given coordinates
const calculation = (lat, long) => {
  const range = 5000;
  const latChange = range / 111320.0;
  const longChange = latChange / Math.cos(lat * Math.PI / 180);
  const lat1 = lat - latChange;
  const lat2 = lat + latChange;
  const long1 = long - longChange;
  const long2 = long + longChange;
  return [lat1, lat2, long1, long2];
};

// Check for stations within the bounding box
const check = async (lat, long) => {
  const [lat1, lat2, long1, long2] = calculation(lat, long);
  try {
    const result = await stationSchema.find({
      lat: { $gte: lat1, $lte: lat2 },
      long: { $gte: long1, $lte: long2 }
    });
    // console.log(result.map(station => station.stationId));  // Logging station IDs
    return result;
  } catch (err) {
    console.error('Error finding stations:', err);
  }
};

// Insert a new station
const insert = async (stationId, lat, long) => {
  try {
    const result = await stationSchema.create({ stationId, lat, long });
    console.log(result);
    return result;
  } catch (err) {
    console.error('Error inserting station:', err);
  }
};

const insertFromJson = async () => {
  try {
    const jsonData = await fs.readFile('./data.json', 'utf8');
    const items = JSON.parse(jsonData); // Parse JSON string into an object/array
    const result = await stationSchema.insertMany(items);
    console.log('Data inserted successfully:', result);
  } catch (err) {
    console.error('Error reading JSON file:', err);
  }
};
const insertComplaint=async()=>{
  try{
    const checks=await check(12.9733,77.5941);
    console.log(checks);
    const stationId=checks[0].stationId;
    console.log(stationId);
    const stationComplaintModel=getStationComplaintModel(stationId);
    const result=await stationComplaintModel.create({complaint:"no water",status:"pending",date:Date.now()});
  }catch(err){
    console.error('Error inserting complaint:', err);
  }
}
app.listen(3000, async () => {
  await connect();
  console.log('Server started on port 3000');
  // insertFromJson();
  insertComplaint();
});
