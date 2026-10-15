import { D, P, cells, compare, flow, lanes, layers, seq } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

export const files: ConceptDef[] = [
  {
    t: "Why files: memory versus disk",
    lv: 1,
    s: `Variables live in memory (RAM) and disappear when the program ends; files live on disk and survive. A program reads a file into memory, works on the data there and writes the results back. Read, write and append are the three basic actions.`,
    r: `Datasets, trained weights, logs and metrics are all files. The load → process → save loop is the backbone of every ML pipeline.`,
    i: `Where does a variable live, and what happens to it when the script ends?`,
    c: py`
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Learn Python today!\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read())`,
    o: `Learn Python today!`,
    v: flow("RAM is forgotten when the program ends; the file on disk is still there tomorrow.", "row",
      ["Your program|data in RAM — lost on exit|w", "notes.txt|saved on disk|g", "Next run|opens and reads it back|g"],
      [[0, 1, "open(..., 'w') + write"], [1, 2, "open(..., 'r') + read"]],
      undefined,
      ["Writing copies data from memory to a file on disk.", "A later run — even tomorrow — reads the file back into memory."]),
  },
  {
    t: "File paths: relative and absolute",
    lv: 1,
    s: `A path says where a file lives. An absolute path starts at the root of the drive; a relative path starts at the current working directory — which is not always the folder of your script. {{pathlib.Path}} builds and inspects both safely across operating systems.`,
    r: `"File not found" on a teammate's machine is nearly always a relative path resolved against a different working directory. Build paths from the script's own location instead.`,
    i: `Relative to what? What does {{Path(__file__).resolve().parent}} give you?`,
    c: py`
from pathlib import Path

print(Path.cwd())
print(Path("data/students.csv"))
print(Path(__file__).resolve().parent)`,
    o: `/home/user/my_project\ndata/students.csv\n/home/user/my_project`,
    v: layers("A relative path is measured from the current working directory.", [
      "my_project/|the current working directory — where relative paths start|i",
      "main.py|your script|g",
      "notes.txt|relative path: notes.txt|g",
      "data/students.csv|relative path: data/students.csv|g",
      "output/report.txt|relative path: output/report.txt|g",
    ], "relative to the folder above"),
  },
  {
    t: "File modes: r, w, a, x",
    lv: 1,
    s: `The mode in {{open(path, mode)}} decides what you may do: {{r}} read, {{w}} write (which erases existing content!), {{a}} append, {{x}} create-only (fails if the file already exists). Add {{b}} for binary and {{+}} for read and write.`,
    r: `Opening a precious results file with {{w}} by mistake empties it instantly. Use {{a}} for logs, and {{x}} when overwriting would be a bug.`,
    i: `Which mode adds a log line without losing the old ones?`,
    c: py`
with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Monday\n")
with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("Tuesday\n")
with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Wednesday\n")
with open("diary.txt", encoding="utf-8") as f:
    print(f.read())`,
    o: `Wednesday`,
    v: cells("w erases what was there; a keeps it and adds to the end.", [P("diary.txt", [])], [
      ["A new, empty file."],
      ["mode 'w' writes 'Monday'.", [[0, 0, 0]], [P("diary.txt", ["Monday"])]],
      ["mode 'a' appends: Monday is kept, Tuesday goes after it.", [[0, 1, 1]], [P("diary.txt", ["Monday", "Tuesday"])]],
      ["mode 'w' again TRUNCATES the file first — Monday and Tuesday are gone.", [[0, 0, 0]], [P("diary.txt", ["Wednesday"])]],
    ]),
  },
  {
    t: "Reading files",
    lv: 1,
    s: `{{read()}} returns the whole file as one string, {{readline()}} the next line, {{readlines()}} a list of lines, and looping {{for line in file}} streams one line at a time — best for big files. Lines keep their newline until you {{strip()}} them. After reading, the file pointer sits at the end; {{seek(0)}} rewinds it.`,
    r: `Large datasets and logs don't fit in memory, so iterating line by line is the default streaming approach.`,
    i: `Why is {{for line in file}} better than {{readlines()}} for a 10 GB file?`,
    c: py`
# orders.txt:  Tea: 2 / Coffee: 1 / Sandwich: 3
with open("orders.txt", encoding="utf-8") as file:
    first = file.readline()
    rest = file.readlines()
print(repr(first))
print(rest)
with open("orders.txt", encoding="utf-8") as file:
    for line in file:
        print(line.strip())`,
    o: `'Tea: 2\\n'\n['Coffee: 1\\n', 'Sandwich: 3\\n']\nTea: 2\nCoffee: 1\nSandwich: 3`,
    v: cells("The file pointer moves forward as you read; a for loop reads one line at a time.", [P("orders.txt", ["Tea: 2↵", "Coffee: 1↵", "Sandwich: 3↵"])], [
      ["A file of three lines. ↵ marks the newline that ends each line."],
      ["readline() returns the first line only; the pointer moves to the start of line 2.", [[0, 0, 0]]],
      ["readlines() returns every remaining line as a list.", [[0, 1, 2]]],
      ["for line in file reads ONE line at a time — memory use stays tiny even for huge files.", [[0, 0, 0]]],
      ["Each line.strip() removes the newline before printing.", [[0, 1, 1]]],
      ["…until the file is exhausted.", [[0, 2, 2]]],
    ]),
  },
  {
    t: "Writing and appending",
    lv: 1,
    s: `{{write(text)}} writes a string — it does not add a newline and doesn't accept numbers, so convert with {{str()}} or an f-string. {{writelines()}} writes a list of strings. Use {{w}} for a fresh file and {{a}} to add to the end.`,
    r: `Logging per-epoch metrics one line at a time in append mode means a crash still leaves everything written so far.`,
    i: `Why is there no newline after {{write()}}?`,
    c: py`
items = ["Bread", "Milk", "Eggs"]
with open("receipt.txt", "w", encoding="utf-8") as f:
    for item in items:
        f.write(item + "\n")
price = 12.50
with open("receipt.txt", "a", encoding="utf-8") as f:
    f.write(f"Total: {price:.2f}\n")
print(open("receipt.txt", encoding="utf-8").read())`,
    o: `Bread\nMilk\nEggs\nTotal: 12.50`,
    v: cells("write() adds exactly what you give it — you supply the newline.", [P("receipt.txt", [])], [
      ["Mode 'w' creates an empty receipt.txt."],
      ["write('Bread\\n')", [[0, 0, 0]], [P("receipt.txt", ["Bread↵"])]],
      ["write('Milk\\n')", [[0, 1, 1]], [P("receipt.txt", ["Bread↵", "Milk↵"])]],
      ["write('Eggs\\n')", [[0, 2, 2]], [P("receipt.txt", ["Bread↵", "Milk↵", "Eggs↵"])]],
      ["Mode 'a' reopens the file and adds a formatted line at the end — numbers need an f-string or str().", [[0, 3, 3]], [P("receipt.txt", ["Bread↵", "Milk↵", "Eggs↵", "Total: 12.50↵"])]],
    ]),
  },
  {
    t: "Context managers: with open(...)",
    lv: 1,
    s: `{{with open(...) as f:}} opens the file, runs the block and always closes it — even when an error is raised. Closing flushes buffered writes and frees the file handle. Manual {{open()}} and {{close()}} is easy to get wrong.`,
    r: `Unclosed files in a long training script leak handles and can leave half-written checkpoints.`,
    i: `What guarantees the file is closed? What is a context manager?`,
    c: py`
# Manual: easy to forget the close
file = open("log.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# Recommended: closes automatically, even on errors
with open("log.txt", "r", encoding="utf-8") as file:
    content = file.read()
print(file.closed)`,
    o: `True`,
    v: seq("with guarantees cleanup — on success and on error.", ["Your code", "with open()", "File on disk"], [
      [0, 1, "with open(...) as f:"],
      [1, 2, "open the file"],
      [2, 0, "file object f", "", "r"],
      [0, 2, "f.read() / f.write()", "Your work happens inside the block."],
      [0, 1, "leave the block (or raise an error)", "Either way, Python calls the cleanup for you."],
      [1, 2, "close the file", "Buffers are flushed and the handle is released."],
    ]),
  },
  {
    t: "pathlib for paths",
    lv: 2,
    s: `{{Path}} objects join with {{/}} and have methods like {{exists()}}, {{mkdir(parents=True, exist_ok=True)}}, {{read_text()}}, {{write_text()}} and {{glob("*.txt")}}, plus properties such as {{name}} and {{suffix}}. They work the same on Windows, macOS and Linux.`,
    r: `Organising experiments into folders like {{runs/exp1/metrics.json}} is a few {{Path}} operations.`,
    i: `Why prefer {{pathlib}} over joining path strings by hand?`,
    c: py`
from pathlib import Path

folder = Path("reports")
folder.mkdir(parents=True, exist_ok=True)
report = folder / "daily.txt"
report.write_text("Sales: 25\n", encoding="utf-8")
print(report.exists(), report.name, report.suffix)
print(report.read_text(encoding="utf-8"))`,
    o: `True daily.txt .txt\nSales: 25`,
    v: flow("A Path is an object: build it, create folders, write and read — no string juggling.", "row",
      ["Path('reports')|a folder object|i", "mkdir|creates it if missing|w", "folder / 'daily.txt'|the file path|i", "write_text|saves to disk|g", "read_text|loads it back|g"],
      [[0, 1], [1, 2, "join with /"], [2, 3], [3, 4]],
    ),
  },
  {
    t: "Handling file errors with try / except",
    lv: 2,
    s: `Catch the specific errors you expect — {{FileNotFoundError}}, {{PermissionError}}, {{UnicodeDecodeError}} — and handle each one sensibly. A bare {{except:}} hides real bugs. {{else}} runs when nothing failed, and {{finally}} always runs.`,
    r: `A pipeline that processes 10,000 files shouldn't die on one missing file: catch it, log it, continue — but never silently.`,
    i: `Why is {{except Exception: pass}} dangerous?`,
    c: py`
from pathlib import Path

path = Path("customers.txt")
try:
    text = path.read_text(encoding="utf-8")
except FileNotFoundError:
    print("File missing. Check the path.")
except PermissionError:
    print("No permission to read this file.")
else:
    print("Read", len(text), "characters")
finally:
    print("done")`,
    o: `File missing. Check the path.\ndone`,
    v: flow("try → matching except → finally. else runs only when nothing went wrong.", "row",
      ["try|read the file|i", "except FileNotFoundError|handle the missing file|b", "else|no error happened|g", "finally|always runs|w"],
      [[0, 1, "file missing"], [0, 2, "no error"], [1, 3, "then"], [2, 3, "then"]],
      [0, 2],
      ["The file doesn't exist, so read_text raises FileNotFoundError.", "The matching except block handles it — and finally still runs afterwards."]),
  },
  {
    t: "Text encoding: UTF-8",
    lv: 2,
    s: `Files store bytes, not letters. An encoding maps characters to bytes ({{encode}}) and back ({{decode}}). UTF-8 handles every language and emoji; always pass {{encoding="utf-8"}} for text files so your code behaves the same on every operating system. The wrong encoding raises {{UnicodeDecodeError}} or garbles the text.`,
    r: `Multilingual NLP datasets are where a wrong encoding corrupts text silently — and garbage in is garbage out for your model.`,
    i: `What is the difference between {{str}} and {{bytes}}?`,
    c: py`
message = "Labas"
data = message.encode("utf-8")
print(data)
print(list(data))
print(data.decode("utf-8"))
print("ą".encode("utf-8"))`,
    o: `b'Labas'\n[76, 97, 98, 97, 115]\nLabas\nb'\\xc4\\x85'`,
    v: flow("encode turns text into bytes; decode turns the same bytes back into text.", "row",
      ["Text|'Labas'|i", "UTF-8 bytes|4c 61 62 61 73|w", "Text again|'Labas'|g"],
      [[0, 1, "encode('utf-8')"], [1, 2, "decode('utf-8')"]],
      undefined,
      ["Each character becomes one or more bytes. Plain letters take one; 'ą' takes two (c4 85).", "Decoding with the SAME encoding restores the text. A different encoding would garble it."]),
  },
  {
    t: "CSV files",
    lv: 2,
    s: `CSV is a plain-text table. Use the {{csv}} module rather than {{line.split(",")}}, so quoted commas and newlines are handled. {{csv.DictReader}} gives each row as a dict keyed by the header; every value arrives as a string, so convert with {{int()}} or {{float()}}. Open with {{newline=""}}.`,
    r: `Each row is a training example and each column a feature or label — the way most ML datasets arrive, before pandas takes over.`,
    i: `Why do CSV numbers come back as strings?`,
    c: py`
import csv

rows = [{"name": "Asha", "hours": 5, "passed": "yes"},
        {"name": "Ravi", "hours": 2, "passed": "no"}]
with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "hours", "passed"])
    writer.writeheader()
    writer.writerows(rows)

with open("students.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["hours"]) * 2, row["passed"])`,
    o: `Asha 10 yes\nRavi 4 no`,
    v: cells("DictReader turns each text line into a dictionary using the header as keys.", [P("students.csv", ["name,hours,passed", "Asha,5,yes", "Ravi,2,no"])], [
      ["A CSV file is just lines of text. The first line is the header."],
      ["DictReader reads line 2 and uses the header names as keys.", [[0, 1, 1]], [P("students.csv", ["name,hours,passed", "Asha,5,yes", "Ravi,2,no"]), D("row", ["name|'Asha'", "hours|'5'", "passed|'yes'"])]],
      ["Look closely: hours is '5' — a STRING. Convert it with int(row['hours']) before doing maths.", [[1, 1, 1]]],
    ]),
  },
  {
    t: "JSON files",
    lv: 2,
    s: `JSON stores nested data as text: objects become dicts, arrays become lists. {{json.dump(data, file)}} and {{json.load(file)}} work on files; {{dumps}} and {{loads}} work on strings. Not everything is serialisable (sets, datetimes), and secrets must never go into a JSON file you commit.`,
    r: `Model configs, evaluation metrics and API responses are JSON. Saving a {{metrics.json}} next to every run makes experiments comparable.`,
    i: `What is the difference between {{json.dump}} and {{json.dumps}}?`,
    c: py`
import json

config = {"model": "student_predictor", "epochs": 20, "features": ["hours", "attendance"]}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2)

with open("config.json", encoding="utf-8") as f:
    restored = json.load(f)
print(restored["epochs"], restored["features"][0])
print(json.dumps({"ok": True, "none": None}))`,
    o: `20 hours\n{"ok": true, "none": null}`,
    v: compare("JSON types map one-to-one onto Python types.", ["Python"], [
      ["{ } object", "dict"],
      ["[ ] array", "list"],
      ["string", "str"],
      ["number", "int / float"],
      ["true / false", "True / False"],
      ["null", "None"],
    ]),
  },
  {
    t: "Binary files and chunked reading",
    lv: 2,
    s: `Images, audio, PDFs and model weights are bytes, not text: open them with {{rb}} / {{wb}} and no encoding. Read big files in fixed-size chunks so memory stays flat. {{shutil.copy2}} copies a whole file and keeps its metadata.`,
    r: `Loading images for a vision model means reading binary files, and checkpoints are binary too. Chunking avoids loading gigabytes at once.`,
    i: `How would you copy a 4 GB file without loading it all into memory?`,
    c: py`
with open("photo.jpg", "rb") as source, open("photo_copy.jpg", "wb") as target:
    while True:
        chunk = source.read(64 * 1024)
        if not chunk:
            break
        target.write(chunk)`,
    v: lanes("Chunking keeps memory use constant; reading it all at once needs RAM the size of the file.", 8,
      { "Read all at once": [[0, 8, "whole 4 GB file held in RAM", "b"]], "Chunked (64 KiB)": [[0, 1, "chunk", "g"], [1, 1, "chunk", "g"], [2, 1, "chunk", "g"], [3, 1, "chunk", "g"], [4, 1, "chunk", "g"], [5, 1, "chunk", "g"], [6, 1, "chunk", "g"], [7, 1, "chunk", "g"]] },
      [[0, "One approach loads everything; the other reads a small piece, writes it, and moves on."], [4, "Only one 64 KiB chunk is ever in memory — so the file can be any size."]]),
  },
  {
    t: "Moving, copying and safe replacement",
    lv: 3,
    s: `Create folders with {{mkdir(parents=True, exist_ok=True)}}, move and copy with {{shutil}}, and delete with {{unlink()}} only when you are certain. To replace an important file safely, write a temporary file first and swap it in with {{os.replace}}: a crash then leaves the old file intact.`,
    r: `Overwriting a checkpoint in place and crashing mid-write destroys both the old and the new model. Write-then-rename protects you.`,
    i: `Why write to a temporary file and then rename it?`,
    c: py`
import os, tempfile
from pathlib import Path

path = Path("model_meta.json")
with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent,
                                 delete=False, suffix=".tmp") as tmp:
    tmp.write('{"version": 2}')
os.replace(tmp.name, path)
print(path.read_text())`,
    o: `{"version": 2}`,
    v: flow("Write the new content next to the old file, then swap — the real file is never half-written.", "row",
      ["Write temp file|model_meta.json.tmp|i", "All bytes written|safe to swap|w", "os.replace|atomic rename|g", "model_meta.json|old or new — never half|g"],
      [[0, 1, "finish writing"], [1, 2, "swap"], [2, 3, "done"]],
    ),
  },
  {
    t: "File safety: validation and pickle",
    lv: 3,
    s: `Treat file contents and paths from outside as untrusted: validate formats, never build paths from raw user input, and never load unknown pickle or joblib files — deserialising them can execute arbitrary code. Prefer JSON, CSV or other data-only formats for sharing.`,
    r: `Downloading a "pretrained model" pickle from an unknown source is one of the easiest ways to be compromised in ML work.`,
    i: `Why is {{pickle.load}} on an untrusted file unsafe?`,
    c: py`
from pathlib import Path

BASE = Path("uploads").resolve()
name = "../secrets.txt"              # untrusted input
target = (BASE / name).resolve()
print(target.is_relative_to(BASE))   # False -> reject it`,
    o: `False`,
    v: flow("Resolve the real path first, then check it stays inside the folder you allow.", "row",
      ["Untrusted name|'../secrets.txt'|b", "resolve()|the real absolute path|w", "Inside uploads/?|is_relative_to(BASE)|i", "Reject|False → stop|g"],
      [[0, 1, "join with BASE"], [1, 2, "check"], [2, 3, "False"]],
    ),
  },
];
