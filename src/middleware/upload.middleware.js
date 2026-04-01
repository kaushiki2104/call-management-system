// import multer from 'multer'

// const storage = multer.memoryStorage()

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
// })

// export default upload


import multer from 'multer';
import path from 'path';
 

import fs from 'fs';
import os from 'os';
 
const uploadPath =  path.join(os.tmpdir(), 'callLogFile');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
 
    const ext = path.extname(file.originalname)
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
  cb(null, uniqueName)

  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

