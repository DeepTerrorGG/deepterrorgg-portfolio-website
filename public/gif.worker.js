
// gif.js worker script
// This file is required by the gif.js library to run the encoding in a separate thread.

// This script should be placed in your `public` directory.

var GIFEncoder = function(width, height) {
    // GIF dimensions
    this.width = ~~width;
    this.height = ~~height;

    // Frame data
    this.frames = [];
    this.threshold = 90; // Transparent color threshold
    this.indexedPixels = null;
    this.colorDepth = 0;
    this.colorTab = null;

    // LZW encoder
    this.lzw = new LZWEncoder(this.width, this.height);
};

GIFEncoder.prototype.addFrame = function(imageData, delay) {
    this.frames.push({
        data: imageData,
        delay: ~~delay
    });
};

GIFEncoder.prototype.finish = function() {
    var self = this;
    var out = [];
    out.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61); // "GIF89a"
    this.writeHeader(out);

    // Global Color Table
    this.analyzePixels(this.frames[0].data);
    this.writeLSD(out);
    this.writePalette(out);

    // Application Extension for looping
    this.writeNetscapeExt(out);

    // Encode frames
    this.frames.forEach(function(frame, i) {
        self.writeGraphicCtrlExt(out, frame.delay);
        self.writeImageDesc(out);
        self.writePixels(out, frame.data);
    });

    out.push(0x3B); // Trailer
    return out;
};

GIFEncoder.prototype.writeHeader = function(out) {
    out.push(this.width & 0xFF, (this.width >> 8) & 0xFF);
    out.push(this.height & 0xFF, (this.height >> 8) & 0xFF);
};

GIFEncoder.prototype.writeLSD = function(out) {
    var packed = 0;
    packed |= 0x80; // Global Color Table Flag
    packed |= (this.colorDepth - 1) << 4;
    packed |= (this.colorDepth - 1); // Color Resolution

    out.push(packed);
    out.push(0); // Background Color Index
    out.push(0); // Pixel Aspect Ratio
};

GIFEncoder.prototype.writePalette = function(out) {
    for (var i = 0; i < this.colorTab.length; i += 3) {
        out.push(this.colorTab[i], this.colorTab[i + 1], this.colorTab[i + 2]);
    }
    var n = (3 * (1 << this.colorDepth)) - this.colorTab.length;
    for (var j = 0; j < n; j++) {
        out.push(0);
    }
};

GIFEncoder.prototype.writeGraphicCtrlExt = function(out, delay) {
    out.push(0x21, 0xF9, 0x04); // Extension Introducer, Graphic Control Label, Block Size
    var packed = 0;
    packed |= 1; // Transparent Color Flag
    out.push(packed);
    out.push(delay & 0xFF, (delay >> 8) & 0xFF); // Delay Time
    out.push(this.transparencyIndex); // Transparent Color Index
    out.push(0); // Block Terminator
};

GIFEncoder.prototype.writeImageDesc = function(out) {
    out.push(0x2C); // Image Separator
    out.push(0, 0, 0, 0); // Image Left/Top
    out.push(this.width & 0xFF, (this.width >> 8) & 0xFF);
    out.push(this.height & 0xFF, (this.height >> 8) & 0xFF);
    out.push(0); // No Local Color Table
};

GIFEncoder.prototype.writePixels = function(out, data) {
    this.lzw.encode(data, this.indexedPixels, this.colorDepth, out);
};

GIFEncoder.prototype.analyzePixels = function(data) {
    var len = data.length;
    var nPix = len / 4;
    this.indexedPixels = new Uint8Array(nPix);
    var neuQuant = new NeuQuant(data, len, 10);
    this.colorTab = neuQuant.process();

    // Map pixels to palette
    var k = 0;
    for (var j = 0; j < nPix; j++) {
        var index = neuQuant.map(data[k++] & 0xFF, data[k++] & 0xFF, data[k++] & 0xFF);
        this.indexedPixels[j] = index;
        k++; // Skip alpha
    }

    this.colorDepth = 8;
    this.transparencyIndex = neuQuant.map(255,255,255); // Assuming white is transparent
};

// LZW Encoder
var LZWEncoder = function(width, height) {
    this.width = width;
    this.height = height;
    this.accum = new Uint8Array(256);
    this.htab = new Int32Array(5003);
    this.codetab = new Int32Array(5003);
    this.cur_accum = 0;
    this.cur_bits = 0;
    this.cur_ent = 0;
    this.free_ent = 0;
    this.g_init_bits = 0;
    this.maxcode = 0;
    this.n_bits = 0;
};

