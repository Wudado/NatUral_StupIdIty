// import express from "node:express"
const express = require("express")
const cry = require("crypto")
const fs = require("fs")
const app = express()

const { subtle } = globalThis.crypto;
const publicExponent = new Uint8Array([1, 0, 1]);

async function savetodb() {

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

app.get("/dikc", (req, res) => {
    res.send("huy\n")
})

app.post("/echo", (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

app.get("/gen", async (req, res) => {
    let UUID = cry.randomUUID()
    let keys = await generateRsaKey()
    let raw = await subtle.exportKey("jwk", keys.publicKey)
    res.json({key: raw, id: UUID})
})
app.listen(3000, () => {
    console.log("suck")
})