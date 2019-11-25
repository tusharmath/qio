---
title: Managed
---

Managed is a special data structure that is built to provide certain guarantees around resources. It makes sure that,

1. The resource is **acquired** only when an operation is ready to be performed.
2. The resource is **released** when the operation is completed **successfully**.
3. The resource is **released** when there is a **failure**.
4. The resource is **released** when an operation is **cancelled**.

## Creating Managed

You can create a managed resource using `Managed.make`.

```diff
+ import {Managed, QIO} from '@qio/core'
+ import {promises as fs} from 'fs'
+
+ const open = QIO.encaseP(fs.open)
+ const close = QIO.encaseP((fd: fs.FileHandle) => fd.close())
+
+ const managedFD = Managed.make(open('./abc.txt', 'w'), close)
```

## Using Managed

`managedFD` can be used through the `.use` operator.

```diff
  import {Managed, QIO} from '@qio/core'
  import {promises as fs} from 'fs'

  const open = QIO.encaseP(fs.open)
  const close = QIO.encaseP((fd: fs.FileHandle) => fd.close())
  const write = QIO.encaseP((fd: fs.FileHandle, buffer: Buffer) =>
    fd.write(buffer)
  )
+ const write = QIO.encaseP((fd: fs.FileHandle, buffer: Buffer) =>
+   fd.write(buffer)
+ )

  const managedFD = Managed.make(open('./abc.txt', 'w'), close)

+ managedFD.use(fd => write(fd, Buffer.from('DATA')))
```
