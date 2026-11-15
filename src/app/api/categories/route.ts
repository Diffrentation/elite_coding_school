import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { Category } from "@/models/Category";
import { Course } from "@/models/Course";

const DEFAULT_CATEGORIES = [
  {
    name: "Full-Stack Web Development",
    slug: "web-development",
    icon: "Code2",
    description: "Master React, Next.js, Node.js, Express, MongoDB and full-stack web engineering.",
    techTags: ["React.js", "Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    ctaLabel: "View Web Courses",
  },
  {
    name: "MERN Stack",
    slug: "mern-stack",
    icon: "Code2",
    description: "Production-ready MERN stack apps with authentication, REST APIs, and state management.",
    techTags: ["MongoDB", "Express.js", "React.js", "Node.js"],
    ctaLabel: "View MERN Courses",
  },
  {
    name: "DSA & Logic",
    slug: "dsa-logic",
    icon: "Layers",
    description: "Foundational problem solving, recursion, arrays, trees, and algorithmic intuition.",
    techTags: ["Problem Solving", "Arrays & Strings", "Recursion", "Trees & Graphs"],
    ctaLabel: "View DSA Courses",
  },
  {
    name: "DSA & System Design",
    slug: "dsa-system-design",
    icon: "Layers",
    description: "Advanced data structures, graphs, dynamic programming, and scalable system design.",
    techTags: ["Dynamic Programming", "System Architecture", "Graph Theory"],
    ctaLabel: "View System Design Courses",
  },
  {
    name: "Programming Languages",
    slug: "programming-languages",
    icon: "Cpu",
    description: "Learn foundational languages from absolute scratch: C, C++, Java, and Python.",
    techTags: ["C Language", "C++ OOP", "Core Java", "Python 3"],
    ctaLabel: "View Language Courses",
  },
  {
    name: "Networking & Systems",
    slug: "networking-systems",
    icon: "Network",
    description: "Understand TCP/IP, routing, DNS, Wireshark, Linux terminal, and operating systems.",
    techTags: ["TCP/IP", "Linux Terminal", "Bash Scripting", "Wireshark"],
    ctaLabel: "View Networking Courses",
  },
];

export async function GET() {
  await connectDb();
  try {
    const dbCategories = await Category.find().sort({ createdAt: -1 }).lean();
    const existingNames = new Set(dbCategories.map((c: any) => c.name.toLowerCase()));

    // Also get distinct categories already used across published/draft courses
    const courseCategories = await Course.distinct("category");
    const merged = [...dbCategories];

    for (const catName of courseCategories) {
      if (catName && !existingNames.has(catName.toLowerCase())) {
        existingNames.add(catName.toLowerCase());
        merged.push({
          _id: `derived-${catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon: "Code2",
          description: "",
          techTags: [],
          ctaLabel: `View ${catName} Courses`,
        });
      }
    }

    for (const def of DEFAULT_CATEGORIES) {
      if (!existingNames.has(def.name.toLowerCase())) {
        existingNames.add(def.name.toLowerCase());
        merged.push({
          _id: `default-${def.slug}`,
          name: def.name,
          slug: def.slug,
          icon: def.icon,
          description: def.description,
          techTags: def.techTags,
          ctaLabel: def.ctaLabel,
        });
      }
    }

    return success({ categories: merged });
  } catch {
    return success({ categories: DEFAULT_CATEGORIES });
  }
}
