const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, cate) =>{
        if(err) {
            return res.status(400).json({
                error: "Category not found in DB"
            });
        }
        req.Category = cate;
        next();
    });

};