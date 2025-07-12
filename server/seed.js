import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import SwapRequest from "./models/SwapRequest.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Remove existing data
  await User.deleteMany({});
  await SwapRequest.deleteMany({});

  // Create sample users
  const users = await User.insertMany([
    {
      name: "Alice Smith",
      email: "alice@example.com",
      password: await bcrypt.hash("alicepassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Delhi, IN",
      profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
      skillsOffered: [
        { name: "Guitar", description: "Can teach basic chords and songs.", level: "Intermediate" },
        { name: "Web Design", description: "Can teach HTML/CSS and Figma basics.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "French", description: "Want to learn conversational French.", level: "Beginner" },
        { name: "Yoga", description: "Interested in beginner yoga.", level: "Beginner" },
        { name: "Photography", description: "Want to learn portrait photography.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: true, evenings: true, mornings: false },
      completedSwaps: 2,
      rating: { average: 4.2, count: 15 }
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      password: await bcrypt.hash("bobpassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Mumbai, IN",
      profilePhoto: "https://randomuser.me/api/portraits/men/2.jpg",
      skillsOffered: [
        { name: "Python", description: "Can help with Python basics and data science.", level: "Expert" },
        { name: "Chess", description: "Can teach chess strategies and openings.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "Cooking", description: "Want to learn Italian recipes.", level: "Beginner" },
        { name: "Painting", description: "Interested in watercolor techniques.", level: "Beginner" },
        { name: "Video Editing", description: "Want to learn Adobe Premiere basics.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: false, evenings: true, mornings: true },
      completedSwaps: 1,
      rating: { average: 4.0, count: 8 }
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("adminpassword", 10),
      isAdmin: true,
      isBanned: false,
      location: "Bangalore, IN",
      profilePhoto: "https://randomuser.me/api/portraits/men/3.jpg",
      skillsOffered: [
        { name: "Photography", description: "Can teach DSLR basics and editing.", level: "Intermediate" },
        { name: "Public Speaking", description: "Can help with presentations and confidence.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "Yoga", description: "Interested in intermediate yoga.", level: "Beginner" },
        { name: "Coding", description: "Want to learn JavaScript basics.", level: "Beginner" },
        { name: "UI/UX Design", description: "Want to learn Figma and prototyping.", level: "Beginner" }
      ],
      availability: { weekdays: false, weekends: true, evenings: false, mornings: true },
      completedSwaps: 0,
      rating: { average: 4.5, count: 22 }
    },
    {
      name: "Carol Davis",
      email: "carol@example.com",
      password: await bcrypt.hash("carolpassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Austin, TX",
      profilePhoto: "https://randomuser.me/api/portraits/women/4.jpg",
      skillsOffered: [
        { name: "Excel", description: "Can teach Excel formulas and charts.", level: "Expert" },
        { name: "Data Analysis", description: "Can help with data analysis projects.", level: "Advanced" },
        { name: "Project Management", description: "Can teach project planning.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "Graphic Design", description: "Want to learn Photoshop.", level: "Beginner" },
        { name: "Photography", description: "Interested in DSLR basics.", level: "Beginner" }
      ],
      availability: { weekdays: false, weekends: true, evenings: true, mornings: false },
      completedSwaps: 3,
      rating: { average: 4.7, count: 18 }
    },
    {
      name: "David Wilson",
      email: "david@example.com",
      password: await bcrypt.hash("davidpassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Seattle, WA",
      profilePhoto: "https://randomuser.me/api/portraits/men/5.jpg",
      skillsOffered: [
        { name: "JavaScript", description: "Can teach JS and React basics.", level: "Expert" },
        { name: "React", description: "Can help with React projects.", level: "Advanced" },
        { name: "Node.js", description: "Can teach backend development.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "UI/UX Design", description: "Want to learn Figma.", level: "Beginner" },
        { name: "Marketing", description: "Interested in digital marketing.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: false, evenings: true, mornings: false },
      completedSwaps: 2,
      rating: { average: 4.6, count: 12 }
    },
    {
      name: "Emma Brown",
      email: "emma@example.com",
      password: await bcrypt.hash("emmapassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "London, UK",
      profilePhoto: "https://randomuser.me/api/portraits/women/6.jpg",
      skillsOffered: [
        { name: "Painting", description: "Can teach watercolor and acrylic.", level: "Advanced" },
        { name: "Sketching", description: "Can help with pencil sketching.", level: "Intermediate" }
      ],
      skillsWanted: [
        { name: "French", description: "Want to learn French.", level: "Beginner" },
        { name: "Cooking", description: "Interested in baking.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: true, evenings: false, mornings: true },
      completedSwaps: 4,
      rating: { average: 4.8, count: 20 }
    },
    {
      name: "Frank Miller",
      email: "frank@example.com",
      password: await bcrypt.hash("frankpassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Berlin, DE",
      profilePhoto: "https://randomuser.me/api/portraits/men/7.jpg",
      skillsOffered: [
        { name: "Cooking", description: "Can teach German and Italian recipes.", level: "Expert" },
        { name: "Baking", description: "Can help with bread and cakes.", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "Python", description: "Want to learn Python basics.", level: "Beginner" },
        { name: "Chess", description: "Interested in chess openings.", level: "Beginner" }
      ],
      availability: { weekdays: false, weekends: true, evenings: true, mornings: true },
      completedSwaps: 5,
      rating: { average: 4.3, count: 10 }
    },
    {
      name: "Grace Lee",
      email: "grace@example.com",
      password: await bcrypt.hash("gracepassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Singapore",
      profilePhoto: "https://randomuser.me/api/portraits/women/8.jpg",
      skillsOffered: [
        { name: "Yoga", description: "Can teach beginner and intermediate yoga.", level: "Advanced" },
        { name: "Meditation", description: "Can help with mindfulness.", level: "Expert" }
      ],
      skillsWanted: [
        { name: "Painting", description: "Want to learn watercolor.", level: "Beginner" },
        { name: "Web Design", description: "Interested in HTML/CSS.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: true, evenings: false, mornings: true },
      completedSwaps: 3,
      rating: { average: 4.9, count: 25 }
    },
    {
      name: "Henry Clark",
      email: "henry@example.com",
      password: await bcrypt.hash("henrypassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Toronto, CA",
      profilePhoto: "https://randomuser.me/api/portraits/men/9.jpg",
      skillsOffered: [
        { name: "Video Editing", description: "Can teach Premiere Pro and Final Cut.", level: "Advanced" },
        { name: "Photography", description: "Can help with landscape photography.", level: "Intermediate" }
      ],
      skillsWanted: [
        { name: "Data Science", description: "Want to learn data analysis.", level: "Beginner" },
        { name: "Excel", description: "Interested in Excel formulas.", level: "Beginner" }
      ],
      availability: { weekdays: true, weekends: false, evenings: true, mornings: false },
      completedSwaps: 2,
      rating: { average: 4.4, count: 14 }
    },
    {
      name: "Ivy Turner",
      email: "ivy@example.com",
      password: await bcrypt.hash("ivypassword", 10),
      isAdmin: false,
      isBanned: false,
      location: "Sydney, AU",
      profilePhoto: "https://randomuser.me/api/portraits/women/10.jpg",
      skillsOffered: [
        { name: "UI/UX Design", description: "Can teach Figma and prototyping.", level: "Advanced" },
        { name: "Marketing", description: "Can help with digital marketing.", level: "Expert" }
      ],
      skillsWanted: [
        { name: "React", description: "Want to learn React basics.", level: "Beginner" },
        { name: "Node.js", description: "Interested in backend development.", level: "Beginner" }
      ],
      availability: { weekdays: false, weekends: true, evenings: true, mornings: false },
      completedSwaps: 1,
      rating: { average: 4.1, count: 9 }
    }
  ]);

  // Create sample openings (swap requests)
  await SwapRequest.insertMany([
    {
      requester: users[0]._id,
      recipient: users[1]._id,
      requesterSkill: {
        name: "Guitar",
        description: "Can teach basic chords and songs.",
      },
      recipientSkill: {
        name: "French",
        description: "Can teach conversational French.",
      },
      message: "Let’s swap guitar lessons for French practice!",
      status: "pending",
      scheduledDate: new Date("2025-07-15T18:00:00Z"),
      duration: 2,
    },
    {
      requester: users[1]._id,
      recipient: users[2]._id,
      requesterSkill: {
        name: "Python",
        description: "Can help with Python basics.",
      },
      recipientSkill: {
        name: "Cooking",
        description: "Can teach Italian recipes.",
      },
      message: "Python for pasta making?",
      status: "accepted",
      scheduledDate: new Date("2025-07-16T17:00:00Z"),
      duration: 1,
    },
    {
      requester: users[2]._id,
      recipient: users[0]._id,
      requesterSkill: {
        name: "Photography",
        description: "Can teach DSLR basics.",
      },
      recipientSkill: { name: "Yoga", description: "Can teach beginner yoga." },
      message: "Let’s do a photo-yoga swap!",
      status: "completed",
      scheduledDate: new Date("2025-07-10T10:00:00Z"),
      duration: 1.5,
    },
    {
      requester: users[0]._id,
      recipient: users[2]._id,
      requesterSkill: {
        name: "Web Design",
        description: "Can teach HTML/CSS.",
      },
      recipientSkill: {
        name: "Spanish",
        description: "Can teach basic Spanish.",
      },
      message: "Web design for Spanish lessons.",
      status: "pending",
      scheduledDate: new Date("2025-07-20T15:00:00Z"),
      duration: 2,
    },
    {
      requester: users[1]._id,
      recipient: users[0]._id,
      requesterSkill: {
        name: "Chess",
        description: "Can teach chess strategies.",
      },
      recipientSkill: {
        name: "Painting",
        description: "Can teach watercolor techniques.",
      },
      message: "Chess for painting swap!",
      status: "accepted",
      scheduledDate: new Date("2025-07-18T14:00:00Z"),
      duration: 1,
    },
    {
      requester: users[2]._id,
      recipient: users[1]._id,
      requesterSkill: {
        name: "Public Speaking",
        description: "Can help with presentations.",
      },
      recipientSkill: {
        name: "Coding",
        description: "Can teach JavaScript basics.",
      },
      message: "Public speaking for coding.",
      status: "pending",
      scheduledDate: new Date("2025-07-22T19:00:00Z"),
      duration: 1.5,
    },
    {
      requester: users[0]._id,
      recipient: users[1]._id,
      requesterSkill: {
        name: "Gardening",
        description: "Can teach plant care.",
      },
      recipientSkill: {
        name: "Photography",
        description: "Can teach portrait photography.",
      },
      message: "Gardening for photography.",
      status: "rejected",
      scheduledDate: new Date("2025-07-12T11:00:00Z"),
      duration: 2,
    },
    {
      requester: users[1]._id,
      recipient: users[2]._id,
      requesterSkill: {
        name: "Writing",
        description: "Can help with creative writing.",
      },
      recipientSkill: { name: "Cooking", description: "Can teach baking." },
      message: "Writing for baking lessons.",
      status: "pending",
      scheduledDate: new Date("2025-07-25T16:00:00Z"),
      duration: 1,
    },
    {
      requester: users[2]._id,
      recipient: users[0]._id,
      requesterSkill: {
        name: "Swimming",
        description: "Can teach swimming basics.",
      },
      recipientSkill: {
        name: "Guitar",
        description: "Can teach advanced guitar.",
      },
      message: "Swimming for guitar.",
      status: "cancelled",
      scheduledDate: new Date("2025-07-13T09:00:00Z"),
      duration: 1.5,
    },
    {
      requester: users[0]._id,
      recipient: users[2]._id,
      requesterSkill: {
        name: "Math Tutoring",
        description: "Can help with algebra.",
      },
      recipientSkill: {
        name: "Yoga",
        description: "Can teach intermediate yoga.",
      },
      message: "Math for yoga.",
      status: "pending",
      scheduledDate: new Date("2025-07-30T18:00:00Z"),
      duration: 2,
    },
  ]);

  console.log("Database seeded!");
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
