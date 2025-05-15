import fs from "fs";
import path from "path";

const imagePath = path.join(process.cwd(), "public", "ob_background.jpg");
const imageBuffer = fs.readFileSync(imagePath);
const base64String = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

console.log(base64String);