LZWEncoder.prototype.encode = function(data, pixels, color_depth, outs) {
    var init_code_size = Math.max(2, color_depth);
    this.g_init_bits = init_code_size;
    
    outs.push(init_code_size);

    this.clear_flg = 0;
    this.n_bits = this.g_init_bits + 1;
    this.maxcode = this.MAXCODE(this.n_bits);

    this.clear_code = 1 << this.g_init_bits;
    this.EOF_code = this.clear_code + 1;
    this.free_ent = this.clear_code + 2;

    this.a_count = 0;

    var ent = this.next_pixel(pixels);

    var hshift = 0;
    for (var fcode = this.htab.length; fcode < 65536; fcode *= 2) {
        ++hshift;
    }
    hshift = 8 - hshift;
    
    var hsize = this.htab.length;
    this.cl_hash(hsize);

    this.output(this.clear_code, outs);

    var c;
    var pixel_index = 0;
    while ((c = this.next_pixel(pixels, pixel_index++)) != -1) {
        var fcode = (c << 8) + ent;
        var i = (c << hshift) ^ ent;

        if (this.htab[i] == fcode) {
            ent = this.codetab[i];
            continue;
        } else if (this.htab[i] >= 0) {
            var disp = hsize - i;
            if (i === 0) {
                disp = 1;
            }
            do {
                if ((i -= disp) < 0) {
                    i += hsize;
                }

                if (this.htab[i] == fcode) {
                    ent = this.codetab[i];
                    
                    // GOTO
                    var _goto = false;
                    var c2;
                    while((c2 = this.next_pixel(pixels, pixel_index++)) != -1) {
                      fcode = (c2 << 8) + ent;
                      i = (c2 << hshift) ^ ent;
                      if(this.htab[i] == fcode) {
                        ent = this.codetab[i];
                      } else {
                        ent = c2;
                        this.output(ent, outs);
                        this.cl_block(outs);
                        return;
                      }
                    }
                    _goto = true;
                    if(_goto) break;
                }
            } while (this.htab[i] >= 0);
        }
        
        this.output(ent, outs);
        ent = c;
        if (this.free_ent < 4096) {
            this.codetab[i] = this.free_ent++;
            this.htab[i] = fcode;
        } else {
            this.cl_block(outs);
        }
    }
    
    this.output(ent, outs);
    this.output(this.EOF_code, outs);
    
    // Write out remaining packets
    if (this.a_count > 0) {
        outs.push(this.a_count);
        for(var i = 0; i < this.a_count; i++) {
          outs.push(this.accum[i]);
        }
    }
};

LZWEncoder.prototype.next_pixel = function(pixels, index) {
    if (index === undefined) index = 0;
    if (index >= pixels.length) {
        return -1;
    }
    return pixels[index] & 0xFF;
};

LZWEncoder.prototype.cl_hash = function(hsize) {
    for (var i = 0; i < hsize; ++i) {
        this.htab[i] = -1;
    }
};

LZWEncoder.prototype.cl_block = function(outs) {
    this.cl_hash(this.htab.length);
    this.free_ent = this.clear_code + 2;
    this.clear_flg = 1;
    this.output(this.clear_code, outs);
};

LZWEncoder.prototype.MAXCODE = function(n_bits) {
    return (1 << n_bits) - 1;
};

LZWEncoder.prototype.output = function(code, outs) {
    this.cur_accum &= (1 << this.cur_bits) - 1;
    
    if (this.cur_bits > 0) {
        this.cur_accum |= (code << this.cur_bits);
    } else {
        this.cur_accum = code;
    }
    
    this.cur_bits += this.n_bits;
    
    while(this.cur_bits >= 8) {
        this.char_out(this.cur_accum & 0xFF, outs);
        this.cur_accum >>= 8;
        this.cur_bits -= 8;
    }
    
    if(this.free_ent > this.maxcode || this.clear_flg) {
        if(this.clear_flg) {
            this.n_bits = this.g_init_bits + 1;
            this.maxcode = this.MAXCODE(this.n_bits);
            this.clear_flg = 0;
        } else {
            ++this.n_bits;
            if(this.n_bits == 12) {
                this.maxcode = 4096;
            } else {
                this.maxcode = this.MAXCODE(this.n_bits);
            }
        }
    }
};

LZWEncoder.prototype.char_out = function(c, outs) {
    this.accum[this.a_count++] = c;
    if(this.a_count >= 254) {
        this.flush_char(outs);
    }
};

LZWEncoder.prototype.flush_char = function(outs) {
    if(this.a_count > 0) {
        outs.push(this.a_count);
        for(var i = 0; i < this.a_count; i++) {
          outs.push(this.accum[i]);
        }
        this.a_count = 0;
    }
};


