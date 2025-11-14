# TOON.js  
**A minimal, zero-dependency parser for the TOON data description format.**

TOON.js implements the uniform-block subset of the [TOON format](https://github.com/toon-format/spec), a compact, LLM-friendly data notation designed to reduce token usage and improve structural clarity when exchanging structured data with language models or generative systems.

This library focuses on the “tabular” form of TOON, which is the most effective and unambiguous subset for computational art, creative coding, and high-performance text→structure parsing in browser environments (including p5.js).

---

## Features

- **Zero dependencies**, pure JavaScript.
- **Uniform-block parser**:
  ```text
  points[3]{x,y,size}:
    120,150,10
    240,80,20
    380,200,16

Automatic scalar coercion (Number, true/false, null).
Graceful block merging (repeated identifiers append).
Works in browser, p5.js, Node.js, and AMD environments.
Lightweight (~2 KB).

##Why TOON?

TOON (Token-Oriented Object Notation) is designed for scenarios where:
Token efficiency matters (LLMs, embeddings, prompts).
Data structure must be explicit but concise.

Tabular datasets (points, parameters, events, particles, walkers) need to be fed into computational systems.
Human readability > JSON clutter, especially for repeated object keys.
TOON.js intentionally implements the subset most relevant to creative coding and real-time systems.

##Installation
Browser (vanilla JS or p5.js)
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js"></script>
<script src="toon.js"></script>



##Usage
Example TOON file (assets/points.toon)
points[3]{x,y,size,shade}:
  100,150,12,0.2
  220,80,20,0.8
  340,200,15,0.5

##p5.js Example
let rawLines;
let data;

function preload() {
  rawLines = loadStrings("assets/points.toon");
}

function setup() {
  createCanvas(600, 400);
  data = Toon.parseFromLines(rawLines);
  console.log(data.points);
}

Node.js Example
const fs = require("fs");
const Toon = require("./toon.js");

const text = fs.readFileSync("points.toon", "utf8");
const data = Toon.parseFromString(text);
console.log(data);

Utility for p5.js, where loadStrings() returns an array of lines.
Supported Subset (v0.2)

##TOON.js currently supports:
Uniform blocks with declared length:
name[N]{field1,field2,...}:
  value1, value2, ...
  ...


##Scalar coercion:
Numbers → Number
"quoted" → string
true, false → boolean
null → null
Everything else → raw string

##Block merging:
Multiple blocks with the same name append their rows.
Not Supported (by design, for now)
These features of full TOON are not implemented in v0.2:
Nested TOON blocks
Arbitrary value maps {key: value}
Mixed-type arrays
Inline lists
Multi-line string payloads

##Schema validation

This keeps the library lean, predictable, and easy to embed in teaching, generative art, live coding, and browser-based tools.

##Roadmap
 Toon.stringify() (object → TOON)
 Nested-block support
 Optional strict-mode validator
 Error localization and diagnostics
 NPM release + TypeScript definitions
 TOON → CSV transformation utilities
 p5.js convenience helpers (vector arrays, keyframe sequences, etc.)

##Contributing
Contributions are welcome.

##Open issues for feature requests or edge cases
Submit PRs following the existing coding style
Include tests for new parsing rules

TOON.js aims to remain focused, predictable, and small:
feature creep will be carefully managed.

##License
MIT License.
Author

Developed by Riccardo Mantelli 
Designed for computational art, live systems, and LLM-friendly data serialization.
