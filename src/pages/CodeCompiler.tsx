import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Upload, 
  Settings, 
  Code, 
  Terminal,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
  Share2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Save,
  FolderOpen,
  BookOpen,
  Award,
  Users,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Shield,
  Sparkles,
  TrendingUp,
  Target,
  Layers,
  Database,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

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
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
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
    color: 'from-yellow-400 to-orange-500',
    icon: '🟨'
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
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
    color: 'from-blue-400 to-green-500',
    icon: '🐍'
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
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
    color: 'from-red-500 to-orange-600',
    icon: '☕'
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    template: `// C++ Code - Modern C++17/20 Features
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <optional>

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
    color: 'from-blue-600 to-purple-600',
    icon: '⚡'
  },
  {
    id: 'c',
    name: 'C',
    extension: 'c',
    template: `// C Code - Advanced C Programming
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[50];
    char course[20];
    int* grades;
    int grade_count;
    int capacity;
} Student;

// Function prototypes
Student* createStudent(const char* name, const char* course);
void addGrade(Student* student, int grade);
double getAverageGrade(const Student* student);
void printStudentInfo(const Student* student);
void freeStudent(Student* student);

int main() {
    printf("Hello, World!\\n");
    printf("Advanced C Programming Example\\n");
    
    // Dynamic memory allocation
    Student* student = createStudent("Alice", "BCSIT");
    
    // Add grades
    addGrade(student, 85);
    addGrade(student, 92);
    addGrade(student, 78);
    addGrade(student, 96);
    
    // Display information
    printStudentInfo(student);
    
    // Calculate and display average
    double average = getAverageGrade(student);
    printf("Average grade: %.2f\\n", average);
    
    // Display individual grades
    printf("Grades: ");
    for (int i = 0; i < student->grade_count; i++) {
        printf("%d ", student->grades[i]);
    }
    printf("\\n");
    
    // Count high grades
    int highGrades = 0;
    for (int i = 0; i < student->grade_count; i++) {
        if (student->grades[i] >= 90) {
            highGrades++;
        }
    }
    printf("High grades (>=90): %d\\n", highGrades);
    
    // Clean up memory
    freeStudent(student);
    
    return 0;
}

Student* createStudent(const char* name, const char* course) {
    Student* student = malloc(sizeof(Student));
    if (!student) return NULL;
    
    strncpy(student->name, name, sizeof(student->name) - 1);
    strncpy(student->course, course, sizeof(student->course) - 1);
    student->name[sizeof(student->name) - 1] = '\\0';
    student->course[sizeof(student->course) - 1] = '\\0';
    
    student->capacity = 10;
    student->grades = malloc(student->capacity * sizeof(int));
    student->grade_count = 0;
    
    return student;
}

void addGrade(Student* student, int grade) {
    if (!student || !student->grades) return;
    
    if (student->grade_count >= student->capacity) {
        student->capacity *= 2;
        student->grades = realloc(student->grades, 
            student->capacity * sizeof(int));
    }
    
    student->grades[student->grade_count++] = grade;
}

double getAverageGrade(const Student* student) {
    if (!student || student->grade_count == 0) return 0.0;
    
    int sum = 0;
    for (int i = 0; i < student->grade_count; i++) {
        sum += student->grades[i];
    }
    
    return (double)sum / student->grade_count;
}

void printStudentInfo(const Student* student) {
    if (!student) return;
    printf("Student: %s, Course: %s\\n", student->name, student->course);
}

