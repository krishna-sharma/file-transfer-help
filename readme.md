### File Transfer Help

- A simple and crude tool to allow transferring of files between two browsers. The transfers are not done as P2P.
- I use `express` to cache in memory and then statically serve the only file in the app that passes to browser.
- I use `ws` to manage file transfers between clients.
- No private information is collected except the bare minimum needed to make the transfer possible.
- Records of such transfer is deleted as soon as either the sender or the receiver disconnects.
- Server will not store file content anywhere except in the network buffers during the brief time a file chunk is being transferred.

Typical info about a file that is held for an ongoing transfer...

```
{
  type: "RECEIVE",
  status: "Progressing",
  start: 1643537878116,
  timestamp: 1643537878116,
  progress: 149629,

  transferId: "transfer-1",
  name: "aston-martin-vantage.jpg",
  size: 149629,
  mimeType: "image/jpeg",
  lastModified: 1324700166000,

  // only for receive side
  clientId: "client-1",
  fileId: "file-1",
}
```
