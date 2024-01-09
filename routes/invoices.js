process.env.NODE_ENV === "production";
const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows })
    }
    catch (e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // const resultInvoice = await db.query(`SELECT invoices.id,invoices.amt,invoices.paid,invoices.add_date,invoices.paid_date, invoices.comp_code, companies.code, companies.name, companies.description FROM invoices LEFT JOIN companies ON invoices.comp_code=companies.code WHERE id=$1`, [id])
        const result1 = await db.query(`SELECT id,amt,paid,add_date,paid_date FROM invoices WHERE id=$1`, [id]);

        //check if id exists
        if (result1.rows.length === 0) {
            throw new ExpressError(`Can not find company with code of ${id} `, 404)
        }
        //find the code
        const code = await db.query(`SELECT comp_code FROM invoices WHERE id=$1`, [id]);
        const code1 = code.rows[0].comp_code
        //find the company
        const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code1])
        //create Object as specified in the exercise
        let finalObj = { invoice: result1.rows[0] }
        finalObj['invoice']['company'] = company.rows[0];
        return res.json(finalObj)
    }
    catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id,comp_code,amt,paid,add_date,paid_date`, [comp_code, amt]);
        return res.json({ invoice: result.rows[0] })
    }
    catch (e) {
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        const formattedDate = getCurrentDate();
        if (paid === 'True') {
            const result = await db.query(`UPDATE invoices SET amt=$1, paid_date=$2, paid=true WHERE id=$3 RETURNING id,comp_code,amt,paid,add_date,paid_date`, [amt, formattedDate, id])
            if (result.rows.length === 0) {
                throw new ExpressError(`Can not find company with code of ${id} `, 404)
            }
            return res.json({ invoice: result.rows[0] })
        }
        else {
            const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id,comp_code,amt,paid,add_date,paid_date`, [amt, id])
            return res.json({ invoice: result.rows[0] })
        }
    }
    catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const checking = await db.query(`SELECT amt FROM invoices WHERE id =$1`, [id])
        if (checking.rowCount === 0) {
            throw new ExpressError(`Can not delete user with id of ${id} `, 404)
        }
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id])
        return res.status(200).send({ status: "deleted" })
    }
    catch (e) {
        return next(e);
    }
});


module.exports = router;