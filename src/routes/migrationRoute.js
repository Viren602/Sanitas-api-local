import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';
import { importPMFormula, importPMFormulaWithRMId, importRMFormula, importRMFormulaWithRMId } from "../controller/migrationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migration = express.Router();

migration.use(bodyParser.urlencoded({ extended: true }));
migration.use(express.static(path.resolve(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });

migration.post('/ImportRMFormula', upload.single('file'), importRMFormula);
migration.post('/ImportPMFormula', upload.single('file'), importPMFormula);
migration.get('/ImportRMFormulaWithRMId', importRMFormulaWithRMId);
migration.get('/ImportPMFormulaWithRMId', importPMFormulaWithRMId);

export default migration;
