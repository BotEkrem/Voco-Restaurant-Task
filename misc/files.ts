import * as fs from "fs";

export async function writeFile(fileName: string, path: string, buffer: Buffer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path + fileName, buffer, { encoding: "binary" }, (err) => {
      if (err) reject(err);

      resolve(path + fileName)
    })
  })
}