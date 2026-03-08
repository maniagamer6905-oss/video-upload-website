const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = './public/uploads/videos/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 }
});

app.get('/', function(req, res) {
    const videosPath = './public/uploads/videos/';
    let videos = [];
    if (fs.existsSync(videosPath)) {
        const files = fs.readdirSync(videosPath);
        videos = files.map(function(file) {
            return {
                name: file,
                url: '/uploads/videos/' + file
            };
        });
    }
    res.render('index', { videos: videos });
});

app.get('/admin/login', function(req, res) {
    res.render('login');
});

app.post('/admin/login', function(req, res) {
    if (req.body.username === 'admin' && req.body.password === 'admin123') {
        res.redirect('/admin');
    } else {
        res.send('Invalid! <a href="/admin/login">Try again</a>');
    }
});

app.get('/admin', function(req, res) {
    const videosPath = './public/uploads/videos/';
    let videos = [];
    if (fs.existsSync(videosPath)) {
        const files = fs.readdirSync(videosPath);
        videos = files.map(function(file) {
            const stats = fs.statSync(path.join(videosPath, file));
            const sizeMB = (stats.size / 1048576).toFixed(2);
            return {
                name: file,
                url: '/uploads/videos/' + file,
                size: sizeMB + ' MB'
            };
        });
    }
    res.render('admin', { videos: videos });
});

app.post('/admin/upload', upload.single('video'), function(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded!');
    }
    res.redirect('/admin');
});

app.delete('/admin/delete/:filename', function(req, res) {
    const filename = req.params.filename;
    const filePath = path.join('./public/uploads/videos/', filename);
    fs.unlink(filePath, function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting' });
        }
        res.json({ message: 'Deleted successfully' });
    });
});

app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});
