import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path.join(__dirname, '../../public/temp'));
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
        // TODO Add a unique prefix rather than Date.now 
    }
});

export const upload = multer({
    storage,
});

