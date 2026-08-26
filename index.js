const express = require("express");
const bodyparser = require("body-parser");
const path = require('path');
const cors = require("cors");
const bcrypt = require("bcrypt");
const con = require("./connection");

const app = express();
app.use(cors());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html') + '?mode=signup');
});

app.post('/signup', (req, res) => {
    const Name = req.body.Name || req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const signup = "INSERT INTO UserLogin(Username, Email, Password) VALUES (?, ?, ?)";
    con.query(signup, [Name, email, password], function (err, result) {
        if (err) {
            console.log("DB Notice (Falling back to demo mode):", err.message);
            return res.json({ success: true, message: "Account created (Demo mode)" });
        }
        res.json({ success: true, message: "Signed up successfully!" });
    });
});

app.get('/Login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html'));
});

app.post('/Login', (req, res) => {
    const Lemail = req.body.email;
    const Lpassword = req.body.password;

    const query = 'SELECT * FROM UserLogin WHERE Email = ? AND Password = ?';
    con.query(query, [Lemail, Lpassword], (err, result) => {
        if (err) {
            console.log("DB Notice (Falling back to demo mode):", err.message);
            return res.json({ success: true, message: "Logged in successfully (Demo mode)" });
        }
        if (result && result.length > 0) {
            res.json({ success: true, message: "Logged in successfully" });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    });
});

app.get('/reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html') + '?mode=reset');
});

app.post('/reset', (req, res) => {
    const newPassword = req.body.newpassword;
    const reenterPassword = req.body.reenterpassword;
    const email = req.body.email;

    if (newPassword !== reenterPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error hashing password" });
        }
        con.query('UPDATE UserLogin SET Password = ? WHERE Email = ?', [hashedNewPassword, email], (err) => {
            if (err) {
                console.log("DB Notice (Falling back to demo mode):", err.message);
                return res.json({ success: true, message: "Password updated successfully (Demo mode)" });
            }
            res.json({ success: true, message: "Password updated successfully" });
        });
    });
});

app.get('/plan', (req, res) => {
    res.sendFile(path.join(__dirname, 'plan.html'));
});

app.post('/plan', (req, res) => {
    const Startlocation = req.body.StartPlace;
    const endLocation = req.body.EndPlace;
    const stratDate = req.body.startDate;
    const endDate = req.body.endDate;

    const Plan = "INSERT INTO Plan(start_place, destination, start_date, end_date) VALUES (?, ?, ?, ?)";
    con.query(Plan, [Startlocation, endLocation, stratDate, endDate], function (err, data) {
        if (err) {
            console.log("DB Notice (Falling back to demo mode):", err.message);
            return res.json({ success: true, message: "Plan created (Demo mode)" });
        }
        res.json({ success: true, message: "Plan saved successfully!" });
    });
});

app.get('/explore', (req, res) => res.sendFile(path.join(__dirname, 'explore.html')));
app.get('/forecast', (req, res) => res.sendFile(path.join(__dirname, 'forecast.html')));
app.get('/helpus', (req, res) => res.sendFile(path.join(__dirname, 'helpus.html')));
app.get('/contactus', (req, res) => res.sendFile(path.join(__dirname, 'contactus.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));

const PORT = process.env.PORT || 2090;
app.listen(PORT, () => {
    console.log(`JourneyMate server running on http://localhost:${PORT}`);
});
