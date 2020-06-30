const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");


//All methods goes here 
exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
    .populate(category)
    .exec((err, product) =>{
        if(err){
            return res.status(400).json({
                error: "Product not found"
            });
        }
        req.product = product;
        next();
    });

};

exports.createProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if(err) {
            return res.status(400).json({
                error: "Problem in uploading this image"
            });
        }

        //TODO: restrictions in field
        let product = new Product(fields);

        //handle file here
        if(file.photo) {
            if(file.photo.size > 3145728)
            {
            return res.status(400).json({
                error: "Please upload file size less than 3 MB"
              });

            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
            
        }

        //save to the DB
        product.save((err, product) => {
            if(err){
                res.status(400).json({
                    error: "Saving product in DB failed!"
                });
            }
            res.json(product);
        });

    });
}