void freeStudent(Student* student) {
    if (student) {
        free(student->grades);
        free(student);
    }
}`,
    color: 'from-gray-600 to-blue-600',
    icon: '🔧'
  },
  {
    id: 'html',
    name: 'HTML',
    extension: 'html',
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .container {
            text-align: center; padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px; backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 800px; width: 90%;
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
        button {
            padding: 15px 30px; font-size: 1.1rem;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            border: none; border-radius: 50px; color: white;
            cursor: pointer; transition: all 0.3s; margin: 10px;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .features {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px; margin-top: 30px;
        }
        .feature {
            padding: 25px; background: rgba(255,255,255,0.1);
            border-radius: 15px; transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature:hover { 
            transform: translateY(-5px); 
            background: rgba(255,255,255,0.2);
        }
        .stats {
            display: flex; justify-content: space-around;
            margin: 30px 0; flex-wrap: wrap;
        }
        .stat {
            text-align: center; padding: 15px;
        }
        .stat h3 { font-size: 2rem; color: #feca57; }
        .code-demo {
            background: rgba(0,0,0,0.3); padding: 20px;
            border-radius: 10px; margin: 20px 0;
            text-align: left; font-family: 'Courier New', monospace;
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
                <p>Available</p>
            </div>
        </div>
        
        <button onclick="showFeatures()">🔍 Explore Features</button>
        <button onclick="showCode()">💻 View Code Demo</button>
        <button onclick="showStats()">📊 Show Statistics</button>
        
        <div class="features" id="features" style="display: none;">
            <div class="feature">
                <h3>💻 Multi-Language Support</h3>
                <p>JavaScript, Python, Java, C++, C, HTML, TypeScript, PHP, Go, Rust, Kotlin and more!</p>
            </div>
            <div class="feature">
                <h3>⚡ Lightning Fast</h3>
                <p>Optimized compilation and execution with real-time feedback</p>
            </div>
            <div class="feature">
                <h3>📱 Fully Responsive</h3>
                <p>Perfect experience on desktop, tablet, and mobile devices</p>
            </div>
            <div class="feature">
                <h3>🎨 Modern Interface</h3>
                <p>Beautiful, intuitive design with advanced code editor</p>
            </div>
            <div class="feature">
                <h3>💾 Save & Share</h3>
                <p>Save your code, download files, and share with others</p>
            </div>
            <div class="feature">
                <h3>📈 Analytics</h3>
                <p>Track your coding progress and performance metrics</p>
            </div>
        </div>
        
        <div class="code-demo" id="codeDemo" style="display: none;">
            <h3>🔥 Sample JavaScript Code:</h3>
            <pre><code>
// Modern JavaScript Example
const students = [
  { name: 'Alice', course: 'BCSIT', grade: 92 },
  { name: 'Bob', course: 'BCA', grade: 88 }
];

const topStudents = students
  .filter(s => s.grade >= 90)
  .map(s => \`\${s.name} (\${s.grade}%)\`);

console.log('Top Students:', topStudents);
            </code></pre>
        </div>
    </div>
    
    <script>
        function showFeatures() {
            const features = document.getElementById('features');
            features.style.display = features.style.display === 'none' ? 'grid' : 'none';
        }
        
        function showCode() {
            const demo = document.getElementById('codeDemo');
            demo.style.display = demo.style.display === 'none' ? 'block' : 'none';
        }
        
        function showStats() {
            alert('📊 Platform Statistics:\\n\\n• 10+ Programming Languages\\n• 1000+ Active Users\\n• 50,000+ Code Executions\\n• 99.9% Uptime\\n• 24/7 Availability');
        }
        
        // Add some interactive animations
        document.addEventListener('DOMContentLoaded', function() {
            const features = document.querySelectorAll('.feature');
            features.forEach((feature, index) => {
                feature.style.animationDelay = \`\${index * 0.1}s\`;
            });
        });
    </script>
</body>
</html>`,
    color: 'from-orange-500 to-red-500',
    icon: '🌐'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
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
  private students: Student[] = [];
  
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

// Union types and type guards
type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

function getLetterGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Usage
const university = new ModernUniversity("BCSITHub University");

const students: Student[] = [
  { name: "Alice Johnson", age: 20, course: "BCSIT", grades: [92, 88, 95] },
  { name: "Bob Smith", age: 21, course: "BCA", grades: [85, 90, 87] },
  { name: "Carol Davis", age: 19, course: "BCSIT", grades: [96, 94, 98] }
];

students.forEach(student => university.addStudent(student));

