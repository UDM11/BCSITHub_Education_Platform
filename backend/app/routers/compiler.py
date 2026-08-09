from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import os
import re
import subprocess
import tempfile
import sqlite3
import httpx

router = APIRouter(prefix="/compiler", tags=["compiler"])

class FileModel(BaseModel):
    name: str
    content: str

class ExecuteRequest(BaseModel):
    language: str
    version: str
    files: List[FileModel]
    stdin: Optional[str] = None

@router.post("/run")
async def run_code(req_body: ExecuteRequest):
    lang = req_body.language.lower()
    
    if lang == "mongodb":
        mongodb_mock = """
const db = (() => {
  const collections = {};
  class Collection {
    constructor(name) {
      this.name = name;
      this.data = [];
    }
    insertOne(doc) {
      this.data.push(doc);
      return { acknowledged: true, insertedId: this.data.length };
    }
    insertMany(docs) {
      if (!Array.isArray(docs)) docs = [docs];
      docs.forEach(d => this.insertOne(d));
      return { acknowledged: true, insertedIds: docs.map((_, i) => i) };
    }
    find(query) {
      let results = [...this.data];
      if (query) {
        results = results.filter(item => {
          for (let key in query) {
            if (item[key] !== query[key]) return false;
          }
          return true;
        });
      }
      return {
        toArray: () => results,
        forEach: (fn) => results.forEach(fn),
        limit: (n) => { results = results.slice(0, n); return this; }
      };
    }
  }
  return new Proxy({}, {
    get: (target, prop) => {
      if (!collections[prop]) collections[prop] = new Collection(prop);
      return collections[prop];
    }
  });
})();
const printjson = (obj) => console.log(JSON.stringify(obj, null, 2));

"""
        req_body.language = "javascript"
        if req_body.files:
            req_body.files[0].content = mongodb_mock + req_body.files[0].content
            
    lang = req_body.language.lower()
    code = req_body.files[0].content if req_body.files else ""
    
    # 1. SQL (MySQL, PostgreSQL, SQLite, PL/SQL) Execution
    if lang in ["mysql", "postgresql", "postgres", "sql", "plsql"]:
        try:
            # Execute in an in-memory SQLite database
            conn = sqlite3.connect(":memory:")
            cursor = conn.cursor()
            
            # SQLite does not support some MySQL/PG-specific syntax, so clean it slightly
            # Split statements by semicolon
            statements = [s.strip() for s in code.split(";") if s.strip()]
            
            output_lines = []
            for stmt in statements:
                # Basic comments removal
                stmt_clean = "\n".join([line for line in stmt.split("\n") if not line.strip().startswith("--")])
                if not stmt_clean.strip():
                    continue
                
                # PL/SQL script parsing mock
                if lang == "plsql" or "dbms_output" in stmt_clean.lower():
                    # Parse variables in declare block
                    vars = {}
                    # Match basic variables: varname TYPE := value;
                    for var_name, var_val in re.findall(r'(\w+)\s+\w+(?:\(\d+\))?\s*:=\s*[\'"](.*?)[\'"]', stmt_clean):
                        vars[var_name] = var_val
                    
                    # Match dbms_output.put_line(value)
                    printed = False
                    for print_val in re.findall(r'dbms_output\.put_line\s*\(\s*(.*?)\s*\)', stmt_clean, re.IGNORECASE):
                        print_val = print_val.strip()
                        printed = True
                        if (print_val.startswith("'") and print_val.endswith("'")) or (print_val.startswith('"') and print_val.endswith('"')):
                            output_lines.append(print_val[1:-1])
                        elif print_val in vars:
                            output_lines.append(vars[print_val])
                        else:
                            output_lines.append(print_val)
                    if printed:
                        continue
                
                # Dynamic translation of MySQL-specific constructs to SQLite syntax
                # 1. AUTO_INCREMENT -> AUTOINCREMENT
                stmt_clean = re.sub(r'\bAUTO_INCREMENT\b', 'AUTOINCREMENT', stmt_clean, flags=re.IGNORECASE)
                
                # 2. INT PRIMARY KEY AUTOINCREMENT -> INTEGER PRIMARY KEY AUTOINCREMENT
                stmt_clean = re.sub(r'\bINT\b(\s+PRIMARY\s+KEY\s+AUTOINCREMENT)', r'INTEGER\1', stmt_clean, flags=re.IGNORECASE)
                stmt_clean = re.sub(r'\bINT\b(\s+AUTOINCREMENT\s+PRIMARY\s+KEY)', r'INTEGER\1', stmt_clean, flags=re.IGNORECASE)
                
                # 3. Clean trailing MySQL engines / options like ENGINE=InnoDB etc.
                stmt_clean = re.sub(r'\bENGINE\s*=\s*\w+', '', stmt_clean, flags=re.IGNORECASE)
                
                try:
                    cursor.execute(stmt_clean)
                    # If SELECT query, format rows
                    if stmt_clean.strip().lower().startswith("select"):
                        rows = cursor.fetchall()
                        headers = [desc[0] for desc in cursor.description]
                        
                        # Print header
                        header_line = " | ".join(headers)
                        divider = "-" * len(header_line)
                        output_lines.append(header_line)
                        output_lines.append(divider)
                        
                        for row in rows:
                            output_lines.append(" | ".join(str(val) for val in row))
                    else:
                        conn.commit()
                        affected = conn.total_changes
                        output_lines.append(f"Query OK, statement executed successfully. (Total changes: {affected})")
                except Exception as stmt_err:
                    output_lines.append(f"❌ SQL Error in statement:\n{stmt_clean}\nError: {str(stmt_err)}")
            
            conn.close()
            return {
                "run": {
                    "stdout": "\n".join(output_lines) if output_lines else "SQL execution completed with no output.",
                    "stderr": "",
                    "code": 0
                }
            }
        except Exception as e:
            return {
                "run": {
                    "stdout": "",
                    "stderr": f"Database initialization failed: {str(e)}",
                    "code": 1
                }
            }

    # 2. General Programming Language Execution via Piston API
    PISTON_URL = "https://emkc.org/api/v2/piston/execute"
    payload = {
        "language": req_body.language,
        "version": req_body.version,
        "files": [{"name": f.name, "content": f.content} for f in req_body.files]
    }
    if req_body.stdin:
        payload["stdin"] = req_body.stdin
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(PISTON_URL, json=payload, timeout=8.0)
            data = resp.json() if resp.status_code == 200 else {}
            
            # If the version was not installed (Piston returns error message or not 200), try fallback to version = "*"
            if resp.status_code != 200 or "message" in data:
                payload["version"] = "*"
                resp = await client.post(PISTON_URL, json=payload, timeout=8.0)
                data = resp.json() if resp.status_code == 200 else {}
                
            if resp.status_code == 200 and "run" in data:
                return {
                    "run": {
                        "stdout": data.get("run", {}).get("stdout", ""),
                        "stderr": data.get("run", {}).get("stderr", ""),
                        "code": data.get("run", {}).get("code", 0)
                    }
                }
    except Exception as e:
        print("Piston execution failed, falling back to local runner:", e)

    # 3. Local Subprocess Fallback Execution
    with tempfile.TemporaryDirectory() as tmpdir:
        # Determine files and execution command
        exec_cmd = []
        filename = "main.py"
        
        if lang == "python":
            filename = "main.py"
            exec_cmd = ["python", filename]
        elif lang in ["javascript", "nodejs"]:
            filename = "main.js"
            exec_cmd = ["node", filename]
        elif lang == "php":
            filename = "main.php"
            exec_cmd = ["php", filename]
        elif lang == "ruby":
            filename = "main.rb"
            exec_cmd = ["ruby", filename]
        elif lang == "lua":
            filename = "main.lua"
            exec_cmd = ["lua", filename]
        elif lang == "groovy":
            filename = "main.groovy"
            exec_cmd = ["groovy", filename]
        elif lang in ["c", "cpp"]:
            filename = "main.cpp" if lang == "cpp" else "main.c"
            exec_cmd = [] # will handle compilation separately
        elif lang == "java":
            filename = "Main.java"
            exec_cmd = []
        elif lang == "csharp":
            filename = "Program.cs"
            exec_cmd = []
        else:
            return {
                "run": {
                    "stdout": "",
                    "stderr": f"Language '{lang}' is not supported for local execution sandbox.",
                    "code": 1
                }
            }
            
        filepath = os.path.join(tmpdir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code)
            
        try:
            # 3. Compilation-based Languages (C, C++, Java)
            if lang in ["c", "cpp"]:
                compiler = "g++" if lang == "cpp" else "gcc"
                out_exe = os.path.join(tmpdir, "main.exe" if os.name == "nt" else "main")
                
                # Run compiler
                compile_proc = subprocess.run(
                    [compiler, filename, "-o", out_exe],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if compile_proc.returncode != 0:
                    return {
                        "run": {
                            "stdout": "",
                            "stderr": f"Compilation Error:\n{compile_proc.stderr}",
                            "code": compile_proc.returncode
                        }
                    }
                exec_cmd = [out_exe]
                
            elif lang == "java":
                # Compile Java class Main
                compile_proc = subprocess.run(
                    ["javac", filename],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if compile_proc.returncode != 0:
                    return {
                        "run": {
                            "stdout": "",
                            "stderr": f"Compilation Error:\n{compile_proc.stderr}",
                            "code": compile_proc.returncode
                        }
                    }
                exec_cmd = ["java", "Main"]
                
            elif lang == "csharp":
                # Compile C# file Program.cs
                compiler = "csc"
                if os.name == "nt":
                    net_path = "C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
                    if not os.path.exists(net_path):
                        net_path = "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
                    if os.path.exists(net_path):
                        compiler = net_path
                        
                out_exe = os.path.join(tmpdir, "Program.exe" if os.name == "nt" else "Program")
                compile_proc = subprocess.run(
                    [compiler, filename, f"/out:{out_exe}" if os.name == "nt" else f"-out:{out_exe}"],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if compile_proc.returncode != 0:
                    return {
                        "run": {
                            "stdout": "",
                            "stderr": f"Compilation Error:\n{compile_proc.stderr}",
                            "code": compile_proc.returncode
                        }
                    }
                exec_cmd = [out_exe]

            # Run the compiled executable or script
            run_cmd_args = [exec_cmd[0]] + exec_cmd[1:]
            run_proc = subprocess.run(
                run_cmd_args,
                cwd=tmpdir,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            return {
                "run": {
                    "stdout": run_proc.stdout,
                    "stderr": run_proc.stderr,
                    "code": run_proc.returncode
                }
            }
            
        except FileNotFoundError as fnf:
            # Command compiler executable not found (e.g. g++ or node or javac not installed)
            missing_tool = fnf.filename if fnf.filename else "the required compiler/interpreter"
            
            # Fallback for Windows if 'python' is actually mapped as 'py'
            if lang == "python" and missing_tool == "python":
                try:
                    run_proc = subprocess.run(
                        ["py", filename],
                        cwd=tmpdir,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    return {
                        "run": {
                            "stdout": run_proc.stdout,
                            "stderr": run_proc.stderr,
                            "code": run_proc.returncode
                        }
                    }
                except Exception:
                    pass
                    
            return {
                "run": {
                    "stdout": "",
                    "stderr": f"❌ Environment Error: '{missing_tool}' is not installed or not in system PATH.\nTo run {lang.capitalize()} code locally, please install the appropriate interpreter/compiler.",
                    "code": 127
                }
            }
        except subprocess.TimeoutExpired:
            return {
                "run": {
                    "stdout": "",
                    "stderr": "❌ Execution Error: Process timed out (limit: 5 seconds). Is there an infinite loop?",
                    "code": 124
                }
            }
        except Exception as err:
            return {
                "run": {
                    "stdout": "",
                    "stderr": f"❌ Runtime Error: {str(err)}",
                    "code": 1
                }
            }
