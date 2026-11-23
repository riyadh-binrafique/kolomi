import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function cropPng(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  let pos = 8;
  let width = 0, height = 0;
  let idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const rowBytes = 1 + width * 4;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes + 1;
    for (let x = 0; x < width; x++) {
      const alpha = decompressed[rowStart + x * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    console.log(`Empty image: ${inputPath}`);
    return;
  }

  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const croppedW = maxX - minX + 1;
  const croppedH = maxY - minY + 1;

  const croppedRaw = Buffer.alloc(croppedH * (1 + croppedW * 4));
  for (let cy = 0; cy < croppedH; cy++) {
    const origY = minY + cy;
    const origRowStart = origY * rowBytes + 1;
    const destRowStart = cy * (1 + croppedW * 4);
    croppedRaw[destRowStart] = 0;
    for (let cx = 0; cx < croppedW; cx++) {
      const origX = minX + cx;
      const srcIdx = origRowStart + origX * 4;
      const dstIdx = destRowStart + 1 + cx * 4;
      croppedRaw[dstIdx] = decompressed[srcIdx];
      croppedRaw[dstIdx + 1] = decompressed[srcIdx + 1];
      croppedRaw[dstIdx + 2] = decompressed[srcIdx + 2];
      croppedRaw[dstIdx + 3] = decompressed[srcIdx + 3];
    }
  }

  const deflated = zlib.deflateSync(croppedRaw);

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(b) {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) {
      c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    }
    return c ^ 0xffffffff;
  }

  function makeChunk(typeStr, dataBuf) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, dataBuf]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(croppedW, 0);
  ihdrData.writeUInt32BE(croppedH, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const outBuf = Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, outBuf);
  console.log(`Cropped ${inputPath} -> ${outputPath} (${croppedW}x${croppedH})`);
}

const matDir = '/Users/riyadhmac/Documents/GitHub/kolomi/Animals/materials';
const outDir = '/Users/riyadhmac/Documents/GitHub/kolomi/Animals/public/assets';

fs.mkdirSync(outDir, { recursive: true });

const filesToCrop = [
  'an1.png',
  'an1sh.png',
  'an2.png',
  'an2sh.png',
  'an3.png',
  'an3sh.png',
  'an4.png',
  'an4sh.png',
  'dot.png',
  'retry.png',
  'next.png',
  'sg.png',
  'solidBg.png',
  'star.png',
  'Exit.png',
];

for (const f of filesToCrop) {
  const inP = path.join(matDir, f);
  const outP = path.join(outDir, f);
  if (fs.existsSync(inP)) {
    cropPng(inP, outP);
  }
}

// Background doesn't need alpha cropping, just copy directly
fs.copyFileSync(path.join(matDir, 'gkanimalbg.png'), path.join(outDir, 'gkanimalbg.png'));
console.log('Copied gkanimalbg.png');
