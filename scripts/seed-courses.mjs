import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");
const courses = [
  [
    "Full Stack Development",
    "full-stack-development",
    "Code2",
    "Web Development",
    "Build modern full-stack applications with practical projects.",
    6,
    1900,
    "intermediate",
  ],
  [
    "Frontend Development",
    "frontend-development",
    "Braces",
    "Web Development",
    "Create responsive, accessible interfaces with modern tools.",
    3,
    1900,
    "beginner",
  ],
  [
    "Backend Development",
    "backend-development",
    "Server",
    "Backend",
    "Build secure APIs, databases, and server-side applications.",
    4,
    1900,
    "intermediate",
  ],
  [
    "Data Structures & Algorithms",
    "data-structures-algorithms",
    "BrainCircuit",
    "Computer Science",
    "Strengthen problem-solving skills for technical interviews.",
    3,
    1900,
    "intermediate",
  ],
  [
    "System Design",
    "system-design",
    "Database",
    "Architecture",
    "Learn to design scalable, reliable software systems.",
    3,
    1900,
    "advanced",
  ],
  [
    "Python Programming",
    "python-programming",
    "TerminalSquare",
    "Programming",
    "Master Python fundamentals and real-world projects.",
    3,
    1900,
    "beginner",
  ],
];
await mongoose.connect(uri);
const collection = mongoose.connection.collection("courses");
for (const [title, slug, icon, category, description, durationMonths, monthlyFee, level] of courses) {
  await collection.updateOne(
    { slug },
    {
      $setOnInsert: {
        title,
        slug,
        icon,
        category,
        shortDescription: description,
        description: `${description} Learn through instructor-led offline classes, projects, mentor guidance, and career-focused practice.`,
        durationMonths,
        monthlyFee,
        level,
        prerequisites: [],
        skills: [],
        syllabus: [],
        status: "published",
        mode: "offline",
        isFeatured: false,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      },
    },
    { upsert: true },
  );
}
await mongoose.disconnect();
console.log(`Seeded ${courses.length} course templates.`);
