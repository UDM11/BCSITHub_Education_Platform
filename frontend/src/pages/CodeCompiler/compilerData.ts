import React from "react";

export interface LanguageDef {
  id: string; // matches Piston execution ID
  name: string;
  category: "programming" | "web" | "database" | "popular";
  pistonLanguage: string;
  pistonVersion: string;
  extension: string;
  logo: string; // SVG path/content or emoji fallback
  template: string;
}

export const LANGUAGES_LIST: LanguageDef[] = [
  {
    id: "html",
    name: "HTML",
    category: "web",
    pistonLanguage: "html",
    pistonVersion: "5",
    extension: "html",
    logo: "html",
    template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BCSITHub Sandbox</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="card">
    <h1 class="title">🚀 BCSITHub Sandbox</h1>
    <p id="clock">Loading...</p>
    <button id="btn" onclick="changeColor()">Change Color</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`
  },
  {
    id: "python",
    name: "Python",
    category: "programming",
    pistonLanguage: "python",
    pistonVersion: "3.10.0",
    extension: "py",
    logo: "python",
    template: `# ── Python Advanced Demo ──────────────────────────

from functools import reduce
from datetime import datetime

# ── 1. OOP with inheritance ──
class Shape:
    def __init__(self, color="white"):
        self.color = color

    def area(self):
        return 0

    def __repr__(self):
        return f"{self.__class__.__name__}(color={self.color}, area={self.area():.2f})"


class Circle(Shape):
    PI = 3.14159

    def __init__(self, radius, color="red"):
        super().__init__(color)
        self.radius = radius

    def area(self):
        return Circle.PI * self.radius ** 2


class Rectangle(Shape):
    def __init__(self, w, h, color="blue"):
        super().__init__(color)
        self.w, self.h = w, h

    def area(self):
        return self.w * self.h


shapes = [Circle(5), Circle(3, "green"), Rectangle(4, 6), Rectangle(10, 2, "yellow")]

print("── Shapes ──────────────────────")
for s in shapes:
    print(f"  {s}")

# ── 2. Functional programming ──
areas = list(map(lambda s: s.area(), shapes))
total = reduce(lambda a, b: a + b, areas)
largest = max(shapes, key=lambda s: s.area())

print(f"\n── Statistics ──────────────────")
print(f"  Total area  : {total:.2f}")
print(f"  Largest     : {largest}")

# ── 3. List comprehensions + filtering ──
big_shapes = [s for s in shapes if s.area() > 20]
print(f"  Big shapes  : {[str(s) for s in big_shapes]}")

# ── 4. Dictionary + sorting ──
grades = {"Alice": 92, "Bob": 75, "Carol": 88, "Dave": 61}
sorted_grades = dict(sorted(grades.items(), key=lambda x: x[1], reverse=True))
print(f"\n── Grade Leaderboard ───────────")
for rank, (name, score) in enumerate(sorted_grades.items(), 1):
    grade = "A" if score >= 90 else "B" if score >= 75 else "C"
    print(f"  #{rank} {name:<8} {score}  [{grade}]")

# ── 5. Exception handling ──
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "Error: Division by zero!"

print(f"\n── Safe Divide ─────────────────")
print(f"  10 / 3  = {safe_divide(10, 3):.4f}")
print(f"  10 / 0  = {safe_divide(10, 0)}")

print(f"\n  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
`
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "programming",
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    extension: "js",
    logo: "javascript",
    template: `// ── JavaScript Advanced Demo ──────────────────────

// ── 1. Classes + Inheritance ──
class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }
  speak() {
    return \`\${this.name} says "\${this.sound}"\`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "Woof");
    this.tricks = [];
  }
  learn(trick) {
    this.tricks.push(trick);
    return this;
  }
  perform() {
    return \`\${this.name} performs: \${this.tricks.join(", ")}\`;
  }
}

const dog = new Dog("Rex");
dog.learn("sit").learn("shake").learn("roll over");
console.log(dog.speak());
console.log(dog.perform());

// ── 2. Async / Promises simulation ──
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchUserData(id) {
  const users = {
    1: { name: "Alice",  role: "Admin" },
    2: { name: "Bob",    role: "User"  },
    3: { name: "Carol",  role: "Mod"   },
  };
  return users[id] || null;
}

async function main() {
  console.log("\\n── Async Fetch ─────────────────");
  const ids = [1, 2, 3, 99];
  const results = await Promise.all(ids.map(id => fetchUserData(id)));
  results.forEach((user, i) => {
    if (user) console.log(\`  User[\${ids[i]}] → \${user.name} (\${user.role})\`);
    else       console.log(\`  User[\${ids[i]}] → Not found\`);
  });

  // ── 3. Destructuring + spread ──
  console.log("\\n── Destructuring ───────────────");
  const { name, role, ...rest } = { name: "Alice", role: "Admin", age: 30, city: "Kathmandu" };
  console.log(\`  name=\${name}, role=\${role}, rest=\${JSON.stringify(rest)}\`);

  // ── 4. Functional array methods ──
  console.log("\\n── Array Methods ───────────────");
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const evenSquares = nums.filter(n => n % 2 === 0).map(n => n ** 2);
  const sumAll = nums.reduce((acc, n) => acc + n, 0);
  console.log(\`  Even squares : [\${evenSquares}]\`);
  console.log(\`  Sum 1–10     : \${sumAll}\`);

  // ── 5. Closures + factory function ──
  console.log("\\n── Counter Factory ─────────────");
  function makeCounter(start = 0, step = 1) {
    let count = start;
    return {
      next: () => (count += step),
      reset: () => (count = start),
      value: () => count,
    };
  }
  const c = makeCounter(0, 3);
  console.log(\`  \${c.next()} \${c.next()} \${c.next()} \${c.next()}\`);
}

main();
`
  },
  {
    id: "java",
    name: "Java",
    category: "programming",
    pistonLanguage: "java",
    pistonVersion: "15.0.2",
    extension: "java",
    logo: "java",
    template: `// ── Java Advanced Demo ────────────────────────────
// NOTE: Main class MUST stay "Main" (Piston expects main.java)

import java.util.*;
import java.util.stream.*;

public class Main {

    // ── 1. Generic Stack ──
    static class Stack<T> {
        private final LinkedList<T> list = new LinkedList<>();
        public void push(T val) { list.addFirst(val); }
        public T pop()          { return list.removeFirst(); }
        public T peek()         { return list.getFirst(); }
        public boolean isEmpty(){ return list.isEmpty(); }
        public int size()       { return list.size(); }
        @Override public String toString() { return list.toString(); }
    }

    // ── 2. Student record ──
    record Student(String name, int age, double gpa) {
        String grade() {
            if (gpa >= 3.7) return "A";
            if (gpa >= 3.0) return "B";
            if (gpa >= 2.0) return "C";
            return "F";
        }
        @Override public String toString() {
            return String.format("%-12s age=%-3d gpa=%.2f [%s]", name, age, gpa, grade());
        }
    }

    public static void main(String[] args) {

        // ── Generic Stack demo ──
        System.out.println("── Generic Stack ───────────────");
        Stack<Integer> stack = new Stack<>();
        for (int i : new int[]{10, 20, 30, 40, 50}) stack.push(i);
        System.out.println("  Stack : " + stack);
        System.out.println("  Pop   : " + stack.pop());
        System.out.println("  Peek  : " + stack.peek());
        System.out.println("  Size  : " + stack.size());

        // ── Stream API ──
        System.out.println("\\n── Stream API ──────────────────");
        List<Student> students = List.of(
            new Student("Alice",  20, 3.85),
            new Student("Bob",    22, 2.75),
            new Student("Carol",  21, 3.50),
            new Student("Dave",   23, 1.80),
            new Student("Eve",    20, 3.95)
        );

        students.stream()
            .sorted(Comparator.comparingDouble(Student::gpa).reversed())
            .forEach(s -> System.out.println("  " + s));

        double avg = students.stream()
            .mapToDouble(Student::gpa)
            .average().orElse(0);
        System.out.printf("\\n  Average GPA : %.2f%n", avg);

        long honours = students.stream()
            .filter(s -> s.gpa() >= 3.5)
            .count();
        System.out.println("  Honours     : " + honours + " student(s)");

        // ── Collections + Map ──
        System.out.println("\\n── Grade Distribution ──────────");
        Map<String, Long> dist = students.stream()
            .collect(Collectors.groupingBy(Student::grade, Collectors.counting()));
        dist.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(e -> System.out.println("  Grade " + e.getKey() + " → " + e.getValue()));

        // ── Exception handling ──
        System.out.println("\\n── Exception Handling ──────────");
        int[] data = {10, 0, 5};
        for (int i = 0; i < data.length - 1; i++) {
            try {
                System.out.printf("  %d / %d = %d%n", data[i], data[i+1], data[i] / data[i+1]);
            } catch (ArithmeticException e) {
                System.out.println("  Caught: " + e.getMessage());
            }
        }
    }
}
`
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "database",
    pistonLanguage: "mysql",
    pistonVersion: "8.0.25",
    extension: "sql",
    logo: "mysql",
    template: `-- ── MySQL Advanced Demo ────────────────────────────

-- Create tables
CREATE TABLE departments (
    dept_id   INT PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(50),
    budget    DECIMAL(10,2)
);

CREATE TABLE employees (
    emp_id    INT PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(50),
    dept_id   INT,
    salary    DECIMAL(10,2),
    hire_date DATE,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Insert data
INSERT INTO departments (name, budget) VALUES
    ('Engineering', 500000.00),
    ('Marketing',   200000.00),
    ('HR',          100000.00);

INSERT INTO employees (name, dept_id, salary, hire_date) VALUES
    ('Alice',   1, 95000.00, '2020-03-15'),
    ('Bob',     1, 88000.00, '2021-07-01'),
    ('Carol',   2, 72000.00, '2019-11-20'),
    ('Dave',    2, 68000.00, '2022-01-10'),
    ('Eve',     3, 55000.00, '2020-05-30'),
    ('Frank',   1, 102000.00,'2018-09-01');

-- ── Query 1: JOIN ──
SELECT e.name AS Employee, d.name AS Department, e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.salary DESC;

-- ── Query 2: Aggregates per department ──
SELECT
    d.name            AS Department,
    COUNT(*)          AS Headcount,
    ROUND(AVG(e.salary), 2) AS AvgSalary,
    MAX(e.salary)     AS MaxSalary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.name
ORDER BY AvgSalary DESC;

-- ── Query 3: Subquery – employees above company average ──
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;
`
  },
  {
    id: "c",
    name: "C",
    category: "programming",
    pistonLanguage: "c",
    pistonVersion: "10.2.0",
    extension: "c",
    logo: "c",
    template: `// ── C Advanced Demo ────────────────────────────────
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ── 1. Struct: Student ──
typedef struct {
    char name[32];
    int  age;
    double gpa;
} Student;

char* grade(double gpa) {
    if (gpa >= 3.7) return "A";
    if (gpa >= 3.0) return "B";
    if (gpa >= 2.0) return "C";
    return "F";
}

void print_student(const Student* s) {
    printf("  %-12s age=%-3d  gpa=%.2f  [%s]\\n",
           s->name, s->age, s->gpa, grade(s->gpa));
}

// ── 2. Bubble sort ──
void bubble_sort(Student arr[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j].gpa < arr[j+1].gpa) {
                Student tmp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = tmp;
            }
}

// ── 3. Fibonacci (iterative) ──
void print_fibonacci(int count) {
    long long a = 0, b = 1;
    printf("  Fib(%d): ", count);
    for (int i = 0; i < count; i++) {
        printf("%lld ", a);
        long long t = a + b;
        a = b; b = t;
    }
    printf("\\n");
}

// ── 4. Simple linked list node ──
typedef struct Node { int val; struct Node* next; } Node;

Node* push(Node* head, int val) {
    Node* n = malloc(sizeof(Node));
    n->val = val; n->next = head;
    return n;
}

void print_list(Node* head) {
    printf("  List: ");
    while (head) { printf("%d ", head->val); head = head->next; }
    printf("\\n");
}

int main() {
    // ── Students ──
    printf("── Students (sorted by GPA) ─────\\n");
    Student students[] = {
        {"Alice",  20, 3.85},
        {"Bob",    22, 2.75},
        {"Carol",  21, 3.50},
        {"Dave",   23, 1.80},
        {"Eve",    20, 3.95},
    };
    int n = sizeof(students) / sizeof(students[0]);
    bubble_sort(students, n);
    for (int i = 0; i < n; i++) print_student(&students[i]);

    double sum = 0;
    for (int i = 0; i < n; i++) sum += students[i].gpa;
    printf("  Average GPA: %.2f\\n", sum / n);

    // ── Fibonacci ──
    printf("\\n── Fibonacci ─────────────────────\\n");
    print_fibonacci(10);

    // ── Linked List ──
    printf("\\n── Linked List ───────────────────\\n");
    Node* head = NULL;
    for (int i = 1; i <= 6; i++) head = push(head, i * 10);
    print_list(head);

    // ── Integer Math ──
    printf("\\n── Integer Math ──────────────────\\n");
    int base = 2, result = 1;
    for (int i = 0; i < 10; i++) result *= base;
    printf("  2^10 = %d\\n", result);
    printf("  144 / 12 = %d\\n", 144 / 12);
    printf("  7 %% 3 = %d\\n", 7 % 3);

    return 0;
}
`
  },
  {
    id: "cpp",
    name: "C++",
    category: "programming",
    pistonLanguage: "cpp",
    pistonVersion: "10.2.0",
    extension: "cpp",
    logo: "cpp",
    template: `// ── C++ Advanced Demo ──────────────────────────────
#include <iostream>
#include <vector>
#include <algorithm>
#include <map>
#include <string>
#include <numeric>
#include <iomanip>
using namespace std;

// ── 1. Template class: MinMaxStack ──
template<typename T>
class MinMaxStack {
    vector<T> data;
public:
    void push(T val) { data.push_back(val); }
    T pop() { T v = data.back(); data.pop_back(); return v; }
    T min() const { return *min_element(data.begin(), data.end()); }
    T max() const { return *max_element(data.begin(), data.end()); }
    size_t size() const { return data.size(); }
};

// ── 2. Student struct ──
struct Student {
    string name;
    int age;
    double gpa;
    string grade() const {
        if (gpa >= 3.7) return "A";
        if (gpa >= 3.0) return "B";
        if (gpa >= 2.0) return "C";
        return "F";
    }
};

ostream& operator<<(ostream& os, const Student& s) {
    os << left << setw(12) << s.name
       << " age=" << s.age
       << " gpa=" << fixed << setprecision(2) << s.gpa
       << " [" << s.grade() << "]";
    return os;
}

int main() {
    // ── MinMaxStack ──
    cout << "── MinMaxStack<int> ────────────\\n";
    MinMaxStack<int> stk;
    for (int v : {42, 17, 99, 3, 56}) stk.push(v);
    cout << "  Size=" << stk.size()
         << " Min=" << stk.min()
         << " Max=" << stk.max() << "\\n";
    cout << "  Pop: " << stk.pop() << " (new max=" << stk.max() << ")\\n";

    // ── Students with STL ──
    cout << "\\n── Students (desc GPA) ─────────\\n";
    vector<Student> students = {
        {"Alice",  20, 3.85},
        {"Bob",    22, 2.75},
        {"Carol",  21, 3.50},
        {"Dave",   23, 1.80},
        {"Eve",    20, 3.95},
    };
    sort(students.begin(), students.end(),
         [](const Student& a, const Student& b){ return a.gpa > b.gpa; });
    for (auto& s : students) cout << "  " << s << "\\n";

    double avg = accumulate(students.begin(), students.end(), 0.0,
                            [](double acc, const Student& s){ return acc + s.gpa; }) / students.size();
    cout << fixed << setprecision(2) << "  Average GPA: " << avg << "\\n";

    // ── Grade distribution map ──
    cout << "\\n── Grade Distribution ──────────\\n";
    map<string, int> dist;
    for (auto& s : students) dist[s.grade()]++;
    for (auto& [g, c] : dist) cout << "  Grade " << g << " → " << c << "\\n";

    // ── Lambda + transform ──
    cout << "\\n── Squares via Lambda ──────────\\n";
    vector<int> nums(10); iota(nums.begin(), nums.end(), 1);
    vector<int> sq;
    transform(nums.begin(), nums.end(), back_inserter(sq), [](int x){ return x*x; });
    for (int v : sq) cout << v << " ";
    cout << "\\n";

    return 0;
}
`
  },
  {
    id: "php",
    name: "PHP",
    category: "programming",
    pistonLanguage: "php",
    pistonVersion: "8.0.2",
    extension: "php",
    logo: "php",
    template: `<?php
// ── PHP Advanced Demo ────────────────────────────

// ── 1. Interface + Classes ──
interface Describable {
    public function describe(): string;
}

abstract class Vehicle implements Describable {
    public function __construct(
        protected string $brand,
        protected int    $year,
        protected float  $price
    ) {}
    abstract public function type(): string;
    public function describe(): string {
        return sprintf("%s %s (%d) — $%.2f", $this->type(), $this->brand, $this->year, $this->price);
    }
}

class Car extends Vehicle {
    public function __construct(string $brand, int $year, float $price, private int $doors = 4) {
        parent::__construct($brand, $year, $price);
    }
    public function type(): string { return "Car 🚗"; }
}

class Truck extends Vehicle {
    public function __construct(string $brand, int $year, float $price, private float $payload) {
        parent::__construct($brand, $year, $price);
    }
    public function type(): string { return "Truck 🚚"; }
    public function describe(): string {
        return parent::describe() . " | Payload: {$this->payload}t";
    }
}

$fleet = [
    new Car("Toyota",  2022, 25000),
    new Truck("Volvo", 2020, 85000, 20.5),
    new Car("BMW",     2023, 55000, 2),
    new Truck("Scania",2019, 120000, 35.0),
];

echo "── Fleet ─────────────────────────\n";
foreach ($fleet as $v) echo "  " . $v->describe() . "\n";

// ── 2. Array functions ──
echo "\n── Top 2 by Price ─────────────────\n";
usort($fleet, fn($a, $b) => $b->price <=> $a->price);
array_slice($fleet, 0, 2);
foreach (array_slice($fleet, 0, 2) as $v) echo "  " . $v->describe() . "\n";

// ── 3. Associative array + array functions ──
echo "\n── Student Grades ─────────────────\n";
$grades = ["Alice" => 92, "Bob" => 75, "Carol" => 88, "Dave" => 61, "Eve" => 95];
arsort($grades);
foreach ($grades as $name => $score) {
    $letter = match(true) {
        $score >= 90 => "A",
        $score >= 75 => "B",
        default      => "C",
    };
    printf("  %-8s %3d  [%s]\n", $name, $score, $letter);
}
printf("  Average: %.1f\n", array_sum($grades) / count($grades));

// ── 4. String functions ──
echo "\n── String Operations ──────────────\n";
$sentence = "  BCSITHub is an awesome educational platform!  ";
echo "  Original : '" . $sentence . "'\n";
echo "  Trimmed  : '" . trim($sentence) . "'\n";
echo "  Upper    : " . strtoupper(trim($sentence)) . "\n";
echo "  Word cnt : " . str_word_count(trim($sentence)) . "\n";

// ── 5. Closures ──
echo "\n── Fibonacci (closure) ────────────\n";
$fib = function(int $n) use (&$fib): int {
    return $n <= 1 ? $n : $fib($n - 1) + $fib($n - 2);
};
$seq = array_map($fib, range(0, 9));
echo "  " . implode(" ", $seq) . "\n";
`
  },
  {
    id: "csharp",
    name: "C#",
    category: "programming",
    pistonLanguage: "csharp",
    pistonVersion: "6.12.0",
    extension: "cs",
    logo: "csharp",
    template: `// ── C# Advanced Demo ────────────────────────────────
using System;
using System.Collections.Generic;
using System.Linq;

// ── 1. Student class with computed Grade ──
class Student {
    public string Name { get; }
    public int    Age  { get; }
    public double GPA  { get; }

    public Student(string name, int age, double gpa) {
        Name = name; Age = age; GPA = gpa;
    }

    public string Grade {
        get {
            if (GPA >= 3.7) return "A";
            if (GPA >= 3.0) return "B";
            if (GPA >= 2.0) return "C";
            return "F";
        }
    }

    public override string ToString() =>
        string.Format("{0,-12} age={1,-3} gpa={2:F2} [{3}]", Name, Age, GPA, Grade);
}

// ── 2. Generic Repository ──
class Repository<T> where T : class {
    private readonly List<T> _items = new List<T>();
    public void Add(T item) { _items.Add(item); }
    public IEnumerable<T> GetAll() { return _items; }
    public int Count { get { return _items.Count; } }
}

class Program {
    static void Main() {
        var repo = new Repository<Student>();
        repo.Add(new Student("Alice",  20, 3.85));
        repo.Add(new Student("Bob",    22, 2.75));
        repo.Add(new Student("Carol",  21, 3.50));
        repo.Add(new Student("Dave",   23, 1.80));
        repo.Add(new Student("Eve",    20, 3.95));

        // ── 3. LINQ queries ──
        Console.WriteLine("── Students (desc GPA) ──────────");
        var sorted = repo.GetAll().OrderByDescending(s => s.GPA);
        foreach (var s in sorted) Console.WriteLine("  " + s);

        double avg = repo.GetAll().Average(s => s.GPA);
        Console.WriteLine("\n  Average GPA : " + avg.ToString("F2"));
        Console.WriteLine("  Honours     : " + repo.GetAll().Count(s => s.GPA >= 3.5) + " student(s)");

        // ── 4. LINQ group by ──
        Console.WriteLine("\n── Grade Distribution ───────────");
        var dist = repo.GetAll()
            .GroupBy(s => s.Grade)
            .OrderBy(g => g.Key);
        foreach (var g in dist)
            Console.WriteLine("  Grade " + g.Key + " => " + g.Count());

        // ── 5. Word frequency ──
        Console.WriteLine("\n── Word Frequency ───────────────");
        string text = "the quick brown fox jumps over the lazy dog the fox";
        var freq = text.Split(' ')
            .GroupBy(w => w)
            .OrderByDescending(g => g.Count())
            .Take(5);
        foreach (var g in freq)
            Console.WriteLine("  '" + g.Key + "' => " + g.Count() + "x");

        // ── 6. Safe parse ──
        Console.WriteLine("\n── Safe Parse ───────────────────");
        string[] inputs = { "42", "abc", "3.14", "" };
        foreach (var s in inputs) {
            int val;
            bool ok = int.TryParse(s, out val);
            Console.WriteLine("  '" + s + "' => " + (ok ? val.ToString() : "parse error"));
        }
    }
}
`
  },
  {
    id: "nodejs",
    name: "NodeJS",
    category: "programming",
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    extension: "js",
    logo: "nodejs",
    template: `// ── Node.js Advanced Demo ────────────────────────────
'use strict';
const os   = require('os');
const path = require('path');
const { EventEmitter } = require('events');

// ── 1. System Info ──
console.log('── System Info ─────────────────');
console.log('  Platform :', os.platform());
console.log('  Arch     :', os.arch());
console.log('  CPUs     :', os.cpus().length);
console.log('  RAM (MB) :', Math.round(os.totalmem() / 1024 / 1024));
console.log('  Free (MB):', Math.round(os.freemem()  / 1024 / 1024));

// ── 2. EventEmitter ──
console.log('\n── Event System ────────────────');
class Logger extends EventEmitter {
  log(level, msg) { this.emit('log', { level, msg, ts: new Date().toISOString() }); }
}

const logger = new Logger();
logger.on('log', ({ level, msg, ts }) => {
  const icons = { INFO: 'ℹ', WARN: '⚠', ERROR: '✖' };
  console.log(\`  [\${icons[level] || '•'}] \${level.padEnd(5)} \${msg}\`);
});

logger.log('INFO',  'Server started on port 3000');
logger.log('WARN',  'Memory usage above 80%');
logger.log('ERROR', 'Database connection timeout');

// ── 3. Async / Promise chain ──
console.log('\n── Async Pipeline ──────────────');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function pipeline(name) {
  const steps = ['validate', 'process', 'save'];
  for (const step of steps) {
    await sleep(0); // yield without real delay in sandbox
    console.log(\`  [\${name}] → \${step} ✓\`);
  }
  return \`\${name} complete\`;
}

(async () => {
  const results = await Promise.all([
    pipeline('Job-A'),
    pipeline('Job-B'),
  ]);
  console.log('\n  Results:', results);

  // ── 4. Functional utils ──
  console.log('\n── Functional Utilities ────────');
  const data = Array.from({ length: 10 }, (_, i) => i + 1);
  const evens = data.filter(n => n % 2 === 0);
  const squares = evens.map(n => n ** 2);
  const total = squares.reduce((a, b) => a + b, 0);
  console.log('  Numbers  :', data.join(' '));
  console.log('  Even²    :', squares.join(' '));
  console.log('  Sum even²:', total);

  // ── 5. Path utilities ──
  console.log('\n── Path Utilities ──────────────');
  const p = '/home/user/projects/app/src/index.js';
  console.log('  dir     :', path.dirname(p));
  console.log('  base    :', path.basename(p));
  console.log('  ext     :', path.extname(p));
  console.log('  joined  :', path.join('/usr', 'local', 'bin', 'node'));
})();
`
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "database",
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    extension: "js",
    logo: "mongodb",
    template: `// ── MongoDB Concepts (Pure JS Simulation) ────────────
// Note: Piston runs plain JS; this simulates MongoDB operations
// Use this to learn MongoDB query logic before applying in a real shell.

// ── In-memory "collection" ──
const students = [
  { _id: 1, name: "Alice",  course: "BCSIT",  year: 2, gpa: 3.85, city: "Kathmandu" },
  { _id: 2, name: "Bob",    course: "BIT",    year: 3, gpa: 2.75, city: "Pokhara"   },
  { _id: 3, name: "Carol",  course: "BCSIT",  year: 1, gpa: 3.50, city: "Kathmandu" },
  { _id: 4, name: "Dave",   course: "BCA",    year: 4, gpa: 1.80, city: "Lalitpur"  },
  { _id: 5, name: "Eve",    course: "BCSIT",  year: 2, gpa: 3.95, city: "Kathmandu" },
  { _id: 6, name: "Frank",  course: "BIT",    year: 1, gpa: 3.10, city: "Chitwan"   },
];

// ── Simulate: db.students.find({ course: "BCSIT" }) ──
function find(col, query = {}) {
  return col.filter(doc =>
    Object.entries(query).every(([k, v]) => {
      if (v && typeof v === 'object') {
        if ('$gte' in v) return doc[k] >= v['$gte'];
        if ('$lte' in v) return doc[k] <= v['$lte'];
        if ('$gt'  in v) return doc[k] >  v['$gt'];
      }
      return doc[k] === v;
    })
  );
}

// ── Simulate: aggregate $group ──
function groupBy(col, field, aggField) {
  return col.reduce((acc, doc) => {
    const key = doc[field];
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count++;
    acc[key].total += doc[aggField] ?? 0;
    return acc;
  }, {});
}

// ── 1. find() ──
console.log('── db.students.find({ course: "BCSIT" }) ──');
find(students, { course: "BCSIT" }).forEach(s =>
  console.log(\`  \${s.name.padEnd(8)} GPA=\${s.gpa} Year=\${s.year}\`)
);

// ── 2. find with $gte ──
console.log('\n── db.students.find({ gpa: { $gte: 3.5 } }) ──');
find(students, { gpa: { $gte: 3.5 } })
  .sort((a, b) => b.gpa - a.gpa)
  .forEach(s => console.log(\`  \${s.name.padEnd(8)} GPA=\${s.gpa}\`));

// ── 3. aggregate – count & avg GPA per course ──
console.log('\n── aggregate: $group by course ──────────────');
const grouped = groupBy(students, 'course', 'gpa');
Object.entries(grouped)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([course, { count, total }]) => {
    console.log(\`  \${course.padEnd(8)} count=\${count}  avgGPA=\${(total/count).toFixed(2)}\`);
  });

// ── 4. sort + limit ──
console.log('\n── Top 3 students by GPA ────────────────────');
[...students]
  .sort((a, b) => b.gpa - a.gpa)
  .slice(0, 3)
  .forEach((s, i) => console.log(\`  #\${i+1} \${s.name} (\${s.course}) — \${s.gpa}\`));

// ── 5. Distinct values ──
console.log('\n── distinct("city") ─────────────────────────');
const cities = [...new Set(students.map(s => s.city))];
console.log('  ' + cities.join(', '));
`
  },
  {
    id: "react",
    name: "React",
    category: "web",
    pistonLanguage: "javascript",
    pistonVersion: "17.0.2",
    extension: "jsx",
    logo: "react",
    template: `import React, { useState, useEffect } from 'react';

function Badge({ text, color = '#6366f1' }) {
  return (
    <span style={{
      background: color + '22',
      color: color,
      border: \`1px solid \${color}55\`,
      borderRadius: 999,
      padding: '2px 12px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
    }}>{text}</span>
  );
}

function StudentCard({ student, rank }) {
  const colors = ['#f59e0b', '#94a3b8', '#cd7c2f'];
  const grades = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', F: '#ef4444' };
  const grade = student.gpa >= 3.7 ? 'A' : student.gpa >= 3.0 ? 'B' : student.gpa >= 2.0 ? 'C' : 'F';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#1e293b', borderRadius: 12, padding: '12px 16px',
      marginBottom: 8, border: '1px solid #334155',
    }}>
      <span style={{ fontSize: 22, minWidth: 32, textAlign: 'center' }}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : \`#\${rank}\`}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>{student.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{student.course} · Year {student.year}</p>
      </div>
      <Badge text={\`GPA \${student.gpa.toFixed(2)}\`} color={grades[grade]} />
      <Badge text={grade} color={grades[grade]} />
    </div>
  );
}

export default function App() {
  const [students] = useState([
    { id: 1, name: 'Alice',  course: 'BCSIT', year: 2, gpa: 3.85 },
    { id: 2, name: 'Bob',    course: 'BIT',   year: 3, gpa: 2.75 },
    { id: 3, name: 'Carol',  course: 'BCSIT', year: 1, gpa: 3.50 },
    { id: 4, name: 'Dave',   course: 'BCA',   year: 4, gpa: 1.80 },
    { id: 5, name: 'Eve',    course: 'BCSIT', year: 2, gpa: 3.95 },
  ]);
  const [filter, setFilter] = useState('All');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const courses = ['All', ...new Set(students.map(s => s.course))];
  const filtered = [...students]
    .filter(s => filter === 'All' || s.course === filter)
    .sort((a, b) => b.gpa - a.gpa);
  const avg = (filtered.reduce((a, s) => a + s.gpa, 0) / filtered.length).toFixed(2);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', minHeight: '100vh', padding: 24, color: '#f1f5f9' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>🎓 Student Leaderboard</h1>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#64748b' }}>
          {time.toLocaleTimeString()} · {filtered.length} students · Avg GPA: {avg}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {courses.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: filter === c ? '1px solid #6366f1' : '1px solid #334155',
              background: filter === c ? '#6366f122' : 'transparent',
              color: filter === c ? '#818cf8' : '#94a3b8',
            }}>{c}</button>
          ))}
        </div>

        {filtered.map((s, i) => <StudentCard key={s.id} student={s} rank={i + 1} />)}
      </div>
    </div>
  );
}
`
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    pistonLanguage: "postgres",
    pistonVersion: "13.3",
    extension: "sql",
    logo: "postgresql",
    template: `-- ── PostgreSQL Advanced Demo ─────────────────────────

-- ── Tables ──
CREATE TABLE departments (
    dept_id   SERIAL PRIMARY KEY,
    name      VARCHAR(50) NOT NULL,
    location  VARCHAR(50)
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    code      VARCHAR(10) UNIQUE NOT NULL,
    title     VARCHAR(100),
    credits   INT DEFAULT 3,
    dept_id   INT REFERENCES departments(dept_id)
);

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    email      VARCHAR(100) UNIQUE,
    dept_id    INT REFERENCES departments(dept_id),
    gpa        NUMERIC(3,2)
);

-- ── Seed data ──
INSERT INTO departments (name, location) VALUES
    ('Computer Science', 'Block A'),
    ('Mathematics',      'Block B'),
    ('Physics',          'Block C');

INSERT INTO courses (code, title, credits, dept_id) VALUES
    ('CS101', 'Intro to Programming',   3, 1),
    ('CS201', 'Data Structures',        3, 1),
    ('CS301', 'Database Systems',       3, 1),
    ('MA101', 'Calculus I',             4, 2),
    ('PH101', 'Mechanics',              3, 3);

INSERT INTO students (name, email, dept_id, gpa) VALUES
    ('Alice',  'alice@college.edu',  1, 3.85),
    ('Bob',    'bob@college.edu',    1, 2.75),
    ('Carol',  'carol@college.edu',  2, 3.50),
    ('Dave',   'dave@college.edu',   3, 1.80),
    ('Eve',    'eve@college.edu',    1, 3.95);

-- ── Query 1: JOIN students with departments ──
SELECT s.name AS Student, d.name AS Department, s.gpa
FROM students s
JOIN departments d ON s.dept_id = d.dept_id
ORDER BY s.gpa DESC;

-- ── Query 2: Aggregate per department ──
SELECT
    d.name       AS Department,
    COUNT(s.*)   AS Students,
    ROUND(AVG(s.gpa)::NUMERIC, 2) AS AvgGPA,
    MAX(s.gpa)   AS TopGPA
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id
GROUP BY d.name
ORDER BY AvgGPA DESC NULLS LAST;

-- ── Query 3: Courses per department ──
SELECT d.name AS Department, COUNT(c.*) AS CourseCount, SUM(c.credits) AS TotalCredits
FROM departments d
LEFT JOIN courses c ON c.dept_id = d.dept_id
GROUP BY d.name
ORDER BY TotalCredits DESC NULLS LAST;

-- ── Query 4: Window function – rank by GPA ──
SELECT
    name,
    gpa,
    RANK() OVER (ORDER BY gpa DESC) AS Rank
FROM students;
`
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "programming",
    pistonLanguage: "ruby",
    pistonVersion: "3.0.1",
    extension: "rb",
    logo: "ruby",
    template: `# ── Ruby Advanced Demo ──────────────────────────────

# ── 1. Module + Mixin ──
module Gradeable
  GRADE_MAP = { 'A' => 90, 'B' => 75, 'C' => 60, 'D' => 50 }.freeze

  def grade
    case gpa
    when 3.7..4.0 then 'A'
    when 3.0...3.7 then 'B'
    when 2.0...3.0 then 'C'
    else 'F'
    end
  end

  def pass?
    gpa >= 2.0
  end
end

class Student
  include Gradeable
  include Comparable

  attr_accessor :name, :age, :gpa, :course

  def initialize(name, age, gpa, course)
    @name, @age, @gpa, @course = name, age, gpa, course
  end

  def <=>(other)
    other.gpa <=> gpa   # descending by GPA
  end

  def to_s
    format("%-10s age=%-3d gpa=%.2f [%s] %s", name, age, gpa, grade, pass? ? "✓" : "✗")
  end
end

students = [
  Student.new("Alice",  20, 3.85, "BCSIT"),
  Student.new("Bob",    22, 2.75, "BIT"),
  Student.new("Carol",  21, 3.50, "BCSIT"),
  Student.new("Dave",   23, 1.80, "BCA"),
  Student.new("Eve",    20, 3.95, "BCSIT"),
]

puts "── Students (sorted by GPA) ─────"
students.sort.each { |s| puts "  #{s}" }

avg = students.sum(&:gpa).fdiv(students.size).round(2)
puts "\n  Average GPA : #{avg}"
puts "  Honours     : #{students.count { |s| s.gpa >= 3.5 }} student(s)"

# ── 2. Enumerable magic ──
puts "\n── Enumerable ───────────────────"
bcsit = students.select { |s| s.course == "BCSIT" }
puts "  BCSIT students: #{bcsit.map(&:name).join(', ')}"

top3 = students.max_by(3, &:gpa)
puts "  Top 3: #{top3.map(&:name).join(' > ')}"

# ── 3. Hash & grouping ──
puts "\n── By Course ────────────────────"
by_course = students.group_by(&:course)
by_course.each do |course, list|
  avg_gpa = list.sum(&:gpa).fdiv(list.size).round(2)
  puts "  #{course.ljust(8)} #{list.map(&:name).join(', ')} (avg #{avg_gpa})"
end

# ── 4. Blocks, Procs, Lambdas ──
puts "\n── Functional ───────────────────"
square = ->(n) { n ** 2 }
evens  = (1..10).select(&:even?)
puts "  Even squares: #{evens.map(&square).inspect}"

# ── 5. Exception handling ──
puts "\n── Exception Handling ───────────"
[10, 0, 5].each_cons(2) do |a, b|
  begin
    puts "  #{a} / #{b} = #{a / b}"
  rescue ZeroDivisionError => e
    puts "  #{a} / #{b} → #{e.message}"
  end
end
`
  },
];