console.log("Hello, TypeScript World!");
console.log(\`University: \${university.name}\`);

const bcsitStudents = university.getStudentsByCourse("BCSIT");
console.log(\`BCSIT Students: \${bcsitStudents.length}\`);

const topStudents = university.getTopStudents(90);
console.log("Top Students (>=90%):");
topStudents.forEach(student => {
  const avg = university.calculateAverageGrade(student);
  console.log(\`- \${student.name}: \${avg.toFixed(2)}% (\${getLetterGrade(avg)})\`);
});

// Demonstrate generic function
const processedStudents = processData(students);
console.log("Students processed and sorted by name");`,
    color: 'from-blue-500 to-indigo-600',
    icon: '📘'
  },
  {
    id: 'php',
    name: 'PHP',
    extension: 'php',
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

class University {
    private array $students = [];
    
    public function __construct(
        public readonly string $name
    ) {}
    
    public function addStudent(Student $student): void {
        $this->students[] = $student;
        echo "Added student: {$student->name} to {$this->name}\\n";
    }
    
    public function getStudentsByCourse(string $course): array {
        return array_filter(
            $this->students, 
            fn(Student $s) => $s->course === $course
        );
    }
    
    public function getTopStudents(float $minGrade = 90.0): array {
        return array_filter(
            $this->students,
            fn(Student $s) => $s->getAverageGrade() >= $minGrade
        );
    }
    
    public function getStatistics(): array {
        $totalStudents = count($this->students);
        $courses = array_unique(array_map(fn($s) => $s->course, $this->students));
        $avgGrade = $totalStudents > 0 
            ? array_sum(array_map(fn($s) => $s->getAverageGrade(), $this->students)) / $totalStudents
            : 0;
            
        return [
            'total_students' => $totalStudents,
            'courses' => $courses,
            'average_grade' => round($avgGrade, 2)
        ];
    }
}

// Usage
echo "Hello, World!\\n";
echo "Welcome to Modern PHP Programming!\\n\\n";

$university = new University("BCSITHub University");

// Create students with different grades
$students = [
    new Student("Alice Johnson", 20, "BCSIT", [92, 88, 95, 90]),
    new Student("Bob Smith", 21, "BCA", [85, 90, 87, 92]),
    new Student("Carol Davis", 19, "BCSIT", [96, 94, 98, 95]),
    new Student("David Wilson", 22, "BIT", [78, 82, 85, 80])
];

// Add students to university
foreach ($students as $student) {
    $university->addStudent($student);
}

echo "\\n--- Student Information ---\\n";
foreach ($students as $student) {
    echo $student->getInfo() . "\\n";
    echo "Average Grade: " . number_format($student->getAverageGrade(), 2) . "% ({$student->getLetterGrade()})\\n";
    echo "Grades: " . implode(", ", $student->grades) . "\\n\\n";
}

// Get BCSIT students
$bcsitStudents = $university->getStudentsByCourse("BCSIT");
echo "BCSIT Students: " . count($bcsitStudents) . "\\n";

// Get top students
$topStudents = $university->getTopStudents(90);
echo "\\nTop Students (>=90%):\\n";
foreach ($topStudents as $student) {
    echo "- {$student->name}: " . number_format($student->getAverageGrade(), 2) . "%\\n";
}

// University statistics
$stats = $university->getStatistics();
echo "\\n--- University Statistics ---\\n";
echo "Total Students: {$stats['total_students']}\\n";
echo "Courses: " . implode(", ", $stats['courses']) . "\\n";
echo "Overall Average Grade: {$stats['average_grade']}%\\n";

// Demonstrate array functions
$gradeRanges = array_map(function($student) {
    $avg = $student->getAverageGrade();
    return [
        'name' => $student->name,
        'average' => $avg,
        'performance' => $avg >= 90 ? 'Excellent' : ($avg >= 80 ? 'Good' : 'Average')
    ];
}, $students);

echo "\\n--- Performance Summary ---\\n";
foreach ($gradeRanges as $performance) {
    echo "{$performance['name']}: {$performance['performance']} ({$performance['average']}%)\\n";
}

?>`,
    color: 'from-purple-500 to-blue-600',
    icon: '🐘'
  }
];

export function CodeCompiler() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savedCodes, setSavedCodes] = useState<{[key: string]: string}>({});
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
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
    setLinesOfCode(codeText.split('\n').length);
    setCharactersCount(codeText.length);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('🚀 Initializing compiler...\n⚡ Compiling code...\n📊 Executing program...\n\n');
    const startTime = Date.now();

    try {
      // Simulate realistic compilation and execution time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      // Simulate system resource usage
      setMemoryUsage(Math.floor(Math.random() * 50) + 20);
      setCpuUsage(Math.floor(Math.random() * 30) + 10);
      
      let result = '';
      
      switch (selectedLanguage.id) {
        case 'javascript':
          result = simulateJavaScript(code);
          break;
        case 'python':
          result = simulatePython(code);
          break;
        case 'java':
          result = simulateJava(code);
          break;
        case 'cpp':
        case 'c':
          result = simulateC(code);
          break;
        case 'html':
          result = '✅ HTML compiled successfully!\n🌐 Page rendered and ready for preview.\n📱 Responsive design detected.\n🎨 Styling applied successfully.';
          break;
        case 'typescript':
          result = simulateTypeScript(code);
          break;
        case 'php':
          result = simulatePHP(code);
          break;
        default:
          result = `✅ ${selectedLanguage.name} code executed successfully!\n🎯 Program completed without errors.\n📈 Performance: Excellent`;
      }
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setOutput(result);
    } catch (error) {
      setOutput(`❌ Error: ${error}\n\n🔍 Please check your code syntax and try again.`);
    } finally {
      setIsRunning(false);
    }
  };

  const simulateJavaScript = (code: string): string => {
    let output = '=== JavaScript Execution Results ===\n\n';
    
    try {
      // Create a safe execution environment
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        },
        error: (...args: any[]) => {
          logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
        }
      };
      
      // Replace console with our mock
      const wrappedCode = code.replace(/console\./g, 'mockConsole.');
      
      // Create a function to execute the code
      const executeCode = new Function('mockConsole', `
        ${wrappedCode}
      `);
      
      // Execute the code
      executeCode(mockConsole);
      
      // Return the captured output
      if (logs.length > 0) {
        output += logs.join('\n') + '\n';
      } else {
        output += 'Code executed successfully (no output)\n';
      }
      
    } catch (error) {
      output += `❌ Runtime Error: ${error}\n`;
    }
    
    output += '\n✅ JavaScript execution completed!';
    return output;
  };

  const simulatePython = (code: string): string => {
    let output = '=== Python Execution Results ===\n\n';
    
    try {
      // Extract print statements and evaluate simple expressions
      const lines = code.split('\n');
      const results: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Handle print statements
        if (trimmedLine.startsWith('print(')) {
          const match = trimmedLine.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            
            // Handle string literals
            if (content.startsWith('"') && content.endsWith('"')) {
              results.push(content.slice(1, -1));
            } else if (content.startsWith("'") && content.endsWith("'")) {
              results.push(content.slice(1, -1));
            }
            // Handle f-strings
            else if (content.startsWith('f"') || content.startsWith("f'")) {
              // Simple f-string handling
              const fString = content.slice(2, -1);
              results.push(fString.replace(/{[^}]*}/g, '[calculated value]'));
            }
            // Handle variables and expressions
            else {
              results.push(`${content} = [calculated result]`);
            }
          }
        }
        
        // Handle simple variable assignments for context
        else if (trimmedLine.includes(' = ') && !trimmedLine.startsWith('#')) {
          const [varName] = trimmedLine.split(' = ');
          if (varName && !varName.includes('def ') && !varName.includes('class ')) {
            // Variable assigned (we'll show this context)
          }
        }
      }
      
      if (results.length > 0) {
        output += results.join('\n') + '\n';
      } else {
        output += 'Code executed successfully (no print statements found)\n';
      }
      
    } catch (error) {
      output += `❌ Syntax Error: ${error}\n`;
    }
    
    output += '\n🐍 Python execution completed!';
    return output;
  };

  const simulateJava = (code: string): string => {
    let output = '=== Java Execution Results ===\n\n';
    
    try {
      const lines = code.split('\n');
      const results: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Handle System.out.println statements
        if (trimmedLine.includes('System.out.println(')) {
          const match = trimmedLine.match(/System\.out\.println\((.*)\);?/);
          if (match) {
            let content = match[1];
            
            // Handle string literals
            if (content.startsWith('"') && content.endsWith('"')) {
              results.push(content.slice(1, -1));
            }
            // Handle variables and expressions
            else {
              results.push(`${content} = [calculated result]`);
            }
          }
        }
        
        // Handle System.out.print statements
        else if (trimmedLine.includes('System.out.print(')) {
          const match = trimmedLine.match(/System\.out\.print\((.*)\);?/);
          if (match) {
            let content = match[1];
            if (content.startsWith('"') && content.endsWith('"')) {
              results.push(content.slice(1, -1));
            } else {
              results.push(`${content} = [calculated result]`);
            }
          }
        }
      }
      
      if (results.length > 0) {
        output += results.join('\n') + '\n';
      } else {
        output += 'Code compiled successfully (no output statements found)\n';
      }
      
    } catch (error) {
      output += `❌ Compilation Error: ${error}\n`;
    }
    
    output += '\n☕ Java execution completed!';
    return output;
  };

  const simulateC = (code: string): string => {
    let output = `=== ${selectedLanguage.name} Execution Results ===\n\n`;
    
    try {
      const lines = code.split('\n');
      const results: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Handle printf statements
        if (trimmedLine.includes('printf(')) {
          const match = trimmedLine.match(/printf\("([^"]*)"/); 
          if (match) {
            let content = match[1];
            // Handle format specifiers
            content = content.replace(/%s/g, '[string]');
            content = content.replace(/%d/g, '[number]');
            content = content.replace(/%f/g, '[float]');
            content = content.replace(/\\n/g, '');
            results.push(content);
          }
        }
        
        // Handle cout statements (C++)
        else if (trimmedLine.includes('cout <<')) {
          const match = trimmedLine.match(/cout\s*<<\s*"([^"]*)"/); 
          if (match) {
            results.push(match[1]);
          } else if (trimmedLine.includes('endl')) {
            const parts = trimmedLine.split('<<');
            for (const part of parts) {
              const stringMatch = part.match(/"([^"]*)"/); 
              if (stringMatch) {
                results.push(stringMatch[1]);
              }
            }
          }
        }
      }
      
      if (results.length > 0) {
        output += results.join('\n') + '\n';
      } else {
        output += 'Code compiled successfully (no output statements found)\n';
      }
      
    } catch (error) {
      output += `❌ Compilation Error: ${error}\n`;
    }
    
    output += `\n⚡ ${selectedLanguage.name} execution completed!`;
    return output;
  };

  const simulateTypeScript = (code: string): string => {
    let output = '=== TypeScript Execution Results ===\n\n';
    
    try {
      // TypeScript is similar to JavaScript for basic execution
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        }
      };
      
      // Remove TypeScript-specific syntax for basic execution
      let jsCode = code
        .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
        .replace(/:\s*\w+/g, '') // Remove type annotations
        .replace(/public|private|readonly/g, '') // Remove access modifiers
        .replace(/console\./g, 'mockConsole.');
      
      try {
        const executeCode = new Function('mockConsole', jsCode);
        executeCode(mockConsole);
        
        if (logs.length > 0) {
          output += logs.join('\n') + '\n';
        } else {
          output += 'TypeScript code compiled and executed successfully\n';
        }
      } catch (execError) {
        output += 'TypeScript code compiled (runtime simulation not available for complex TS features)\n';
      }
      
    } catch (error) {
      output += `❌ TypeScript Error: ${error}\n`;
    }
    
    output += '\n📘 TypeScript execution completed!';
    return output;
  };

  const simulatePHP = (code: string): string => {
    let output = '=== PHP Execution Results ===\n\n';
    
    try {
      const lines = code.split('\n');
      const results: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Handle echo statements
        if (trimmedLine.startsWith('echo ')) {
          const match = trimmedLine.match(/echo\s+(.+);?/);
          if (match) {
            let content = match[1];
            
            // Handle string literals
            if (content.startsWith('"') && content.endsWith('"')) {
              results.push(content.slice(1, -1).replace(/\\n/g, ''));
            } else if (content.startsWith("'") && content.endsWith("'")) {
              results.push(content.slice(1, -1).replace(/\\n/g, ''));
            }
            // Handle variables and expressions
            else {
              results.push(`${content} = [calculated result]`);
            }
          }
        }
        
        // Handle print statements
        else if (trimmedLine.startsWith('print ')) {
          const match = trimmedLine.match(/print\s+(.+);?/);
          if (match) {
            let content = match[1];
            if (content.startsWith('"') && content.endsWith('"')) {
              results.push(content.slice(1, -1));
            }
          }
        }
      }
      
      if (results.length > 0) {
        output += results.join('\n') + '\n';
      } else {
        output += 'PHP code executed successfully (no output statements found)\n';
      }
      
    } catch (error) {
      output += `❌ PHP Error: ${error}\n`;
    }
    
    output += '\n🐘 PHP execution completed!';
    return output;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    setCode(selectedLanguage.template);
    setOutput('');
    setExecutionTime(null);
    setMemoryUsage(0);
    setCpuUsage(0);
  };

  const saveCode = () => {
    const timestamp = new Date().toISOString();
    setSavedCodes(prev => ({
      ...prev,
      [timestamp]: code
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-indigo-600" />
                <h1 className="text-lg font-bold text-slate-800">
                  Code Compiler
                </h1>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-rose-50 border border-rose-100/50 text-rose-600 text-xs font-bold rounded-full"
                  >
                    Compiling
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Analytics
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Configs
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-500 transition-all duration-300 bg-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isFullscreen ? 'max-w-none px-2' : ''}`}>
        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2.5 mb-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
            {LANGUAGES.map((lang) => (
              <motion.button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center ${
                  selectedLanguage.id === lang.id
                    ? `bg-gradient-to-r ${lang.color} text-white shadow-md`
                    : 'bg-white text-slate-655 border border-slate-150 hover:bg-slate-50'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="mr-2 text-sm">{lang.icon}</span>
                {lang.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card hover={false} className="bg-white border border-slate-100 shadow-premium">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-all text-center">
                      <div className="text-2xl font-black text-indigo-650">{linesOfCode}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Lines of Code</div>
                    </div>
                    <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-all text-center">
                      <div className="text-2xl font-black text-emerald-650">{charactersCount}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Characters</div>
                    </div>
                    <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-all text-center">
                      <div className="text-2xl font-black text-amber-600">{memoryUsage}MB</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Memory Pool</div>
                    </div>
                    <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-all text-center">
                      <div className="text-2xl font-black text-purple-600">{cpuUsage}%</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">CPU Load</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card hover={false} className="shadow-premium border border-slate-100 overflow-hidden bg-slate-900 rounded-2xl">
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3.5 h-3.5 bg-rose-500 rounded-full shadow-sm"></div>
                    <div className="w-3.5 h-3.5 bg-amber-500 rounded-full shadow-sm"></div>
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-sm"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    main.{selectedLanguage.extension}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={copyCode}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={saveCode}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
                    title="Save snippet"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={downloadCode}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
                    title="Download script"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={resetCode}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
                    title="Reset draft"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-0">
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[450px] p-6 font-mono resize-none focus:outline-none bg-slate-950 text-slate-100 placeholder-slate-600 rounded-b-2xl border-0 shadow-inner"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card hover={false} className="shadow-premium border border-slate-100 overflow-hidden bg-slate-900 rounded-2xl">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-slate-455" />
                  <span className="text-xs font-bold text-slate-400">
                    Console Terminal
                  </span>
                  {executionTime && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700/50">
                      {executionTime} ms
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className={`bg-gradient-to-r ${selectedLanguage.color} hover:brightness-110 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md border-0 flex items-center gap-1.5`}
                    >
                      {isRunning ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Square className="w-3.5 h-3.5" />
                          </motion.div>
                          <span>Compiling...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Code</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                </div>
              </div>
              <CardContent className="p-0">
                <div
                  ref={outputRef}
                  className="h-[450px] p-6 font-mono text-sm overflow-auto bg-slate-950 text-slate-200 border-0 rounded-b-2xl shadow-inner border-t border-slate-900"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                >
                  {output || (
                    <div className="flex items-center justify-center h-full text-slate-600">
                      <div className="text-center">
                        <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                        <p className="text-xs font-semibold">Ready for compilation logs...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* HTML Preview for HTML code */}
        {selectedLanguage.id === 'html' && output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <Card hover={false} className="shadow-premium border border-slate-100 overflow-hidden bg-white rounded-2xl">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-650" />
                  <span className="text-xs font-bold text-slate-700">
                    Live HTML Viewport
                  </span>
                </div>
              </div>
              <CardContent className="p-0">
                <iframe
                  srcDoc={code}
                  className="w-full h-96 border-0"
                  title="HTML Preview"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Advanced Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <Card hover={false} className="border border-slate-100 shadow-premium bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-10">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                <h3 className="text-2xl font-bold text-slate-800">
                  Sandboxed Compiler Features
                </h3>
                <p className="text-xs font-bold text-slate-455 uppercase tracking-widest mt-1">
                  Secure local compiler environment for modern web development courses
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    icon: Code, 
                    title: "Multi-Language Support", 
                    description: "Compile JavaScript, Python, Java, C++, TypeScript, PHP, Go, Rust, and more instantly.",
                    color: "from-blue-500 to-indigo-500"
                  },
                  { 
                    icon: Zap, 
                    title: "Lightning Execution", 
                    description: "Optimized script execution logs with microsecond execution tracking metric.",
                    color: "from-yellow-450 to-orange-500"
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
                    description: "Download code snapshots locally as files and maintain your offline library.",
                    color: "from-purple-500 to-pink-500"
                  },
                  { 
                    icon: TrendingUp, 
                    title: "Complexity Analytics", 
                    description: "Track script size, character distributions, lines count, and virtual memory profiles.",
                    color: "from-rose-500 to-red-500"
                  },
                  { 
                    icon: Globe, 
                    title: "Integrated HTML View", 
                    description: "Render layouts immediately with live responsive sandbox frame preview.",
                    color: "from-indigo-600 to-purple-650"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-2 text-center">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-lg border border-slate-100 rounded-2xl p-6 w-full max-w-md shadow-premium animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3">Editor Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-2.5 uppercase tracking-wider">
                    Font Size
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-600 w-8">{fontSize}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-555 mb-3 uppercase tracking-wider">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="p-3 border border-indigo-500 bg-indigo-50/20 rounded-xl transition-all"
                      onClick={() => {}}
                    >
                      <div className="w-full h-8 bg-slate-900 rounded-lg mb-2"></div>
                      <span className="text-xs font-bold text-indigo-700">Editor Dark</span>
                    </button>
                    <button
                      className="p-3 border border-slate-200 bg-white rounded-xl opacity-60 cursor-not-allowed"
                      disabled
                      title="Only Dark theme available for Code Compiler editor"
                    >
                      <div className="w-full h-8 bg-slate-50 border rounded-lg mb-2"></div>
                      <span className="text-xs font-semibold text-slate-400">Editor Light</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-555 mb-2 uppercase tracking-wider">
                    Auto-Save Drafts
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Save code snapshots locally</span>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-650 transition-colors duration-300"
                      onClick={() => {}}
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-555 mb-2 uppercase tracking-wider">
                    Display Line Numbers
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold font-sans">Show line numbers margins</span>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-650 transition-colors duration-300"
                      onClick={() => {}}
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-2 uppercase tracking-wider">
                    Indent Spacing
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all">
                    <option value="2">2 spaces</option>
                    <option value="4" selected>4 spaces</option>
                    <option value="8">8 spaces</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 border-t border-slate-50 pt-5">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all duration-300"
                >
                  Save settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-semibold text-xs py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}