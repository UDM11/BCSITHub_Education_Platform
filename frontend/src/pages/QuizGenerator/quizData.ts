import { Subject } from "../../data/notesData";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  points: number;
}

/**
 * Maps every PU BCSIT subject (all 8 semesters) to:
 *   - category: the QuizAPI.io category for CS subjects
 *   - opentdbCategory: Open Trivia DB numeric category for non-CS subjects
 *
 * QuizAPI.io valid categories:
 *   Linux, DevOps, Networking, Programming, Cloud, Docker, Kubernetes,
 *   Database, CyberSecurity, Code
 *
 * OpenTDB category numbers used:
 *   9  = General Knowledge (English, management, economics, HR, marketing, etc.)
 *   17 = Science & Nature (OS, AI, computer architecture)
 *   18 = Computer Science
 *   19 = Science & Mathematics
 *   22 = Geography
 *   24 = Politics
 */
export interface SubjectMapping {
  category: string;       // QuizAPI category (CS path)
  opentdbCategory?: number; // OpenTDB category (non-CS path) – backend uses this
}

export function getSubjectMapping(subject: Subject): SubjectMapping {
  const code = (subject.courseCode || "").toUpperCase().trim();
  const name = subject.courseName.toLowerCase();

  // ── Semester I ───────────────────────────────────────────
  if (code === "ENG 111") return { category: "Code", opentdbCategory: 9 };           // English → General Knowledge
  if (code === "MTH 113") return { category: "Code", opentdbCategory: 19 };          // Mathematics I → Science & Math
  if (code === "CMP 173") return { category: "Programming" };                         // Internet Technology I → Programming
  if (code === "CMP 171") return { category: "Code" };                                // Fundamentals of Computer Systems → Code
  if (code === "CMP 172") return { category: "Programming" };                         // Programming Language → Programming

  // ── Semester II ──────────────────────────────────────────
  if (code === "ENG 112") return { category: "Code", opentdbCategory: 9 };           // Business Communication → General Knowledge
  if (code === "MTH 114") return { category: "Code", opentdbCategory: 19 };          // Mathematics II → Science & Math
  if (code === "CMP 174") return { category: "Code" };                                // Digital Systems → Code
  if (code === "CMP 175") return { category: "Programming" };                         // Object-Oriented Language (Java) → Programming
  if (code === "CMP 176") return { category: "Code" };                                // Data Structure and Algorithm → Code
  if (code === "PRJ 181") return { category: "Programming" };                         // Project I → Programming

  // ── Semester III ─────────────────────────────────────────
  if (code === "STT 220") return { category: "Code", opentdbCategory: 19 };          // Linear Algebra & Probability → Science & Math
  if (code === "CMP 271") return { category: "Database" };                            // Database Management System → Database
  if (code === "CMP 272") return { category: "Programming" };                         // OO Analysis & Design → Programming
  if (code === "CMP 273") return { category: "Programming" };                         // Internet Technology II → Programming
  if (code === "MGT 222") return { category: "Code", opentdbCategory: 9 };           // Principles of Management → General Knowledge

  // ── Semester IV ──────────────────────────────────────────
  if (code === "CMP 275") return { category: "Linux" };                               // Computer Architecture & Microprocessor → Linux/Systems
  if (code === "CMP 274") return { category: "Code", opentdbCategory: 19 };          // Numerical Methods → Science & Math
  if (code === "CMP 276") return { category: "DevOps" };                              // Software Engineering & PM → DevOps
  if (code === "CMP 277") return { category: "Networking" };                          // Data Communication & Networks → Networking
  if (code === "FIN 222") return { category: "Code", opentdbCategory: 9 };           // Financial Management → General Knowledge
  if (code === "PRI 281") return { category: "Programming" };                         // Project II → Programming

  // ── Semester V ───────────────────────────────────────────
  if (code === "MKT 351") return { category: "Code", opentdbCategory: 9 };           // Digital Marketing → General Knowledge
  if (code === "CMP 381") return { category: "Linux" };                               // Operating Systems → Linux
  if (code === "MGT 322") return { category: "Code", opentdbCategory: 9 };           // Organizational Behavior → General Knowledge
  if (code === "CMP 471") return { category: "Code" };                                // Artificial Intelligence → Code

  // ── Semester VI ──────────────────────────────────────────
  if (code === "CMP 384") return { category: "Code" };                                // Computer Graphics → Code
  if (code === "RCH 322") return { category: "Code", opentdbCategory: 9 };           // Research Methods → General Knowledge
  if (code === "CMP 382") return { category: "Cloud" };                               // Cloud Computing → Cloud
  if (code === "ECO 322") return { category: "Code", opentdbCategory: 9 };           // Applied Economics → General Knowledge

  // ── Semester VII ─────────────────────────────────────────
  if (code === "MGT 422") return { category: "Code", opentdbCategory: 9 };           // Strategic Management → General Knowledge
  if (code === "MGT 423") return { category: "Code", opentdbCategory: 9 };           // Management of Human Resources → General Knowledge
  if (code === "CMP 383") return { category: "Code", opentdbCategory: 9 };           // Digital Economy → General Knowledge
  if (code === "CMP 472") return { category: "CyberSecurity" };                       // Information System Security → CyberSecurity
  if (code === "PRI 481") return { category: "Programming" };                         // Major Project → Programming

  // ── Semester VIII ────────────────────────────────────────
  if (code === "LAW 422") return { category: "Code", opentdbCategory: 24 };          // Legal Aspects → Politics/Law
  if (code === "MGT 424") return { category: "Code", opentdbCategory: 9 };           // Innovation & Entrepreneurship → General Knowledge
  if (code === "INT 494") return { category: "Programming" };                         // Internship → Programming

  // ── Keyword fallbacks ────────────────────────────────────
  if (name.includes("network") || name.includes("communication")) return { category: "Networking" };
  if (name.includes("cloud") || name.includes("devops")) return { category: "Cloud" };
  if (name.includes("database") || name.includes("sql")) return { category: "Database" };
  if (name.includes("security") || name.includes("cyber")) return { category: "CyberSecurity" };
  if (name.includes("linux") || name.includes("operating system")) return { category: "Linux" };
  if (name.includes("docker")) return { category: "Docker" };
  if (name.includes("kubernetes")) return { category: "Kubernetes" };
  if (name.includes("math") || name.includes("algebra") || name.includes("statistics")) return { category: "Code", opentdbCategory: 19 };
  if (name.includes("management") || name.includes("economics") || name.includes("english") || name.includes("communication")) {
    return { category: "Code", opentdbCategory: 9 };
  }

  // Default: Programming
  return { category: "Programming" };
}
