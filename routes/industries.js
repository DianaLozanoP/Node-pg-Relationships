process.env.NODE_ENV === "production";
const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT name FROM industries`);
        return res.json({ industries: results.rows })
    }
    catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ind_code, name } = req.body;
        let codeSlu = slugify(ind_code, {
            remove: /[*+~.()'"!:@]/g,
            lower: true,
            strict: true
        });
        const results = await db.query(`INSERT INTO industries (ind_code, name) VALUES ($1, $2) RETURNING *`, [codeSlu, name]);
        return res.status(201).json({ industry: results.rows[0] })
    }
    catch (e) {
        return next(e);
    }
});

router.post('/company', async (req, res, next) => {
    try {
        const { ind_code, comp_code } = req.body;
        const results = await db.query(`INSERT INTO comp_industry (comp_code, ind_code) VALUES ($1, $2) RETURNING *`, [comp_code, ind_code]);
        return res.status(201).json({ added: results.rows[0] })
    }
    catch (e) {
        return next(e);
    }
});

module.exports = router;