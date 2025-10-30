// import express from "node:express"
const express = require("express")
const cry = require("crypto")
const fs = require("fs")
const app = express()

const { subtle } = globalThis.crypto;
const publicExponent = new Uint8Array([1, 0, 1]);

function savetodb(UUID, key) {
// Write to file (creates or overwrites)
    fs.writeFileSync("SQLite/"+UUID, JSON.stringify(key));

// Read from file
//   const content = fs.readFileSync('test.txt', 'utf8');
//   console.log(content); // "Hello World!"
}

async function generateRsaKey(modulusLength = 2048, hash = 'SHA-256') {
  const {
    publicKey,
    privateKey,
  } = await subtle.generateKey({
    name: 'RSA-OAEP',
    modulusLength,
    publicExponent,
    hash,
  }, true, ['encrypt', 'decrypt']);

  return { publicKey, privateKey };
}
app.use(express.json());

app.post("/submit", async (req, res) => {
  enc_challenge = req.body.enc_challenge
  UUID = req.body.id
  const private_raw = fs.readFileSync("SQLite/" + UUID, 'utf8');
  let private = await  cry.subtle.importKey("jwk", JSON.parse(private_raw), { name: "RSA-OAEP", hash: "SHA-256" }, true, ['decrypt'])
  console.log(private)
  dec_challenge = await cry.subtle.decrypt({ name: "RSA-OAEP", hash: "SHA-256" }, private, Buffer.from(enc_challenge, "base64"))
  console.log(new TextDecoder().decode(dec_challenge))
})

app.post("/echo", (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

app.get("/gen", async (req, res) => {
    let UUID = cry.randomUUID()
    let keys = await generateRsaKey()
    let raw = await subtle.exportKey("jwk", keys.publicKey)
    savetodb(UUID, await subtle.exportKey("jwk", keys.privateKey))
    res.json({key: raw, id: UUID})
})
app.listen(3000, () => {
    console.log("suck")
})