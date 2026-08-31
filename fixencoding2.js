const fs = require("fs");
const path = "C:\\Users\\k\\Desktop\\invocia-platform\\invocia -TN\\src\\lib\\api-client-backend.ts";
let content = fs.readFileSync(path, "utf16le");
content = content.replace(/^\uFEFF/, "");
fs.writeFileSync(path, content, "utf8");
console.log("First 50 chars:", JSON.stringify(content.slice(0, 50)));
console.log("New length:", content.length);
