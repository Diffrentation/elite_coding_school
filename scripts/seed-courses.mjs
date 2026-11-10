import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");
const courses = [
  [
    "Full-Stack MERN & Next.js Development",
    "full-stack-development",
    "web",
    "MERN & Next.js",
    "Web Development",
    6,
    ["MongoDB", "Express.js", "React.js", "Node.js", "Next.js", "Tailwind CSS", "Git/GitHub"],
    [
      "Daily coding on your laptop with live guidance",
      "Build 5+ full-stack projects with Git & GitHub",
      "1:1 teacher debugging whenever you hit an error",
    ],
  ],
  [
    "Frontend Development, Tailwind CSS & GSAP",
    "frontend-development",
    "web",
    "Frontend & UI",
    "Web Development",
    3,
    ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS", "GSAP Animations", "Git/GitHub"],
    [
      "Pixel-perfect responsive layout techniques",
      "Interactive animations using GSAP & modern UI kits",
      "Clean component architecture & state management",
    ],
  ],
  [
    "Backend Development & REST APIs with MongoDB",
    "backend-development",
    "web",
    "Backend & DB",
    "Backend",
    4,
    ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST APIs", "JWT Auth", "Postman"],
    [
      "Hands-on API design & Postman testing",
      "Database schema modeling with Mongoose",
      "Teacher reviews your code line-by-line",
    ],
  ],
  [
    "Computer Networks Fundamentals From Scratch",
    "computer-networks",
    "systems",
    "Networking",
    "Networking & Systems",
    3,
    ["TCP/IP", "IP Subnetting", "DNS/DHCP", "Wireshark", "Routers & LAN", "Network Tools"],
    [
      "Taught from absolute zero with whiteboard diagrams",
      "Practical Wi-Fi, router & LAN setup demos",
      "Hands-on packet inspection with Wireshark",
    ],
  ],
  [
    "Linux & Operating Systems From Scratch",
    "operating-systems-kernel",
    "systems",
    "OS & Linux",
    "Networking & Systems",
    3,
    ["Linux Terminal", "Bash Scripting", "Processes & Memory", "File Permissions", "C Basics", "Git"],
    [
      "Complete zero-level start on your laptop terminal",
      "Hands-on bash scripting & task automation",
      "Understand processes, memory & file systems",
    ],
  ],
  [
    "Data Structures & Algorithms (DSA)",
    "data-structures-algorithms",
    "dsa",
    "DSA & Logic",
    "Computer Science",
    3,
    ["C++", "Java", "Arrays & Strings", "Recursion", "Trees & Graphs", "Time Complexity"],
    [
      "Step-by-step logic explained on the whiteboard",
      "100+ solved problems in C++ or Java",
      "Direct 1:1 desk problem-solving help",
    ],
  ],
  [
    "System Design & Scalable Architecture",
    "system-design",
    "dsa",
    "System Design",
    "Architecture",
    3,
    ["System Design", "HLD / LLD", "Microservices", "Redis", "Load Balancers", "DB Sharding", "Scalability"],
    [
      "Whiteboard breakdowns of real-world scalable systems",
      "HLD & LLD: Microservices, Redis, Nginx & DB sharding",
      "Case studies: WhatsApp, URL Shortener & Netflix architecture",
    ],
  ],
  [
    "C & C++ Programming Foundations",
    "c-cpp-programming",
    "core",
    "C & C++",
    "Programming Languages",
    3,
    ["C Language", "C++", "Pointers", "OOP (Classes & Objects)", "STL Basics", "Problem Solving"],
    [
      "Complete zero-level start with simple explanations",
      "Deep understanding of memory, pointers & logic",
      "College academics & foundational coding prep",
    ],
  ],
  [
    "Core Java & Object-Oriented Programming",
    "java-programming",
    "core",
    "Java & OOP",
    "Programming Languages",
    3,
    ["Core Java", "OOP Concepts", "Collections Framework", "Exceptions", "File I/O", "Git"],
    [
      "Clear object-oriented mindset from day one",
      "Hands-on Java exercises every single class",
      "Teacher helps you debug logic on your laptop",
    ],
  ],
  [
    "Python Programming & Logic Building",
    "python-programming",
    "core",
    "Python",
    "Programming Languages",
    3,
    ["Python 3", "Data Structures", "Functions", "Automation Scripts", "Logic Building", "Git"],
    [
      "Easiest language to start your coding journey",
      "Daily coding challenges and logic drills",
      "Build practical automation and utility scripts",
    ],
  ],
];

function buildSyllabus(title, skills) {
  return [
    { id: "foundation", title: `${title}: Foundations`, order: 1, topics: skills.slice(0, 3) },
    { id: "practice", title: `${title}: Guided Practice`, order: 2, topics: skills.slice(3, 6) },
    {
      id: "projects",
      title: `${title}: Projects & Review`,
      order: 3,
      topics: ["Hands-on assignments", "Teacher code review", "Revision and doubt solving"],
    },
  ];
}
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
const collection = mongoose.connection.collection("courses");
for (const [title, slug, track, trackLabel, category, durationMonths, skills, perks] of courses) {
  const description = `Learn ${title} through instructor-led offline classes, practical laptop exercises, projects, mentor guidance, and career-focused practice.`;
  await collection.updateOne(
    { slug },
    {
      $set: {
        title,
        slug,
        icon: "Code2",
        track,
        trackLabel,
        category,
        shortDescription: description,
        description,
        durationMonths,
        monthlyFee: 1900,
        level: track === "dsa" ? "intermediate" : "beginner",
        prerequisites: ["Bring your laptop and curiosity to learn."],
        skills,
        perks,
        syllabus: buildSyllabus(title, skills),
        status: "published",
        mode: "offline",
        isFeatured: slug === "full-stack-development",
        order: courses.findIndex((course) => course[1] === slug) + 1,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), version: 0 },
    },
    { upsert: true },
  );
}
await mongoose.disconnect();
console.log(`Upserted ${courses.length} published course records.`);
