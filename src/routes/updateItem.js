const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateItem(req.params.id, {
        name: req.body.name,
        completed: req.body.completed,
        priority: req.body.priority,
        category: req.body.category,
        due_date: req.body.due_date
    });
    const item = await db.getItem(req.params.id);
    res.send(item);
};
