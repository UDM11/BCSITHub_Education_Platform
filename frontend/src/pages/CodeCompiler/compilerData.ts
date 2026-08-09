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
<html>
<head>
  <title>Hello, World!</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1 class="title">Hello World!</h1>
  <p id="currentTime"></p>
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
    template: `def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Try list comprehensions
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(f"Squares of {numbers} are {squared}")`
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "programming",
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    extension: "js",
    logo: "javascript",
    template: `// JavaScript ES6 Environment
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));

const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(x => x ** 2);
console.log("Squares:", squared);`
  },
  {
    id: "java",
    name: "Java",
    category: "programming",
    pistonLanguage: "java",
    pistonVersion: "15.0.2",
    extension: "java",
    logo: "java",
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Simple loop
        for (int i = 1; i <= 5; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "database",
    pistonLanguage: "mysql",
    pistonVersion: "8.0.25",
    extension: "sql",
    logo: "mysql",
    template: `-- Create table and insert sample rows
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    course VARCHAR(50)
);

INSERT INTO students (name, course) VALUES 
('Alice', 'BCSIT'),
('Bob', 'BSc CSIT'),
('Charlie', 'BCSIT');

SELECT * FROM students;`
  },
  {
    id: "c",
    name: "C",
    category: "programming",
    pistonLanguage: "c",
    pistonVersion: "10.2.0",
    extension: "c",
    logo: "c",
    template: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    int a = 5, b = 10;
    printf("Sum of %d and %d is %d\\n", a, b, a + b);
    return 0;
}`
  },
  {
    id: "cpp",
    name: "C++",
    category: "programming",
    pistonLanguage: "cpp",
    pistonVersion: "10.2.0",
    extension: "cpp",
    logo: "cpp",
    template: `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    return 0;
}`
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
echo "Hello, World!\\n";

$numbers = [1, 2, 3, 4, 5];
foreach ($numbers as $num) {
    echo "Number: " . ($num * 2) . "\\n";
}`
  },
  {
    id: "csharp",
    name: "C#",
    category: "programming",
    pistonLanguage: "csharp",
    pistonVersion: "6.12.0",
    extension: "cs",
    logo: "csharp",
    template: `using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Hello, World!");
        
        int score = 95;
        Console.WriteLine($"Student Score: {score}%");
    }
}`
  },
  {
    id: "assembly",
    name: "Assembly",
    category: "programming",
    pistonLanguage: "nasm",
    pistonVersion: "2.15.5",
    extension: "asm",
    logo: "assembly",
    template: `section .data
    msg db 'Hello, World!', 0xa
    len equ $ - msg

section .text
    global _start

_start:
    mov edx, len
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

    mov ebx, 0
    mov eax, 1
    int 0x80`
  },
  {
    id: "lua",
    name: "Lua",
    category: "programming",
    pistonLanguage: "lua",
    pistonVersion: "5.4.2",
    extension: "lua",
    logo: "lua",
    template: `-- Lua script demonstration
print("Hello, World!")

local function fact(n)
    if n == 0 then return 1 end
    return n * fact(n - 1)
end

print("Factorial of 5 is: " .. fact(5))`
  },
  {
    id: "plsql",
    name: "PL/SQL",
    category: "database",
    pistonLanguage: "oracle",
    pistonVersion: "19.3.0",
    extension: "sql",
    logo: "plsql",
    template: `DECLARE
    message VARCHAR2(50) := 'Hello, PL/SQL!';
BEGIN
    dbms_output.put_line(message);
END;`
  },
  {
    id: "nodejs",
    name: "NodeJS",
    category: "programming",
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    extension: "js",
    logo: "nodejs",
    template: `const os = require('os');

console.log("Hello from NodeJS Environment!");
console.log("Platform:", os.platform());
console.log("Total Memory (MB):", Math.round(os.totalmem() / (1024 * 1024)));`
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "database",
    pistonLanguage: "javascript",
    pistonVersion: "4.4.6",
    extension: "js",
    logo: "mongodb",
    template: `// MongoDB queries template
db.students.insertMany([
  { name: "Alice", grade: "A" },
  { name: "Bob", grade: "B" }
]);

db.students.find().forEach(printjson);`
  },
  {
    id: "groovy",
    name: "Groovy",
    category: "programming",
    pistonLanguage: "groovy",
    pistonVersion: "3.0.7",
    extension: "groovy",
    logo: "groovy",
    template: `println "Hello, Groovy!"

def list = [1, 2, 3, 4]
println list.collect { it * 10 }`
  },
  {
    id: "react",
    name: "React",
    category: "web",
    pistonLanguage: "javascript",
    pistonVersion: "17.0.2",
    extension: "jsx",
    logo: "react",
    template: `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Hello from React!</h1>
      <p>This is a sandboxed JSX template.</p>
    </div>
  );
}`
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    pistonLanguage: "postgres",
    pistonVersion: "13.3",
    extension: "sql",
    logo: "postgresql",
    template: `-- PostgreSQL demo code
CREATE TABLE courses (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    credits INT
);

INSERT INTO courses VALUES ('CMP 271', 'Database Systems', 3);
SELECT * FROM courses;`
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "programming",
    pistonLanguage: "ruby",
    pistonVersion: "3.0.1",
    extension: "rb",
    logo: "ruby",
    template: `# Ruby Script
puts "Hello, World!"

class Book
  attr_accessor :title, :author
  def initialize(title, author)
    @title = title
    @author = author
  end
end

book = Book.new("Learn Ruby", "Yukihiro Matsumoto")
puts "Book: #{book.title} by #{book.author}"`
  }
];
