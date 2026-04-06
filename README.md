# Data Processing Pipeline — OOP in Java

A visual data processing pipeline that demonstrates core Object-Oriented Programming concepts — **Abstraction, Encapsulation, Inheritance, and Polymorphism** — using Java as the backend engine and HTML/CSS/JS as the frontend interface.

Upload any CSV file, build a pipeline of processing nodes, and watch your data transform step by step.

---

## How it works

Input data flows through a chain of nodes, each doing one job:

```
CSV Input → Filter → Transform → Aggregate → Output
```

1. **Upload** a CSV file (student records, products, orders, etc.)
2. **Filter** — keep only rows that match your condition (`>`, `<`, `==`, `contains`, etc.)
3. **Transform** — modify a field in every row (`add`, `multiply`, `uppercase`, `concat`, etc.)
4. **Aggregate** *(optional)* — reduce all rows to a single value (`sum`, `avg`, `max`, `min`, `count`)
5. **Output** — display the final result

Each step is an **object (node)**. The pipeline chains them together and passes data through.

---

## Example Pipelines

**1. Student Marks Processing**
```
Input    : name, marks, section (CSV)
Filter   → marks > 50         (keep passing students)
Transform → marks + 5         (add grace marks)
Aggregate → avg               (average of passing students)
Output   : Average = 74.3
```

**2. E-commerce Orders**
```
Input    : product, price, category (CSV)
Filter   → price > 1000
Transform → price * 0.9       (apply 10% discount)
Aggregate → sum               (total discounted revenue)
Output   : Total = ₹84,500
```

**3. Text / Log Processing**
```
Input    : ["error", "info", "error", "warning"]
Filter   → type == error
Transform → upper
Aggregate → count
Output   : ERROR COUNT = 2
```

---

## OOP Concepts Used

| Concept | Where |
|---|---|
| **Abstraction** | `Node.java` and `DataItem.java` are abstract — pipeline doesn't know what's inside each node |
| **Encapsulation** | Each node holds its config privately (`field`, `operator`, `value`) with controlled access |
| **Inheritance** | `FilterNode`, `TransformNode`, `AggregateNode`, `OutputNode` all extend `Node` |
| **Polymorphism** | Pipeline calls `process()` on every node without knowing its type |
| **Packages** | Code organized into `node`, `data`, `pipeline`, `server` packages |

```
Node (abstract)
├── FilterNode
├── TransformNode
├── AggregateNode
└── OutputNode

DataItem (abstract)
├── NumberItem
├── StringItem
└── ObjectItem  ← used for CSV rows
```

---

## File Structure

```
project/
├── backend/
│   ├── Main.java                        ← entry point, starts HTTP server
│   └── src/
│       ├── server/
│       │   ├── PipelineHandler.java     ← handles HTTP requests from frontend
│       │   └── CORSHandler.java         ← allows frontend to talk to backend
│       ├── pipeline/
│       │   └── Pipeline.java            ← chains nodes together
│       ├── node/
│       │   ├── Node.java                ← abstract base class
│       │   ├── FilterNode.java
│       │   ├── TransformNode.java
│       │   ├── AggregateNode.java
│       │   └── OutputNode.java
│       └── data/
│           ├── DataItem.java            ← abstract base class
│           ├── NumberItem.java          ← (defined for completeness)
│           ├── StringItem.java          ← (defined for completeness)
│           └── ObjectItem.java          ← used for CSV rows
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js                           ← pipeline builder + API calls
    └── csvParser.js                     ← CSV parsing + type detection
```

---

## Prerequisites

### 1. Java JDK 17 or above

Check if installed:
```bash
java -version
```

If not, download from:
```
https://www.oracle.com/java/technologies/downloads/
```
Download **JDK 21 LTS** → install → restart terminal.

---

### 2. Gradle

**Windows (via Scoop — recommended)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install gradle
```

**Mac (via Homebrew)**
```bash
brew install gradle
```

**Manual (Windows/Linux)**
1. Download binary-only zip from `https://gradle.org/releases/`
2. Extract to `C:\Gradle\gradle-8.x`
3. Add `C:\Gradle\gradle-8.x\bin` to system PATH
4. Restart terminal

Verify:
```bash
gradle --version
```

---

## Running the Project

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Data-processing-pipeline-using-OOP-in-java.git
cd Data-processing-pipeline-using-OOP-in-java
```

### Step 2 — Start the backend

```bash
cd backend
gradle run
```

You should see:
```
Server running on http://localhost:8080
```

Leave this terminal open — the server keeps running until you press `Ctrl+C`.

### Step 3 — Open the frontend

Go to the `frontend/` folder and open `index.html` in your browser.

**Windows:**
```powershell
start frontend\index.html
```

**Mac:**
```bash
open frontend/index.html
```

---

## Sample CSV to Test

Save this as `students.csv` and upload it:

```
name,marks,section
Alice,95,E
Bob,42,A
Charlie,78,E
Diana,61,A
Eve,88,E
Frank,35,A
Grace,91,E
```

---

## Available Operations

### Filter
| Operator | Works on |
|---|---|
| `>` `<` `>=` `<=` `==` | Numbers |
| `contains` `startsWith` `endsWith` `==` | Strings |

### Transform
| Operation | Works on |
|---|---|
| `add` `subtract` `multiply` `divide` `remainder` | Numbers |
| `upper` `lower` `concat` `substring` | Strings |

### Aggregate
`sum` · `avg` · `max` · `min` · `count`

---

## Troubleshooting

**Port 8080 already in use**
```powershell
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

**Gradle not found** — restart terminal after installation and try again.

**CORS error in browser** — make sure `gradle run` is running before opening the frontend.

**CSV not parsing** — ensure first row is the header, values are comma-separated, no empty rows.

---

## Tech Stack

| | |
|---|---|
| Backend | Java, Java HttpServer (built-in) |
| JSON parsing | Google Gson 2.10.1 |
| Build tool | Gradle |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Communication | HTTP REST (JSON) |

---

## Contributing

Pull requests are welcome. For major changes please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)