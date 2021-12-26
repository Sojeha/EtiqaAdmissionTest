var express = require('express');
var app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
var mysql = require('mysql');
var uuid = require('uuid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());

// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});
// connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'home'
});

// connect to database
dbConn.connect();

// Retrieve all students 
app.get('/students', function (req, res) {
    dbConn.query(`
    SELECT 
    students.id, 
    students.name,
    students.grade,
    students.classname, 
    courses.name AS course_name 
    FROM students INNER JOIN courses ON students.id = courses.student_id
    `, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results });
    });
});

// Add a new student
app.post('/add-student', function (req, res) {

    let student = req.body;
    if (!student) {
        return res.status(400).send({ error: true, message: 'Please provide student data' });
    }

    dbConn.query(`
        INSERT INTO 
        students 
        VALUES (?,?,?,?) `,
        [student.id, student.name, student.grade, student.classname],
        function (error, results, fields) {
            if (error) throw error;

            if (student.course_name) {
                let courses = [];
                student.course_name.forEach(e => {
                    courses.push([uuid.v4(), student.id, e])
                });
                dbConn.query(`
                    INSERT INTO 
                    courses 
                    VALUES ? `,
                    [courses],
                    function (error, results, fields) {
                        if (error) throw error;
                    });
            }
            return res.send({ error: false, data: results, message: 'Student added' });
        });
});

//  Update student with id
app.post('/update-student', function (req, res) {
    let student_id = req.query.id;
    let course_name = JSON.parse(req.query.course_name);

    if (!student_id) {
        return res.status(400).send({ error: user, message: 'Student id not found!' });
    }

    dbConn.query(`UPDATE students SET grade = ?, classname = ? WHERE id = ?`, [req.query.grade, req.query.classname, student_id], function (error, results, fields) {
        if (error) throw error;

        dbConn.query(`DELETE FROM courses WHERE student_id = ?`, [student_id], (err, res, fields) => {
            if (err) throw err;

            let courses = [];
            course_name.forEach(e => {
                courses.push([uuid.v4(), student_id, e])
            });

            dbConn.query(`INSERT INTO courses VALUES ? `, [courses], (err, res, fields) => {
                if (err) throw err;

            });
        });
        return res.send({ error: false, data: results, message: 'Student updated successfully.' });
    });
});

//  Delete student
app.post('/delete-student', function (req, res) {
    let student_id = req.query.id;

    if (!student_id) {
        return res.status(400).send({ error: true, message: 'Please provide student id' });
    }
    dbConn.query('DELETE FROM students WHERE id = ?', [student_id], function (error, results, fields) {
        if (error) throw error;

        dbConn.query(`DELETE FROM courses WHERE student_id = ?`, [student_id], function (error, results, fields) {
            if (error) throw error;
        })

        return res.send({ error: false, data: results, message: 'User has been updated successfully.' });
    });
});

// set port
const ports = process.env.PORT || 3000;
app.listen(ports, () => console.log(`listening on port ${ports}`));
module.exports = app;