const crypto = require('crypto');

const CHARS= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'; // Base32 characters

function generateId(prefix,length=10){

    const bytes= crypto.randomBytes(length);

    let result='';

    for( const byte of bytes){
        result+= CHARS[byte % CHARS.length];
    }

    return `${prefix}-${result}`;

}

module.exports= {generateId};