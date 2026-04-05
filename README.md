# Data-processing-pipeline-using-OOP-in-java

Visual Pipeline built for data processing using object oriented programming concepts in Java. Single pipeline handles filtering, transforming and aggregating the results and displaying the desired result.

## Description

Input Data (number, string, objects & list of data) goes through steps like:
```
Input → Filter → Transform → Output
```

Each step is a object (node)..

## How it works 
1. User gives some input.
2. In the next node(Filter) user chooses conditions among the options(>,<,=,even,odd,palindrome,etc) to filter the input.  You can apply multiple conditions to filter.
3. Next node(Transform) is used to further transform (addition,subtraction,multiplication,division,remainder) the filtered data. 
4. Next node(aggregate) is optional used to combine results .
5. Next node(output) is used to display output.

```
Structure:
Node(abstract) -> super class
|
filter,transform , aggregate -> sub class
```

## OOPS concepts used
-Abstraction → Node (abstract class/interface)\
-Encapsulation → Each node hides internal logic\
-Inheritance → FilterNode, TransformNode, AggregateNode\
-Polymorphism → same process() method behaves differently

## For example 
1.Input: numbers [1,2,3,4,5]\
2.Filter: even numbers [2,4].\
3.Transform: multiply by 10 [20,40].\
4.Aggregate: aggregate it [60].\
5.Output: display


## Applications
1. Student Marks Processing
```
Input : [45, 78, 32, 90, 60]

Pipeline:
Filter → marks > 50 (pass students)
Transform → add grace marks (+5)
Aggregate → average marks

Output : Average of passed students
```
2. E-commerce Orders
```
Input:Order objects (price, category)

Pipeline:
Filter → price > 1000
Transform → apply discount (10%)
Aggregate → total revenue

Output: Total discounted revenue 
```

3. Text Processing (Logs / Messages)
```
Input:["error", "info", "error", "warning"]

Pipeline:
Filter → only "error"
Transform → uppercase
Aggregate → count

Output:ERROR COUNT = 2
```
And many more practical real world problems could be solved.

## Files 
1) UI codes
2) OOP logic codes

## File structure
project/ \
├── backend/ \
│   ├── Main.java                        ← default package, entry point\
│   └── src/ \
│       ├── server/ \
│       │   ├── PipelineHandler.java     ← handles HTTP requests \
│       │   └── CORSHandler.java         ← allows frontend to talk to backend \
│       ├── pipeline/ \
│       │   └── Pipeline.java            ← chains nodes together \
│       ├── node/ \
│       │   ├── Node.java                ← abstract base \
│       │   ├── FilterNode.java \
│       │   ├── TransformNode.java \
│       │   ├── AggregateNode.java \
│       │   └── OutputNode.java \
│       └── data/ \ 
│           ├── DataItem.java            ← abstract base \
│           ├── NumberItem.java (not used since csv is considered object) \
│           ├── StringItem.java (not used since csv is considered object) \ 
│           └── ObjectItem.java \
└── frontend/ \ 
    ├── index.html \
    ├── style.css \
    ├── app.js \
    └── csvParser.js \



## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
