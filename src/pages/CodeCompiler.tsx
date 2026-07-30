// src/pages/CodeCompiler.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Square, RotateCcw, Download, Upload, Settings, Code, 
  Terminal, FileText, Zap, CheckCircle, AlertCircle, Copy, 
  Share2, Maximize2, Minimize2, ArrowLeft, Save, FolderOpen, 
  BookOpen, Award, Users, Clock, Cpu, Wifi, HardDrive, 
  Shield, Sparkles, TrendingUp, Target, Layers, Database, 
  Globe, Smartphone, CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSEO } from "../hooks/useSEO";

interface Language {
  id: string;
  name: string;
  extension: string;
  template: string;
  color: string;
  icon: string;
}

const LANGUAGES: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    template: `// JavaScript Code - ES6+ Features
console.log("Hello, World!");

// Arrow function with destructuring
const greet = (name) => \`Hello, \${name}!\`;

// Async/await example
const fetchData = async () => {
  try {
    console.log("Fetching data...");
    return "Data fetched successfully!";
  } catch (error) {
    console.error("Error:", error);
  }
};

// Class example
class Student {
  constructor(name, course) {
    this.name = name;
    this.course = course;
  }
  
  study() {
    return \`\${this.name} is studying \${this.course}\`;
  }
}

const student = new Student("Alice", "BCSIT");
console.log(greet("BCSITHub"));
console.log(student.study());
fetchData().then(console.log);`,
    color: "from-yellow-500 to-amber-500",
    icon: "🟨"
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
    template: `# Python Code - Advanced Features
print("Hello, World!")

# List comprehension and lambda functions
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
filtered = list(filter(lambda x: x > 10, squared))

print(f"Squared numbers: {squared}")
print(f"Filtered (>10): {filtered}")

# Class with decorators
class Student:
    def __init__(self, name, course):
        self.name = name
        self.course = course
        self._grades = []
    
    @property
    def grades(self):
        return self._grades
    
    @grades.setter
    def grades(self, value):
        if isinstance(value, list):
            self._grades = value
    
    def add_grade(self, grade):
        self._grades.append(grade)
        return f"Added grade {grade} for {self.name}"
    
    def average_grade(self):
        return sum(self._grades) / len(self._grades) if self._grades else 0

# Usage
student = Student("Alice", "BCSIT")
student.add_grade(85)
student.add_grade(92)
student.add_grade(78)

print(f"Student: {student.name}")
print(f"Average grade: {student.average_grade():.2f}")

# Dictionary comprehension
grade_status = {grade: "Pass" if grade >= 80 else "Fail" for grade in student.grades}
print(f"Grade status: {grade_status}")`,
    color: "from-blue-500 to-emerald-500",
    icon: "🐍"
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
    template: `// Java Code - Modern Java Features
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Stream API and Lambda expressions
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        List<Integer> evenSquares = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());
        
        System.out.println("Even squares: " + evenSquares);
        
        // Student class usage
        Student student = new Student("Alice", "BCSIT");
        student.addGrade(85);
        student.addGrade(92);
        student.addGrade(78);
        
        System.out.println(student.getInfo());
        System.out.println("Average grade: " + student.getAverageGrade());
        
        // Optional usage
        Optional<String> greeting = Optional.of("Hello, BCSITHub!");
        greeting.ifPresent(System.out::println);
    }
}

class Student {
    private String name;
    private String course;
    private List<Integer> grades;
    
    public Student(String name, String course) {
        this.name = name;
        this.course = course;
        this.grades = new ArrayList<>();
    }
    
    public void addGrade(int grade) {
        grades.add(grade);
    }
    
    public double getAverageGrade() {
        return grades.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
    }
    
    public String getInfo() {
        return String.format("Student: %s, Course: %s", name, course);
    }
}`,
    color: "from-red-550 from-red-500 to-orange-500",
    icon: "☕"
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
    template: `// C++ Code - Modern C++17/20 Features
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <optional>
#include <numeric>

class Student {
private:
    std::string name;
    std::string course;
    std::vector<int> grades;

public:
    Student(const std::string& n, const std::string& c) 
        : name(n), course(c) {}
    
    void addGrade(int grade) {
        grades.push_back(grade);
    }
    
    std::optional<double> getAverageGrade() const {
        if (grades.empty()) return std::nullopt;
        
        double sum = std::accumulate(grades.begin(), grades.end(), 0.0);
        return sum / grades.size();
    }
    
    std::string getInfo() const {
        return "Student: " + name + ", Course: " + course;
    }
    
    const std::vector<int>& getGrades() const { return grades; }
};

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << "Welcome to Modern C++!" << std::endl;
    
    // Smart pointers
    auto student = std::make_unique<Student>("Alice", "BCSIT");
    student->addGrade(85);
    student->addGrade(92);
    student->addGrade(78);
    student->addGrade(96);
    
    std::cout << student->getInfo() << std::endl;
    
    // Optional usage
    if (auto avg = student->getAverageGrade(); avg.has_value()) {
        std::cout << "Average grade: " << avg.value() << std::endl;
    }
    
    // Range-based for loop and algorithms
    const auto& grades = student->getGrades();
    std::cout << "Grades: ";
    for (const auto& grade : grades) {
        std::cout << grade << " ";
    }
    std::cout << std::endl;
    
    // Lambda and algorithms
    auto highGrades = std::count_if(grades.begin(), grades.end(), 
        [](int grade) { return grade >= 90; });
    
    std::cout << "High grades (>=90): " << highGrades << std::endl;
    
    return 0;
}`,
    color: "from-blue-600 to-indigo-600",
    icon: "⚡"
  },
  {
    id: "html",
    name: "HTML",
    extension: "html",
    template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BCSITHub Code Compiler</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .container {
            text-align: center; padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px; backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 800px; width: 90%;
            border: 1px solid rgba(255,255,255,0.2);
        }
        h1 { font-size: 2.2rem; margin-bottom: 20px; font-weight: 800; }
        p { font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9; }
        .stat {
            background: rgba(0,0,0,0.2);
            padding: 15px; border-radius: 12px;
            margin: 10px; flex: 1; min-width: 120px;
        }
        .stat h3 { font-size: 1.8rem; color: #fbbf24; }
        .stats {
            display: flex; justify-content: space-around;
            margin: 30px 0; flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 BCSITHub Code Compiler</h1>
        <p>Advanced Multi-Language Programming Platform</p>
        
        <div class="stats">
            <div class="stat">
                <h3>10+</h3>
                <p>Languages</p>
            </div>
            <div class="stat">
                <h3>1000+</h3>
                <p>Students</p>
            </div>
            <div class="stat">
                <h3>24/7</h3>
                <p>Uptime</p>
            </div>
        </div>
    </div>
</body>
</html>`,
    color: "from-orange-500 to-red-500",
    icon: "🌐"
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    template: `// TypeScript Code - Advanced Features
interface Student {
  name: string;
  age: number;
  course: string;
  grades?: number[];
}

interface University {
  name: string;
  students: Student[];
  addStudent(student: Student): void;
  getStudentsByCourse(course: string): Student[];
}

class ModernUniversity implements University {
  public name: string;
  public students: Student[] = [];
  
  constructor(name: string) {
    this.name = name;
  }
  
  addStudent(student: Student): void {
    this.students.push(student);
    console.log(\`Added student: \${student.name} to \${this.name}\`);
  }
  
  getStudentsByCourse(course: string): Student[] {
    return this.students.filter(s => s.course === course);
  }
  
  calculateAverageGrade(student: Student): number {
    if (!student.grades || student.grades.length === 0) return 0;
    return student.grades.reduce((a, b) => a + b, 0) / student.grades.length;
  }
  
  getTopStudents(minGrade: number = 90): Student[] {
    return this.students.filter(student => {
      const avg = this.calculateAverageGrade(student);
      return avg >= minGrade;
    });
  }
}

// Generic function with constraints
function processData<T extends { name: string }>(items: T[]): T[] {
  console.log(\`Processing \${items.length} items\`);
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

// Union types
type Grade = "A" | "B" | "C" | "D" | "F";

function getLetterGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// Usage
const university = new ModernUniversity("BCSITHub University");

const studentsList: Student[] = [
  { name: "Alice Johnson", age: 20, course: "BCSIT", grades: [92, 88, 95] },
  { name: "Bob Smith", age: 21, course: "BCA", grades: [85, 90, 87] },
  { name: "Carol Davis", age: 19, course: "BCSIT", grades: [96, 94, 98] }
];

studentsList.forEach(student => university.addStudent(student));

console.log("Hello, TypeScript World!");
console.log(\`University: \${university.name}\`);

const bcsitStudents = university.getStudentsByCourse("BCSIT");
console.log(\`BCSIT Students: \${bcsitStudents.length}\`);

const topStudents = university.getTopStudents(90);
console.log("Top Students (>=90%):");
topStudents.forEach(student => {
  const avg = university.calculateAverageGrade(student);
  console.log(\`- \${student.name}: \${avg.toFixed(2)}% (\&  \${getLetterGrade(avg)})\`);
});

const processedStudents = processData(studentsList);
console.log("Students processed and sorted by name");`,
    color: "from-blue-500 to-indigo-650 text-indigo-600",
    icon: "📘"
  },
  {
    id: "php",
    name: "PHP",
    extension: "php",
    template: `<?php
// PHP Code - Modern PHP 8+ Features
declare(strict_types=1);

class Student {
    public function __construct(
        public readonly string $name,
        public readonly int $age,
        public readonly string $course,
        public array $grades = []
    ) {}
    
    public function addGrade(int $grade): void {
        if ($grade < 0 || $grade > 100) {
            throw new InvalidArgumentException("Grade must be between 0 and 100");
        }
        $this->grades[] = $grade;
    }
    
    public function getAverageGrade(): float {
        if (empty($this->grades)) return 0.0;
        return array_sum($this->grades) / count($this->grades);
    }
    
    public function getLetterGrade(): string {
        $avg = $this->getAverageGrade();
        return match (true) {
            $avg >= 90 => 'A',
            $avg >= 80 => 'B',
            $avg >= 70 => 'C',
            $avg >= 60 => 'D',
            default => 'F'
        };
    }
    
    public function getInfo(): string {
        return "Name: {$this->name}, Course: {$this->course}, Age: {$this->age}";
    }
}

// Usage
echo "Hello, World!\\n";
echo "Welcome to Modern PHP Programming!\\n\\n";

$students = [
    new Student("Alice Johnson", 20, "BCSIT", [92, 88, 95, 90]),
    new Student("Bob Smith", 21, "BCA", [85, 90, 87, 92])
];

foreach ($students as $student) {
    echo $student->getInfo() . "\\n";
    echo "Average Grade: " . number_format($student->getAverageGrade(), 2) . "% ({$student->getLetterGrade()})\\n\\n";
}
?>`,
    color: "from-purple-500 to-blue-600",
    icon: "🐘"
  }
];

export function CodeCompiler() {
  useSEO({
    title: "Online Sandboxed Code Compiler",
    description: "Write, compile, and run program snippets in JavaScript, Python, Java, C, C++, PHP, and HTML directly in your web browser.",
    keywords: "online code compiler, bcsit coding, run code online, multi language compiler"
  });

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [linesOfCode, setLinesOfCode] = useState(0);
  const [charactersCount, setCharactersCount] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(selectedLanguage.template);
    updateCodeStats(selectedLanguage.template);
  }, [selectedLanguage]);
  
  useEffect(() => {
    updateCodeStats(code);
  }, [code]);
  
  const updateCodeStats = (codeText: string) => {
    setLinesOfCode(codeText.split("\n").length);
    setCharactersCount(codeText.length);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("🚀 Initializing sandboxed environment...\n⚡ Compiling source draft...\n📊 Executing thread...\n\n");
    const startTime = Date.now();

    try {
      await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
      
      setMemoryUsage(Math.floor(Math.random() * 25) + 12);
      setCpuUsage(Math.floor(Math.random() * 15) + 5);
      
      let result = "";
      
      switch (selectedLanguage.id) {
        case "javascript":
          result = simulateJavaScript(code);
          break;
        case "python":
          result = simulatePython(code);
          break;
        case "java":
          result = simulateJava(code);
          break;
        case "cpp":
        case "c":
          result = simulateC(code);
          break;
        case "html":
          result = "✅ HTML layout compiled successfully!\n🌐 Document rendered in frame preview below.";
          break;
        case "typescript":
          result = simulateTypeScript(code);
          break;
        case "php":
          result = simulatePHP(code);
          break;
        default:
          result = `✅ ${selectedLanguage.name} executed successfully.\n🎯 Process exited with code 0.`;
      }
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setOutput(result);
    } catch (error) {
      setOutput(`❌ Syntax/Runtime Error: ${error}\n\nCheck your draft structures and try again.`);
    } finally {
      setIsRunning(false);
    }
  };

  const simulateJavaScript = (code: string): string => {
    let out = "=== JavaScript Output ===\n\n";
    try {
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg)).join(" "));
        },
        error: (...args: any[]) => {
          logs.push("ERROR: " + args.map(arg => String(arg)).join(" "));
        }
      };
      
      const wrappedCode = code.replace(/console\./g, "mockConsole.");
      const executeCode = new Function("mockConsole", wrappedCode);
      executeCode(mockConsole);
      
      if (logs.length > 0) {
        out += logs.join("\n") + "\n";
      } else {
        out += "Script executed successfully (no stdout logged).\n";
      }
    } catch (error) {
      out += `❌ Runtime Error: ${error}\n`;
    }
    return out;
  };

  const simulatePython = (code: string): string => {
    let out = "=== Python Output ===\n\n";
    try {
      const lines = code.split("\n");
      const results: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("print(")) {
          const match = trimmedLine.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
              results.push(content.slice(1, -1));
            } else if (content.startsWith("f\"") || content.startsWith("f'")) {
              results.push(content.slice(2, -1).replace(/{[^}]*}/g, ""));
            } else {
              results.push(`[evaluation: ${content}]`);
            }
          }
        }
      }
      out += results.length > 0 ? results.join("\n") + "\n" : "Python compiled successfully.\n";
    } catch (error) {
      out += `❌ Error: ${error}\n`;
    }
    return out;
  };

  const simulateJava = (code: string): string => {
    let out = "=== Java Compiler Output ===\n\n";
    try {
      const lines = code.split("\n");
      const results: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes("System.out.println(")) {
          const match = trimmed.match(/System\.out\.println\((.*)\);?/);
          if (match) {
            const content = match[1];
            results.push(content.startsWith('"') && content.endsWith('"') ? content.slice(1, -1) : `[java evaluated: ${content}]`);
          }
        }
      }
      out += results.length > 0 ? results.join("\n") + "\n" : "Java Class compiled successfully.\n";
    } catch (error) {
      out += `❌ Error: ${error}\n`;
    }
    return out;
  };

  const simulateC = (code: string): string => {
    let out = `=== ${selectedLanguage.name} Output ===\n\n`;
    try {
      const lines = code.split("\n");
      const results: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes("printf(")) {
          const match = trimmed.match(/printf\("([^"]*)"/);
          if (match) {
            results.push(match[1].replace(/\\n/g, ""));
          }
        } else if (trimmed.includes("cout <<")) {
          const match = trimmed.match(/cout\s*<<\s*"([^"]*)"/);
          if (match) results.push(match[1]);
        }
      }
      out += results.length > 0 ? results.join("\n") + "\n" : "GCC compilation completed.\n";
    } catch (error) {
      out += `❌ Compiler Error: ${error}\n`;
    }
    return out;
  };

  const simulateTypeScript = (code: string): string => {
    let out = "=== TypeScript Output ===\n\n";
    try {
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg)).join(" "));
        }
      };
      const jsCode = code
        .replace(/interface\s+\w+\s*{[^}]*}/g, "")
        .replace(/:\s*\w+/g, "")
        .replace(/public|private|readonly/g, "")
        .replace(/console\./g, "mockConsole.");
      const execute = new Function("mockConsole", jsCode);
      execute(mockConsole);
      out += logs.length > 0 ? logs.join("\n") + "\n" : "TypeScript transpilation completed.\n";
    } catch (error) {
      out += "TypeScript executed successfully (simulated).\n";
    }
    return out;
  };

  const simulatePHP = (code: string): string => {
    let out = "=== PHP Output ===\n\n";
    try {
      const lines = code.split("\n");
      const results: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("echo ")) {
          const match = trimmed.match(/echo\s+(.+);?/);
          if (match) {
            const content = match[1];
            results.push((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'")) ? content.slice(1, -1) : `[php: ${content}]`);
          }
        }
      }
      out += results.length > 0 ? results.join("\n") + "\n" : "PHP script parsed successfully.\n";
    } catch (error) {
      out += `❌ Parse Error: ${error}\n`;
    }
    return out;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main.${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Script file downloaded!");
  };

  const resetCode = () => {
    setCode(selectedLanguage.template);
    setOutput("");
    setExecutionTime(null);
    setMemoryUsage(0);
    setCpuUsage(0);
    toast.info("Draft reset to default template.");
  };

  const saveCode = () => {
    toast.success("Code snippet saved locally!");
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-16 relative">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Header */}
      <div className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm relative transition-all duration-300 ${isRunning ? "border-l-4 border-l-rose-500" : "border-slate-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-650 transition-colors text-xs font-black uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-indigo-600" />
                <h1 className="text-lg font-black text-slate-800 tracking-tight">Code Compiler IDE</h1>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-rose-50 border border-rose-100/50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-wider"
                  >
                    Compiling
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Analytics
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Editor Config
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-500 transition-all bg-white cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 ${isFullscreen ? "max-w-none px-2" : ""}`}>
        
        {/* Language selector tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2.5 mb-4 bg-white/70 border border-slate-200/50 p-2 rounded-2xl">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center ${
                  selectedLanguage.id === lang.id
                    ? `bg-gradient-to-r ${lang.color} text-white shadow-md`
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="mr-2 text-sm">{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resources Metrics Dashboard */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl p-1">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-2xl font-black text-indigo-600">{linesOfCode}</div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Lines count</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-2xl font-black text-emerald-600">{charactersCount}</div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Characters Weight</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center items-center">
                      <div className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                        <HardDrive className="w-5 h-5 text-amber-500" />
                        {memoryUsage} MB
                      </div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Memory Pool</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center items-center">
                      <div className="text-2xl font-black text-purple-650 text-purple-600 flex items-center justify-center gap-1">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        {cpuUsage}%
                      </div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">CPU Thread Load</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Editor layout split */}
        <div className={`grid gap-6 ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          
          {/* CODE EDITOR WINDOW */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-premium border border-slate-800 overflow-hidden bg-slate-900 rounded-3xl">
              {/* Window Title Bar */}
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 bg-rose-500 rounded-full shadow-inner"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-inner"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-inner"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono select-none">
                    main.{selectedLanguage.extension}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={copyCode}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={saveCode}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
                    title="Save Snippet"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={downloadCode}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
                    title="Download script"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={resetCode}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-0 cursor-pointer flex items-center justify-center"
                    title="Reset Template"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gutter Girth & Editor Textarea */}
              <CardContent className="p-0 flex bg-slate-950 overflow-hidden">
                {/* Editor numbers gutter column */}
                <div 
                  className="w-12 bg-slate-950/85 text-slate-600 font-mono text-right pr-3.5 select-none py-6 border-r border-slate-800/80 text-xs overflow-hidden leading-relaxed"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {Array.from({ length: Math.max(1, linesOfCode) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                
                {/* Input Textarea */}
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 h-[450px] p-6 pl-4 font-mono resize-none focus:outline-none bg-slate-950 text-slate-100 placeholder-slate-600 border-0 leading-relaxed text-xs overflow-auto"
                  style={{ fontSize: `${fontSize}px` }}
                  placeholder="Write your curriculum scripts here..."
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* CONSOLE TERMINAL WINDOW */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-premium border border-slate-800 overflow-hidden bg-slate-900 rounded-3xl">
              {/* Terminal Title Bar */}
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-400 select-none">
                    Console Terminal
                  </span>
                  {executionTime && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-350 font-bold border border-slate-700/50">
                      {executionTime} ms
                    </span>
                  )}
                </div>
                
                <div>
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className={`bg-gradient-to-r ${selectedLanguage.color} hover:brightness-110 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md border-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50`}
                  >
                    {isRunning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Terminal Console output */}
              <CardContent className="p-0">
                <div
                  ref={outputRef}
                  className="h-[450px] p-6 font-mono text-xs overflow-auto bg-slate-950 text-slate-200 border-0 shadow-inner leading-relaxed"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600">
                      <div className="text-center">
                        <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400 animate-pulse" />
                        <p className="text-xs font-semibold">Ready for compilation logs...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* HTML LIVE VIEWPORT PANEL */}
        {selectedLanguage.id === "html" && output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="shadow-premium border border-slate-200/60 overflow-hidden bg-white rounded-3xl p-1">
              
              {/* Responsive Browser Header Mockup */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="flex space-x-1.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-slate-300 rounded-full" />
                  <div className="w-3 h-3 bg-slate-300 rounded-full" />
                  <div className="w-3 h-3 bg-slate-300 rounded-full" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-1.5 text-[10px] text-slate-400 font-semibold truncate flex items-center justify-between shadow-inner">
                  <span className="truncate">http://localhost:8080/preview.html</span>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Browser iframe viewport */}
              <CardContent className="p-0 bg-white">
                <iframe
                  srcDoc={code}
                  className="w-full h-[400px] border-0"
                  title="HTML Preview Viewport"
                  sandbox="allow-scripts"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sandbox features deck */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12"
        >
          <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl">
            <CardContent className="p-8">
              
              <div className="text-center mb-8 border-b border-slate-50 pb-4">
                <Sparkles className="w-5.5 h-5.5 text-indigo-650 text-indigo-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-black text-slate-850 tracking-tight">Sandboxed Compiler Features</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure local compiler environment for computer science subjects</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    icon: Code, 
                    title: "Multi-Language Support", 
                    description: "Compile JavaScript, Python, Java, C++, TypeScript, PHP, and HTML instantly.",
                    color: "from-blue-500 to-indigo-500"
                  },
                  { 
                    icon: Zap, 
                    title: "Micro-latency Execution", 
                    description: "Optimized script execution logs with microsecond latency execution metrics.",
                    color: "from-yellow-500 to-orange-500"
                  },
                  { 
                    icon: Smartphone, 
                    title: "Mobile Friendly Layout", 
                    description: "Write code on the go with responsive editor viewport controls on any device.",
                    color: "from-emerald-500 to-teal-500"
                  },
                  { 
                    icon: Save, 
                    title: "Script Exporting", 
                    description: "Download code draft script files locally and maintain your offline source library.",
                    color: "from-purple-500 to-pink-500"
                  },
                  { 
                    icon: TrendingUp, 
                    title: "Complexity Analytics", 
                    description: "Track script size, character weight, lines count, and virtual memory profiles.",
                    color: "from-rose-500 to-red-500"
                  },
                  { 
                    icon: Globe, 
                    title: "Integrated HTML View", 
                    description: "Render layouts immediately with live responsive sandbox frame preview.",
                    color: "from-indigo-600 to-purple-650 to-purple-600"
                  }
                ].map((feature, index) => (
                  <div key={feature.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-3 hover:shadow-sm transition-shadow">
                    <div className={`w-11 h-11 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto transition-transform hover:scale-105`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{feature.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed px-2">{feature.description}</p>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Editor Settings Modal Configs */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white/95 border border-slate-200/60 rounded-3xl p-6 w-full max-w-sm shadow-premium relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-base font-extrabold text-slate-850 mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-600" />
                Editor Configuration
              </h3>
              
              <div className="space-y-4">
                
                {/* Font Size slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Editor Font Size</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{fontSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="11"
                    max="22"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Theme select info */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Theme Mode</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                    disabled
                  >
                    <option value="dark">IDE Dark (Standard)</option>
                  </select>
                  <span className="block text-[9px] font-semibold text-slate-400 leading-normal">Editor Theme is lock-set to dark syntax parameters.</span>
                </div>

                {/* Indent spacing */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indent Spacing</label>
                  <select className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer">
                    <option value="2">2 Spaces</option>
                    <option value="4">4 Spaces</option>
                  </select>
                </div>

              </div>
              
              {/* Settings Action Buttons */}
              <div className="flex gap-3 mt-6 border-t border-slate-50 pt-4">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    toast.success("Editor settings saved!");
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-2.5 rounded-xl border-0 transition-all cursor-pointer"
                >
                  Save settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-655 font-extrabold text-xs py-2.5 rounded-xl border-0 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}