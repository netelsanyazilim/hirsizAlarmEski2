var CryptoJS = require('crypto-js');
var password = 'd6F3Efeq';

class Crypto {
  encrypt(text) {
    var ciphertext = CryptoJS.AES.encrypt(text, password);
    return ciphertext.toString();
  }

  decrypt(encrypted) {
    var bytes = CryptoJS.AES.decrypt(encrypted, password);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  }

  compare(pass, encrypted) {
    if (pass === this.decrypt(encrypted)) return true;
    else return false;
  }
}

let A = new Crypto();
module.exports = A;