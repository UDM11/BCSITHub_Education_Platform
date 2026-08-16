import re

with open('frontend/src/pages/CodeCompiler/compilerData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Python \n in strings
content = content.replace('print(f"\\n── Statistics ──────────────────")', 'print(f"\\\\n── Statistics ──────────────────")')
content = content.replace('print(f"\\n── Grade Leaderboard ───────────")', 'print(f"\\\\n── Grade Leaderboard ───────────")')
content = content.replace('print(f"\\n── Safe Divide ─────────────────")', 'print(f"\\\\n── Safe Divide ─────────────────")')
content = content.replace('print(f"\\n  Timestamp:', 'print(f"\\\\n  Timestamp:')

# Fix Java record -> class
java_record = '''    record Student(String name, int age, double gpa) {
        String grade() {
            if (gpa >= 3.7) return "A";
            if (gpa >= 3.0) return "B";
            if (gpa >= 2.0) return "C";
            return "F";
        }
        @Override public String toString() {
            return String.format("%-12s age=%-3d gpa=%.2f [%s]", name, age, gpa, grade());
        }
    }'''

java_class = '''    static class Student {
        public String name; public int age; public double gpa;
        public Student(String name, int age, double gpa) { this.name = name; this.age = age; this.gpa = gpa; }
        public double gpa() { return gpa; }
        public String grade() {
            if (gpa >= 3.7) return "A";
            if (gpa >= 3.0) return "B";
            if (gpa >= 2.0) return "C";
            return "F";
        }
        @Override public String toString() {
            return String.format("%-12s age=%-3d gpa=%.2f [%s]", name, age, gpa, grade());
        }
    }'''
content = content.replace(java_record, java_class)

# Fix PHP protected property
php_bad = '''abstract class Vehicle implements Describable {
    public function __construct(
        protected string $brand,
        protected int    $year,
        protected float  $price
    ) {}
    abstract public function type(): string;
    public function describe(): string {
        return sprintf("%s %s (%d) — $%.2f", $this->type(), $this->brand, $this->year, $this->price);
    }
}'''
php_good = '''abstract class Vehicle implements Describable {
    public function __construct(
        protected string $brand,
        protected int    $year,
        protected float  $price
    ) {}
    abstract public function type(): string;
    public function getPrice(): float { return $this->price; }
    public function describe(): string {
        return sprintf("%s %s (%d) - $%.2f", $this->type(), $this->brand, $this->year, $this->price);
    }
}'''
content = content.replace(php_bad, php_good)
content = content.replace('usort($fleet, fn($a, $b) => $b->price <=> $a->price);', 'usort($fleet, fn($a, $b) => $b->getPrice() <=> $a->getPrice());')
content = content.replace('array_slice($fleet, 0, 2);', '')

# Fix C# pistonVersion
content = content.replace('id: "csharp",\n    name: "C#",\n    category: "programming",\n    pistonLanguage: "csharp",\n    pistonVersion: "6.12.0",', 'id: "csharp",\n    name: "C#",\n    category: "programming",\n    pistonLanguage: "csharp",\n    pistonVersion: "5.0.201",')

# Fix NodeJS & MongoDB & generic `\n` in JS console.log
content = content.replace('console.log(\'\\n── ', 'console.log(\'\\\\n── ')
content = content.replace('console.log("\\n── ', 'console.log("\\\\n── ')
content = content.replace('System.out.println("\\n── ', 'System.out.println("\\\\n── ')
content = content.replace('System.out.printf("\\n  Average', 'System.out.printf("\\\\n  Average')
content = content.replace('echo "\\n── ', 'echo "\\\\n── ')
content = content.replace('puts "\\n── ', 'puts "\\\\n── ')
content = content.replace('puts "\\n  Average', 'puts "\\\\n  Average')
content = content.replace('cout << "\\n── ', 'cout << "\\\\n── ')

# Fix React template
react_bad = '''function Badge({ text, color = '#6366f1' }) {
  return (
    <span style={{
      background: color + '22',
      color: color,
      border: `1px solid ${color}55`,
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
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>{student.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{student.course} · Year {student.year}</p>
      </div>
      <Badge text={`GPA ${student.gpa.toFixed(2)}`} color={grades[grade]} />
      <Badge text={grade} color={grades[grade]} />
    </div>
  );
}

export default function App() {'''

react_good = '''function Badge({ text, color }) {
  color = color || '#6366f1';
  return (
    <span style={{
      background: color + '22',
      color: color,
      border: '1px solid ' + color + '55',
      borderRadius: 999,
      padding: '2px 12px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
    }}>{text}</span>
  );
}

function StudentCard({ student, rank }) {
  const medals = ['🥇', '🥈', '🥉'];
  const gradeColors = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', F: '#ef4444' };
  const grade = student.gpa >= 3.7 ? 'A' : student.gpa >= 3.0 ? 'B' : student.gpa >= 2.0 ? 'C' : 'F';
  const rankLabel = rank <= 3 ? medals[rank - 1] : '#' + rank;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#1e293b', borderRadius: 12, padding: '12px 16px',
      marginBottom: 8, border: '1px solid #334155',
    }}>
      <span style={{ fontSize: 22, minWidth: 32, textAlign: 'center' }}>{rankLabel}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>{student.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{student.course} · Year {student.year}</p>
      </div>
      <Badge text={'GPA ' + student.gpa.toFixed(2)} color={gradeColors[grade]} />
      <Badge text={grade} color={gradeColors[grade]} />
    </div>
  );
}

function App() {'''
content = content.replace(react_bad, react_good)

with open('frontend/src/pages/CodeCompiler/compilerData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done patching')
