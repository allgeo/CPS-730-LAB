const db = require('../persistence');
const {v4 : uuid} = require('uuid');

module.exports = async (req, res) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
        priority: req.body.priority,
        category: req.body.category,
        due_date: req.body.due_date
    };

    await db.storeItem(item);
    res.send(item);
};
