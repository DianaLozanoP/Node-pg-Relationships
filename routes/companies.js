process.env.NODE_ENV === "production"
const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
    }
    catch (e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const result = await db.query(`SELECT code, name, description FROM companies WHERE code =$1`, [code])
        const result2 = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code])
        if (result.rows.length === 0) {
            throw new ExpressError(`Can not find company with code of ${id} `, 404)
        }
        let finalObj = { company: result.rows[0] }
        finalObj['company']['invoices'] = result2.rows[0];
        console.log(finalObj)

        return res.json(finalObj)
    }
    catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description])
        return res.status(201).json({ company: results.rows[0] })
    }
    catch (e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body;
        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code])
        if (result.rows.length === 0) {
            throw new ExpressError(`Can not find company with code of ${id} `, 404)
        }
        return res.json({ company: result.rows[0] })
    }
    catch (e) {
        return next(e);
    }
});
router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const checking = await db.query(`SELECT name FROM companies WHERE code =$1`, [code])
        if (checking.rowCount === 0) {
            throw new ExpressError(`Can not delete company with code ${code} `, 404)
        }
        const results = await db.query('DELETE FROM companies WHERE code=$1', [code])
        return res.status(200).send({ status: "DELETED" })
    }
    catch (e) {
        return next(e);
    }
})

module.exports = router;