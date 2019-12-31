---
title: Brackets
---

Say you want to open a file, write something to it and then close the file:

```ts
import {promises as fs} from 'fs'

const program = async () => {
  // Run inside a try-catch block
  try {
    const fd = await fs.open('./data', 'r+') // Open the file
    await fd.write('Hello World!') // Write something to it
  } catch (e) {
    console.error(e) // Log error
  } finally {
    await fd.close() // Close the file
  }
}
```

The above implementation can be abstracted out using the `bracket` API inside QIO as follows:

```ts
import {QIO} from '@qio/core'
import {promises as fs} from 'fs'

// Open file effect
const open = QIO.encaseP(fs.open)

// Close file effect
const close = QIO.encaseP((fd: fs.FileHandle) => fd.close())

// Create a bracket (try-catch alternative)
const bracket = open('./abc.txt', 'w').bracket(close)

// Use the bracket
const program = bracket(fd => fd.write('./data'))
```

Brackets will automatically release the resource once it done writing the file. It will also release the file handle on any form of interruption such as an external cancellation or an internal exception.
