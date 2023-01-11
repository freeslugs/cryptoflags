import * as PImage from "pureimage"
import { PassThrough } from "stream"
import chunk from 'lodash.chunk';

export default function handler(req, res) {
  let { address, width, height, orient } = req.query
  
  if(!width) {
    width = 100
  }

  if(!height) {
    height = 100
  }

  if(!orient) {
    orient = "horizontal"
  }

  // basic orient validation
  if(orient != "horizontal" && orient != "vertical") {
    return res.json({
      error: "Invalid orient query param"
    })
  }
  
  // basic address validation
  if(!address) {
    return res.json({
      error: "Missing address query param"
    })
  }

  if(!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.json({
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
    
    let x = 0 
    let elHeight = height / 7 
    let y = elHeight * i
    let elWidth = width

    if(orient == "vertical") {
      y = 0
      elWidth = width / 7
      x = elWidth * i 
      elHeight = height 
    }
    
    ctx.fillRect(x,y,elWidth,elHeight);
  }

  res.setHeader('Content-Type', 'image/png');
  res.writeHead(200);

  const passThroughStream = new PassThrough();  
  PImage.encodePNGToStream(img, passThroughStream)
  passThroughStream.pipe(res);
}