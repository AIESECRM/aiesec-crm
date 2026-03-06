const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('C:\\Users\\ernal\\Downloads\\B2B_CRM_Ideas (1).pdf');

pdf(dataBuffer).then(function (data) {
    fs.writeFileSync('pdf-output.txt', data.text);
    console.log('PDF parsed successfully.');
}).catch(console.error);
