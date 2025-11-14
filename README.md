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
