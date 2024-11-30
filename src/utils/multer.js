import path from "path";
import multer from "multer";
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

    
const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
         console.log("_____floder",req.body)
        const uploadFolderPath = path.join(__dirname,`../../uploads`,req.body.foldername ?req.body.foldername:"CompanyLogo");
        if (!fs.existsSync(uploadFolderPath)) {
            try {
                fs.mkdirSync(uploadFolderPath, { recursive: true });
                cb(null, uploadFolderPath);
            } catch (err) {
                cb(err);
            }
        } else {
            cb(null, uploadFolderPath);
        }
    },
    filename: function (req, file, cb) {
        
        const fileExtension = `${req.body.fileUidName}.${file.originalname.split(".")[1]}`;
        cb(null,  fileExtension);
    }
});


const upload = multer({
    storage: storage,
    limits: {
        fileSize:  30* 1024 * 1024 
    },
    fileFilter: function (req, file, cb) {
       
        const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});


export default upload