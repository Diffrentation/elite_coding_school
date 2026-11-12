import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");

const m = (title, topics, order) => ({ id: `m${order}`, title, order, topics });
const course = (data, modules) => ({
  ...data,
  syllabus: modules.map((entry, index) => m(entry[0], entry.slice(1), index + 1)),
});

const courses = [
  course(
    {
      title: "Full-Stack MERN & Next.js Development",
      slug: "full-stack-development",
      track: "web",
      trackLabel: "MERN & Next.js",
      category: "Web Development",
      durationMonths: 6,
      level: "beginner",
      skills: [
        "HTML & CSS",
        "JavaScript",
        "React",
        "Next.js",
        "Node.js",
        "Express",
        "MongoDB",
        "Git & GitHub",
      ],
      prerequisites: ["Basic computer usage", "Laptop for daily coding"],
      perks: [
        "Daily laptop coding with live guidance",
        "Five portfolio-ready full-stack projects",
        "1:1 teacher debugging",
        "GitHub and deployment support",
      ],
    },
    [
      [
        "HTML, CSS & Responsive Design",
        "Semantic HTML and accessible structure",
        "Flexbox, Grid and responsive layouts",
        "Forms, validation and browser devtools",
      ],
      [
        "Modern JavaScript",
        "Variables, functions, arrays and objects",
        "DOM events and UI behaviour",
        "Promises, async/await and fetch API",
      ],
      [
        "React.js Components",
        "JSX, props and component composition",
        "State, effects and controlled forms",
        "API integration and loading states",
      ],
      [
        "Next.js Application Development",
        "App Router, layouts and navigation",
        "Dynamic routes and server/client components",
        "Metadata and image optimisation",
      ],
      [
        "Node.js & Express APIs",
        "npm, environment variables and modules",
        "Routes, middleware and REST conventions",
        "Validation and centralized error handling",
      ],
      [
        "MongoDB, Auth & Deployment",
        "Mongoose schemas and CRUD",
        "Password security and protected routes",
        "GitHub workflow and production deployment",
      ],
    ],
  ),
  course(
    {
      title: "Frontend Development, Tailwind CSS & GSAP",
      slug: "frontend-development",
      track: "web",
      trackLabel: "Frontend & UI",
      category: "Web Development",
      durationMonths: 4,
      level: "beginner",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS", "GSAP", "Responsive UI", "Git"],
      prerequisites: ["Basic computer usage", "Laptop for design practice"],
      perks: [
        "Responsive UI from scratch",
        "GSAP animation practice",
        "Component design feedback",
        "Portfolio deployment support",
      ],
    },
    [
      [
        "HTML, CSS & Layout",
        "Semantic HTML and accessibility",
        "CSS spacing, typography and cascade",
        "Flexbox, Grid and breakpoints",
      ],
      [
        "JavaScript for Interfaces",
        "ES6 syntax and data structures",
        "Events and form handling",
        "Async fetching and error states",
      ],
      [
        "React UI Engineering",
        "Components, props and state",
        "Effects and controlled inputs",
        "Reusable cards, modals and navigation",
      ],
      [
        "Tailwind CSS Design System",
        "Utility-first styling and tokens",
        "Responsive and dark-mode variants",
        "Buttons, forms and data-view patterns",
      ],
      [
        "GSAP Motion Design",
        "Tweens, timelines and easing",
        "ScrollTrigger animations",
        "Accessible micro-interactions",
      ],
      [
        "Portfolio & Deployment",
        "Project polish and performance",
        "GitHub repository workflow",
        "Vercel deployment and review",
      ],
    ],
  ),
  course(
    {
      title: "Backend Development & REST APIs with MongoDB",
      slug: "backend-development",
      track: "web",
      trackLabel: "Backend & DB",
      category: "Backend Development",
      durationMonths: 4,
      level: "intermediate",
      skills: ["Node.js", "Express", "MongoDB", "Mongoose", "REST APIs", "JWT", "Postman", "Git"],
      prerequisites: ["JavaScript fundamentals", "Comfort with terminal"],
      perks: [
        "API design and Postman practice",
        "Database schema reviews",
        "Security exercises",
        "Mentor code review",
      ],
    },
    [
      [
        "Node.js Runtime & Tooling",
        "Node modules and npm scripts",
        "Event loop and asynchronous code",
        "Environment variables and debugging",
      ],
      [
        "Express & REST APIs",
        "Routes, controllers and middleware",
        "HTTP methods and response contracts",
        "Validation and error middleware",
      ],
      [
        "MongoDB & Mongoose",
        "Collections and document modelling",
        "Schemas, validation and CRUD",
        "Indexes, references and aggregation",
      ],
      [
        "Authentication & Security",
        "Password hashing with bcrypt",
        "JWT or session authentication",
        "Roles, CORS and rate limiting",
      ],
      [
        "API Quality",
        "Postman collections and documentation",
        "Pagination and filtering",
        "Logging and consistent error responses",
      ],
      [
        "Production API Project",
        "Layered project architecture",
        "File uploads and storage",
        "Deployment and health checks",
      ],
    ],
  ),
  course(
    {
      title: "Computer Networks Fundamentals From Scratch",
      slug: "computer-networks",
      track: "systems",
      trackLabel: "Networking",
      category: "Networking & Systems",
      durationMonths: 3,
      level: "beginner",
      skills: ["TCP/IP", "Subnetting", "DNS", "DHCP", "Wireshark", "LAN Setup", "Network Tools"],
      prerequisites: ["No prior networking knowledge"],
      perks: [
        "Whiteboard-first explanations",
        "LAN and Wi-Fi demos",
        "Wireshark packet inspection",
        "Command-line diagnostics",
      ],
    },
    [
      [
        "Network Foundations",
        "LAN, WAN and internet basics",
        "Network devices and packet travel",
        "Bandwidth, latency and throughput",
      ],
      [
        "OSI & TCP/IP Models",
        "Layers and their responsibilities",
        "Encapsulation and decapsulation",
        "Common protocols at each layer",
      ],
      [
        "IP Addressing & Subnetting",
        "IPv4, binary and address classes",
        "CIDR and subnet-mask calculations",
        "Private ranges and default gateways",
      ],
      [
        "Core Services",
        "Ethernet, ARP and switching",
        "TCP, UDP and port numbers",
        "DNS, DHCP, HTTP and HTTPS",
      ],
      [
        "Setup & Diagnostics",
        "Router, switch and Wi-Fi concepts",
        "ping, tracert, ipconfig and nslookup",
        "Wireshark captures and filters",
      ],
      [
        "Troubleshooting Practice",
        "Connection failure workflow",
        "DNS and addressing fault isolation",
        "Network lab revision",
      ],
    ],
  ),
  course(
    {
      title: "Linux & Operating Systems From Scratch",
      slug: "operating-systems-kernel",
      track: "systems",
      trackLabel: "OS & Linux",
      category: "Networking & Systems",
      durationMonths: 3,
      level: "beginner",
      skills: ["Linux Terminal", "Bash", "Processes", "Memory", "Permissions", "File Systems", "Git"],
      prerequisites: ["No command-line experience required", "Linux or WSL environment"],
      perks: [
        "Terminal basics from zero",
        "Daily Bash practice",
        "Process and memory demos",
        "Live troubleshooting",
      ],
    },
    [
      [
        "Operating System Foundations",
        "Kernel, shell and user mode",
        "Processes, threads and scheduling",
        "Memory, storage and file systems",
      ],
      [
        "Linux Terminal Basics",
        "Navigation and file management",
        "cat, grep, find and pipes",
        "Help manuals and package management",
      ],
      [
        "Users & Permissions",
        "Users, groups and ownership",
        "Read, write and execute permissions",
        "sudo and secure administration habits",
      ],
      [
        "Bash Scripting",
        "Variables, conditions and loops",
        "Functions and script arguments",
        "Redirection and safe error handling",
      ],
      [
        "Processes & System Tools",
        "ps, top, kill and job control",
        "Disk, memory and log inspection",
        "Cron jobs and automation",
      ],
      [
        "Linux Networking Project",
        "SSH, curl and network commands",
        "System health-check script",
        "Terminal workflow and Git revision",
      ],
    ],
  ),
  course(
    {
      title: "Data Structures & Algorithms (DSA)",
      slug: "data-structures-algorithms",
      track: "dsa",
      trackLabel: "DSA & Logic",
      category: "Computer Science",
      durationMonths: 4,
      level: "beginner",
      skills: ["C++ or Java", "Arrays", "Strings", "Recursion", "Trees", "Graphs", "Big O"],
      prerequisites: ["Basic programming syntax helps", "Daily problem-solving practice"],
      perks: [
        "Whiteboard-first logic",
        "120+ guided problems",
        "C++ or Java choice",
        "Personal debugging support",
      ],
    },
    [
      [
        "Logic & Complexity",
        "Dry runs and problem decomposition",
        "Functions, loops and patterns",
        "Time and space complexity",
      ],
      [
        "Arrays & Strings",
        "Traversal and prefix sums",
        "Two pointers and sliding window",
        "Searching, sorting and hashing",
      ],
      [
        "Recursion & Backtracking",
        "Call stacks and recursion trees",
        "Subset and permutation patterns",
        "Decision-tree thinking",
      ],
      [
        "Linked Lists, Stacks & Queues",
        "Singly and doubly linked lists",
        "Stack and queue operations",
        "Monotonic stack patterns",
      ],
      ["Trees & Heaps", "Tree traversal and BST", "Priority queues and heaps", "Tree problem practice"],
      [
        "Graphs & DP Introduction",
        "Graph representation, BFS and DFS",
        "Basic dynamic programming",
        "Revision and mock problem set",
      ],
    ],
  ),
  course(
    {
      title: "System Design & Scalable Architecture",
      slug: "system-design",
      track: "dsa",
      trackLabel: "System Design",
      category: "Software Architecture",
      durationMonths: 3,
      level: "intermediate",
      skills: ["HLD", "LLD", "APIs", "Caching", "Load Balancing", "Databases", "Redis", "Scalability"],
      prerequisites: ["Programming and database basics"],
      perks: [
        "Real-world whiteboard cases",
        "HLD and LLD practice",
        "Trade-off teaching",
        "Architecture reviews",
      ],
    },
    [
      [
        "Design Foundations",
        "Functional and non-functional requirements",
        "Capacity estimation",
        "Data-flow diagrams and API contracts",
      ],
      [
        "Scalable Building Blocks",
        "Load balancers and horizontal scaling",
        "Caching patterns and Redis",
        "Queues and asynchronous workers",
      ],
      [
        "Data Architecture",
        "SQL versus NoSQL trade-offs",
        "Indexes, replication and partitioning",
        "Sharding and consistency",
      ],
      [
        "Reliability & Security",
        "Rate limiting and idempotency",
        "Retries, timeouts and circuit breakers",
        "Logging, metrics and tracing",
      ],
      [
        "Low-Level Design",
        "SOLID principles and domain models",
        "Interfaces, patterns and testing",
        "Maintainable service boundaries",
      ],
      ["Case Studies", "URL shortener design", "Chat or notification system", "E-commerce order flow review"],
    ],
  ),
  course(
    {
      title: "C & C++ Programming Foundations",
      slug: "c-cpp-programming",
      track: "core",
      trackLabel: "C & C++",
      category: "Programming Languages",
      durationMonths: 3,
      level: "beginner",
      skills: ["C", "C++", "Pointers", "Functions", "OOP", "STL", "Problem Solving"],
      prerequisites: ["No programming experience required"],
      perks: [
        "Zero-to-one teaching",
        "Pointer memory demos",
        "College syllabus support",
        "Daily logic exercises",
      ],
    },
    [
      [
        "C Programming Basics",
        "Variables, data types and operators",
        "Conditions and loops",
        "Functions and scope",
      ],
      ["Arrays & Strings", "One and two-dimensional arrays", "String operations", "Common logic exercises"],
      [
        "Pointers & Memory",
        "Addresses and pointer arithmetic",
        "Dynamic memory allocation",
        "Memory-safe coding habits",
      ],
      ["File Handling & Structures", "File read and write", "Structures and unions", "Small console project"],
      [
        "C++ & OOP",
        "Classes, objects and constructors",
        "Inheritance and polymorphism",
        "Exceptions and templates",
      ],
      [
        "STL & Practice",
        "vector, map, set and stack",
        "Iterators and algorithms",
        "Revision and mini projects",
      ],
    ],
  ),
  course(
    {
      title: "Core Java & Object-Oriented Programming",
      slug: "java-programming",
      track: "core",
      trackLabel: "Java & OOP",
      category: "Programming Languages",
      durationMonths: 3,
      level: "beginner",
      skills: ["Java", "OOP", "Collections", "Exceptions", "File I/O", "Multithreading", "Git"],
      prerequisites: ["No Java experience required", "JDK and IDE installed"],
      perks: [
        "Practical OOP teaching",
        "Daily Java exercises",
        "Collections practice",
        "College and interview base",
      ],
    },
    [
      [
        "Java Basics",
        "JDK, IDE and program structure",
        "Types, operators and control flow",
        "Methods, arrays and strings",
      ],
      [
        "Object-Oriented Programming",
        "Classes, objects and constructors",
        "Encapsulation and access modifiers",
        "Inheritance, abstraction and interfaces",
      ],
      [
        "Collections Framework",
        "ArrayList, HashMap, Set and Queue",
        "Generics and iteration",
        "Choosing the right collection",
      ],
      [
        "Exceptions & Files",
        "try/catch and custom exceptions",
        "File input/output",
        "Debugging and logging basics",
      ],
      [
        "Threads & JDBC",
        "Thread lifecycle and synchronization",
        "Database connectivity overview",
        "Safe resource handling",
      ],
      ["Java Project & Review", "Mini project architecture", "GitHub and README", "Revision and code review"],
    ],
  ),
  course(
    {
      title: "Python Programming & Logic Building",
      slug: "python-programming",
      track: "core",
      trackLabel: "Python",
      category: "Programming Languages",
      durationMonths: 3,
      level: "beginner",
      skills: [
        "Python",
        "Functions",
        "Lists & Dictionaries",
        "File I/O",
        "Automation",
        "Logic Building",
        "Git",
      ],
      prerequisites: ["No prior coding needed"],
      perks: [
        "Beginner-friendly explanations",
        "Daily logic challenges",
        "Automation projects",
        "Live debugging",
      ],
    },
    [
      [
        "Python Foundations",
        "Interpreter, scripts and virtual environments",
        "Variables, types, input and output",
        "Conditions and loops",
      ],
      [
        "Functions & Collections",
        "Functions and scope",
        "Lists, tuples, sets and dictionaries",
        "Comprehensions and useful built-ins",
      ],
      [
        "Problem Solving",
        "Strings and list algorithms",
        "Modular, readable code",
        "Debugging and exception handling",
      ],
      [
        "Files & Data",
        "Text, CSV and JSON files",
        "Path handling and safe file operations",
        "Data-cleaning exercises",
      ],
      [
        "APIs & Automation",
        "HTTP requests and JSON APIs",
        "Date, folder and report automation",
        "Command-line scripts",
      ],
      [
        "Mini Projects & Git",
        "Utility or automation project",
        "Git, GitHub and README",
        "Revision and code review",
      ],
    ],
  ),
];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
const collection = mongoose.connection.collection("courses");
for (const [index, data] of courses.entries()) {
  const description = `Learn ${data.title} in instructor-led offline classes with concept-first teaching, daily laptop practice, guided assignments, mentor support, and project-based revision.`;
  await collection.updateOne(
    { slug: data.slug },
    {
      $set: {
        ...data,
        icon: "Code2",
        shortDescription: description,
        description,
        labHours: "90+ Class Hours",
        monthlyFee: 1900,
        status: "published",
        mode: "offline",
        isFeatured: data.slug === "full-stack-development",
        order: index + 1,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), version: 0 },
    },
    { upsert: true },
  );
}
await mongoose.disconnect();
console.log(`Upserted ${courses.length} complete published course records.`);