// NeuQuant
function NeuQuant(pixels, samplefac, len) {
    this.pixels = pixels;
    this.samplefac = samplefac;
    this.netsize = 256;
    this.net = new Array(this.netsize);
    this.netindex = new Array(256);
    this.bias = new Array(this.netsize);
    this.freq = new Array(this.netsize);

    for (var i = 0; i < this.netsize; i++) {
        this.net[i] = new Array(3);
        this.net[i][0] = this.net[i][1] = this.net[i][2] = (i << (4 + 8)) / this.netsize;
        this.freq[i] = (1 << 20) / this.netsize;
        this.bias[i] = 0;
    }
}

NeuQuant.prototype.process = function() {
    this.learn();
    this.unbiasnet();
    this.buildcolormap();
    return this.colorTab;
};

NeuQuant.prototype.learn = function() {
    var len = this.pixels.length;
    var alpha = 1024;
    var radius = (this.netsize >> 3) * 30;

    for (var i = 0; i < len; i += 4 * this.samplefac) {
        var r = this.pixels[i] & 0xFF;
        var g = this.pixels[i + 1] & 0xFF;
        var b = this.pixels[i + 2] & 0xFF;
        this.altersingle(alpha, this.contest(r, g, b), r, g, b);
        if (i % 100 == 0) {
            alpha -= alpha / 30;
            radius -= radius / 30;
        }
    }
};

NeuQuant.prototype.unbiasnet = function() {
    for (var i = 0; i < this.netsize; i++) {
        this.net[i][0] >>= 4;
        this.net[i][1] >>= 4;
        this.net[i][2] >>= 4;
        this.net[i][3] = i; // record color index
    }
};

NeuQuant.prototype.altersingle = function(alpha, i, r, g, b) {
    this.net[i][0] -= (alpha * (this.net[i][0] - r)) / 1024;
    this.net[i][1] -= (alpha * (this.net[i][1] - g)) / 1024;
    this.net[i][2] -= (alpha * (this.net[i][2] - b)) / 1024;
};

NeuQuant.prototype.contest = function(r, g, b) {
    var bestd = ~(1 << 31);
    var bestbiasd = bestd;
    var bestpos = -1;
    var bestbiaspos = bestpos;

    for (var i = 0; i < this.netsize; i++) {
        var n = this.net[i];
        var dist = Math.abs(n[0] - r) + Math.abs(n[1] - g) + Math.abs(n[2] - b);
        if (dist < bestd) {
            bestd = dist;
            bestpos = i;
        }
        var biasdist = dist - ((this.bias[i]) >> (16 - 4));
        if (biasdist < bestbiasd) {
            bestbiasd = biasdist;
            bestbiaspos = i;
        }
        var betafreq = (this.freq[i] >> 10);
        this.freq[i] -= betafreq;
        this.bias[i] += betafreq << 10;
    }
    this.freq[bestpos] += (1 << 20) / this.netsize;
    this.bias[bestpos] -= (1 << 20);
    return bestbiaspos;
};

NeuQuant.prototype.map = function(r, g, b) {
    var bestd = 1000;
    var best = -1;
    var i = this.netindex[g];
    var j = i - 1;

    while ((i < this.netsize) || (j >= 0)) {
        if (i < this.netsize) {
            var p = this.net[i];
            var dist = p[1] - g;
            if (dist >= bestd) i = this.netsize;
            else {
                i++;
                if (dist < 0) dist = -dist;
                var a = p[0] - r;
                if (a < 0) a = -a;
                dist += a;
                if (dist < bestd) {
                    a = p[2] - b;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                        bestd = dist;
                        best = p[3];
                    }
                }
            }
        }
        if (j >= 0) {
            var p = this.net[j];
            var dist = g - p[1];
            if (dist >= bestd) j = -1;
            else {
                j--;
                if (dist < 0) dist = -dist;
                var a = p[0] - r;
                if (a < 0) a = -a;
                dist += a;
                if (dist < bestd) {
                    a = p[2] - b;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                        bestd = dist;
                        best = p[3];
                    }
                }
            }
        }
    }
    return best;
};

NeuQuant.prototype.buildcolormap = function() {
    this.colorTab = [];
    var a, b;
    for (var i = 0; i < this.netsize; i++) {
        var p = this.net[i];
        a = p[0];
        b = p[1];
        var c = p[2];
        this.colorTab.push(a, b, c);
    }
};

onmessage = function(e) {
    var data = e.data;
    var encoder = new GIFEncoder(data.width, data.height);
    encoder.addFrame(data.imageData, data.delay);
    var buffer = encoder.finish();
    postMessage(buffer);
};
