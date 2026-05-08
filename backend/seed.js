const mongoose = require('mongoose');
require('dotenv').config();
const Expert = require('./models/Expert');

const generateSlots = () => {
  const slots = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    times.forEach((time) => slots.push({ date: dateStr, time, isBooked: false }));
  }
  return slots;
};

const experts = [
  { name: 'Dr. Arjun Mehta', category: 'Technology', experience: 12, rating: 4.9, bio: 'Senior software architect specializing in distributed systems and cloud-native applications.', avatar: 'AM' },
  { name: 'Priya Sharma', category: 'Finance', experience: 8, rating: 4.7, bio: 'Chartered financial analyst with expertise in portfolio management and wealth creation strategies.', avatar: 'PS' },
  { name: 'Rohit Verma', category: 'Health', experience: 15, rating: 4.8, bio: 'Sports medicine physician helping professionals optimize performance and prevent injuries.', avatar: 'RV' },
  { name: 'Anita Desai', category: 'Design', experience: 10, rating: 4.6, bio: 'UX/UI designer who has led design systems at Fortune 500 companies worldwide.', avatar: 'AD' },
  { name: 'Karan Singh', category: 'Marketing', experience: 9, rating: 4.5, bio: 'Growth hacker and digital strategist who scaled multiple startups from 0 to 1M users.', avatar: 'KS' },
  { name: 'Meera Nair', category: 'Legal', experience: 11, rating: 4.8, bio: 'Corporate lawyer specializing in startup law, IP protection, and international contracts.', avatar: 'MN' },
  { name: 'Vikram Patel', category: 'Business', experience: 14, rating: 4.9, bio: 'Serial entrepreneur and business mentor who has founded and exited 3 successful ventures.', avatar: 'VP' },
  { name: 'Sunita Joshi', category: 'Education', experience: 7, rating: 4.6, bio: 'EdTech pioneer creating personalized learning experiences with AI and adaptive methodologies.', avatar: 'SJ' },
  { name: 'Aditya Kumar', category: 'Technology', experience: 6, rating: 4.4, bio: 'Full-stack developer and DevOps engineer specializing in React, Node.js, and Kubernetes.', avatar: 'AK' },
  { name: 'Deepa Rao', category: 'Finance', experience: 13, rating: 4.7, bio: 'Investment banker turned personal finance coach helping individuals achieve financial freedom.', avatar: 'DR' },
  { name: 'Rajesh Gupta', category: 'Health', experience: 20, rating: 5.0, bio: 'Nutritionist and holistic wellness coach with certifications from leading global institutions.', avatar: 'RG' },
  { name: 'Neha Kapoor', category: 'Design', experience: 5, rating: 4.3, bio: 'Brand identity designer crafting memorable visual experiences for emerging companies.', avatar: 'NK' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking');
  await Expert.deleteMany({});
  const expertsWithSlots = experts.map((e) => ({ ...e, timeSlots: generateSlots() }));
  await Expert.insertMany(expertsWithSlots);
  console.log(`✅ Seeded ${experts.length} experts with time slots`);
  await mongoose.disconnect();
}

seed().catch(console.error);
