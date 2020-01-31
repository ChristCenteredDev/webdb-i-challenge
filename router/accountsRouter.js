const express = require("express");
const db = require("../data/dbConfig");

const router = express.Router();

router.get('/', (req, res) => {
  db('accounts')
    .then(accounts => {
      res.status(200).json(accounts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({errorMessage: "Couldn't retrieve accounts"});
    })
});

router.get('/:id', validateID, (req, res) => {
  const { id } = req.params;

  db('accounts')
    .where({ id: id })
    .first()
    .then(account => {
      if(account) {
        res.status(200).json(account);
      } else {
        res.status(404).json({ errorMessage: 'Account not found' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({errorMessage: "Couldn't retrieve account"});
    })
});

router.post('/', (req, res) => {
  // Ask about validateInfo
  db('accounts')
    .insert(req.body)
    .then(account => {
      res.status(201).json(account);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({errorMessage: "Couldn't add account"});
    })
});

router.put('/:id', validateID, validateBody, (req, res) => {
  const { id } = req.params;
    
  db('accounts')
    .where({ id })
    .update(req.body)
    .then(account => {
      res.status(200).json(account);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({errorMessage: "Couldn't update account"});
    })
});

router.delete('/:id', validateID, (req, res) => {
  const { id } = req.params;

  db.del()
    .from('accounts')
    .where({id})
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({errorMessage: "Couldn't delete account"});
    })
});

// Middleware

const validateInfo = (req, res, next) => {
  const { name, budget } = req.body;
  req.body = { name, budget };  // removes invalid body data

  if(typeof budget !== 'number') {
    return res.status(400).json({ errorMessage: 'Account budget must be a number' });
  }

  next();
}

function validateID(req, res, next) {
  const { id } = req.params;

  db.select("*")
    .from("accounts")
    .where({ id })
    .then(account => {
      account[0]
        ? next()
        : res.status(404).json({
            errorMessage: `Account with ID ${id} can't be found`
          });
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ errorMessage: "Error validating account ID to be returned" });
    });
}

function validateBody(req, res, next) {
  const { name, budget } = req.body;
  req.body = { name, budget };

  if(Object.keys(req.body).length > 0) {
    next();
  } else {
    return res.status(400).json({errorMessage: "Missing body field"});
  }
}

module.exports = router;