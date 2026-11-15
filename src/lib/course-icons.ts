import { Code2, icons, type LucideIcon } from "lucide-react";
import * as SimpleIcons from "react-icons/si";
import type { IconType } from "react-icons";

type CourseIconComponent = LucideIcon | IconType;

export type CourseIconOption = {
  value: string;
  label: string;
  keywords: string[];
  Icon: CourseIconComponent;
};

/** These names are stored in MongoDB as the course `icon` value. */
const COURSE_ICON_DETAILS: Record<string, Pick<CourseIconOption, "label" | "keywords">> = {
  Code2: { label: "Code", keywords: ["code", "programming", "web", "software"] },
  Braces: {
    label: "Frontend / C++",
    keywords: ["frontend", "react", "html", "css", "javascript", "c", "c++", "cpp", "pointers"],
  },
  Server: { label: "Backend", keywords: ["backend", "node", "api", "server", "rest"] },
  Database: { label: "Database", keywords: ["database", "mongo", "mysql", "sql", "data"] },
  GitBranch: { label: "Git & GitHub", keywords: ["git", "github", "branch", "commit", "repository"] },
  Radio: { label: "Kafka & Streaming", keywords: ["kafka", "streaming", "events", "queue", "messaging"] },
  Rabbit: { label: "RabbitMQ & Messaging", keywords: ["rabbitmq", "rabbit", "broker", "queue", "amqp"] },
  Workflow: { label: "DevOps & Workflows", keywords: ["devops", "workflow", "ci", "cd", "automation"] },
  Network: { label: "Networking", keywords: ["network", "tcp", "ip", "dns", "wi-fi"] },
  Terminal: { label: "Linux & Terminal", keywords: ["linux", "terminal", "bash", "os", "shell"] },
  BrainCircuit: { label: "DSA", keywords: ["dsa", "algorithm", "logic", "data structures", "problem"] },
  BarChart3: { label: "System Design", keywords: ["system", "design", "architecture", "scaling"] },
  Coffee: { label: "Java", keywords: ["java", "oop", "spring"] },
  Cpu: { label: "Computer Fundamentals", keywords: ["computer", "hardware", "fundamentals", "office"] },
  Monitor: { label: "MS Office", keywords: ["office", "word", "excel", "powerpoint", "computer"] },
  Layers: { label: "General Technology", keywords: ["technology", "general", "tools"] },
  BookOpen: { label: "Learning", keywords: ["learning", "course", "study", "education"] },
};

function readableIconName(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/(\D)(\d)/g, "$1 $2")
    .trim();
}

const lucideIconEntries = Object.entries(icons) as [string, LucideIcon][];

const TECH_ICON_KEYWORDS = [
  "code",
  "cloud",
  "data",
  "database",
  "server",
  "network",
  "security",
  "developer",
  "development",
  "dev",
  "web",
  "api",
  "java",
  "python",
  "node",
  "react",
  "angular",
  "vue",
  "linux",
  "git",
  "kafka",
  "rabbit",
  "docker",
  "kubernetes",
  "amazon",
  "azure",
  "google",
  "microsoft",
  "android",
  "machine",
  "learning",
  "design",
  "office",
  "computer",
  "terminal",
  "shell",
  "redis",
  "mongo",
  "mysql",
  "postgres",
  "sql",
  "html",
  "css",
  "javascript",
  "typescript",
  "php",
  "ruby",
  "golang",
  "rust",
  "scala",
  "swift",
  "dotnet",
  "csharp",
  "cplusplus",
  "blockchain",
  "testing",
  "analytics",
  "stream",
  "software",
  "electron",
  "wordpress",
  "django",
  "flask",
  "laravel",
  "spring",
  "next",
  "nuxt",
  "svelte",
  "tailwind",
  "bootstrap",
  "figma",
  "adobe",
  "firebase",
  "supabase",
  "vercel",
  "netlify",
  "github",
  "gitlab",
  "bitbucket",
  "jenkins",
  "ansible",
  "terraform",
  "nginx",
  "grafana",
  "prometheus",
  "elastic",
  "logstash",
  "kibana",
  "openai",
  "anthropic",
  "huggingface",
  "tensorflow",
  "pytorch",
  "jupyter",
  "wireshark",
  "cisco",
  "rabbitmq",
  "nats",
  "app",
  "platform",
  "digital",
  "search",
  "browser",
  "file",
  "protocol",
  "quantum",
  "robot",
  "media",
  "video",
  "audio",
  "automation",
  "stack",
  "chat",
  "connect",
  "robotics",
] as const;

const simpleIconEntries = (Object.entries(SimpleIcons) as [string, IconType][]).filter(([value]) =>
  TECH_ICON_KEYWORDS.some((keyword) => value.slice(2).toLowerCase().includes(keyword)),
);

const simpleIconOptions: CourseIconOption[] = simpleIconEntries.map(([iconName, Icon]) => ({
  // Prefix prevents collisions with the existing Lucide names persisted in MongoDB.
  value: `si:${iconName}`,
  label: readableIconName(iconName.slice(2)),
  keywords: readableIconName(iconName.slice(2)).toLowerCase().split(/\s+/),
  Icon,
}));

const lucideIconOptions: CourseIconOption[] = lucideIconEntries
  .map(([value, Icon]) => {
    const details = COURSE_ICON_DETAILS[value];
    const label = details?.label ?? readableIconName(value);

    return {
      value,
      label,
      keywords: details?.keywords ?? label.toLowerCase().split(/\s+/),
      Icon,
    };
  })
  .sort((first, second) => first.label.localeCompare(second.label));

/**
 * Course-ready visual catalog: all Lucide icons plus 500+ technology and brand
 * icons from Simple Icons (React Icons). Values remain safe to store in MongoDB.
 */
export const COURSE_ICON_OPTIONS: CourseIconOption[] = [...simpleIconOptions, ...lucideIconOptions].sort(
  (first, second) => first.label.localeCompare(second.label),
);

export function getCourseIcon(value?: string): CourseIconComponent {
  if (value?.startsWith("si:")) {
    return (SimpleIcons[value.slice(3) as keyof typeof SimpleIcons] as IconType | undefined) ?? Code2;
  }

  return (value ? (icons[value as keyof typeof icons] as LucideIcon | undefined) : undefined) ?? Code2;
}
