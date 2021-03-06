/*
 * Copyright (c) 2015 Trevor Orsztynowicz
 * Copyright (c) 2015 Joyent, Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var named = require('../lib');

if (require.cache[__dirname + '/helper.js'])
        delete require.cache[__dirname + '/helper.js']
var helper = require('./helper');


var dnsBuffer = require('./dnsbuffer');

var test = helper.test;
var protocol = named.Protocol;

Object.keys(dnsBuffer.samples).forEach(function (i) {
        var sample = dnsBuffer.samples[i];
        test('protocol decode/encode: ' + sample.description, function(t) {
                var decoded = protocol.decode(sample.raw, sample.type);
                if (sample.decoded !== undefined) {
                        t.deepEqual(decoded, sample.decoded);
                }
                if (sample.encode === false) {
                        t.end();
                        return;
                }
                encoded = protocol.encode(decoded, sample.type);
                if (dnsBuffer.equalBuffers(encoded, sample.raw)) {
                        t.ok(true, 'encoder cycle passed');
                }
                else {
                        console.log(decoded);
                        console.log(encoded.toString('base64'));
                        console.log(sample.raw.toString('base64'));
                        t.ok(false, 'encoder cycle failed');
                }
                t.end();
        });
});

test('mname#12 regression test', function (t) {
        var b = new Buffer('GET / HTTP/1.1\r\n\r\n');
        t.throws(function () {
                var decoded = protocol.decode(b, 'message');
        }, /label length/i);
        t.end();
});

test('mname#19 regression test (easy loop)', function (t) {
        var b = new Buffer('3bb981000001000000000000' +
                '047566647304636f616c066a6f79656e74027573c00c' +
                '00010001', 'hex');
        t.throws(function () {
                var decoded = protocol.decode(b, 'message');
        }, /label pointer/i);
        t.end();
});

test('mname#19 regression test (harder loop)', function (t) {
        var b = new Buffer('3bb981000001000000000005' +
                '047566647304636f616c066a6f79656e74027573c00b' +
                '00010001', 'hex');
        t.throws(function () {
                var decoded = protocol.decode(b, 'message');
        }, /maximum length/i);
        t.end();
});
