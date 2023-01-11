import * as PImage from "pureimage"
import { PassThrough } from "stream"
import chunk from 'lodash.chunk';


export default function handler(req, res) {
  let { address, width, height } = req.query
  
  if(!width) {
    width = 100
  }

  if(!height) {
    height = 100
  }
  
  // basic address validation
  if(!address) {
    res.json({
      error: "Missing address query param"
    })
  }

  if(!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.json({
      error: `Invalid ethereum address ${address}`
    })
  }

  // remove the 0x, not needed 
  const chunks = chunk(address.replace('0x', ''), 6);

  var img = PImage.make(width,height);
  var ctx = img.getContext('2d');

  for (var i = 0; i < chunks.length; i++) {
    let hex = chunks[i].join('')
    // pad the last one 
    if(hex.length == 4) {
      hex += 'ff'
    }
    ctx.fillStyle = '#' + hex;
    
    const x = 0 
    const elHeight = height / 7 
    const y = elHeight * i
    const elWidth = width
    
    ctx.fillRect(x,y,elWidth,elHeight);
  }

  res.setHeader('Content-Type', 'image/png');

  const passThroughStream = new PassThrough();  
  PImage.encodePNGToStream(img, passThroughStream)
  passThroughStream.pipe(res);
}