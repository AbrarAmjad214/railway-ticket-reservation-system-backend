const City = require("../models/City");

const cities = [
  { name: "Karachi", province: "Sindh" },
  { name: "Lahore", province: "Punjab" },
  { name: "Islamabad", province: "Punjab" },
  { name: "Rawalpindi", province: "Punjab" },
  { name: "Quetta", province: "Balochistan" },
  { name: "Peshawar", province: "Khyber Pakhtunkhwa" },
  { name: "Multan", province: "Punjab" },
  { name: "Faisalabad", province: "Punjab" },
  { name: "Sialkot", province: "Punjab" },
  { name: "Hyderabad", province: "Sindh" },
  { name: "Gujranwala", province: "Punjab" },
  { name: "Sargodha", province: "Punjab" },
  { name: "Bahawalpur", province: "Punjab" },
  { name: "Sukkur", province: "Sindh" },
  { name: "Larkana", province: "Sindh" },
  { name: "Sheikhupura", province: "Punjab" },
  { name: "Rahim Yar Khan", province: "Punjab" },
  { name: "Gujrat", province: "Punjab" },
  { name: "Kasur", province: "Punjab" },
  { name: "Mardan", province: "Khyber Pakhtunkhwa" },
  { name: "Mingora", province: "Khyber Pakhtunkhwa" },
  { name: "Nawabshah", province: "Sindh" },
  { name: "Chiniot", province: "Punjab" },
  { name: "Kotri", province: "Sindh" },
  { name: "Khanpur", province: "Punjab" },
  { name: "Hafizabad", province: "Punjab" },
  { name: "Kohat", province: "Khyber Pakhtunkhwa" },
  { name: "Jacobabad", province: "Sindh" },
  { name: "Shikarpur", province: "Sindh" },
  { name: "Muzaffargarh", province: "Punjab" },
];

const seedCities = async () => {
  try {
    console.log("Seeding cities...");

    // Clear existing cities
    await City.deleteMany({});
    console.log("Cleared existing cities");

    // Insert cities
    const insertedCities = await City.insertMany(cities);
    console.log(`Inserted ${insertedCities.length} cities`);

    return insertedCities;
  } catch (error) {
    console.error("Error seeding cities:", error);
    throw error;
  }
};

module.exports = seedCities;
