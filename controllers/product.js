const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");


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

        //destructure the fields
        const { name, description, price, category, stock } = fields;
        if( !name || !description || !price || !category || !stock){
            return res.status(400).json({
                error: "Please include all fields"
            });
        }

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
};

exports.getProduct = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product)
};


//middleware
exports.photo = (req, res, next) => {
    if(req.product.photo.data){
        res.set("Content-Type", req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}
 
//delete controller
exports.deleteProduct = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: "Failed to delete the product"
            });
        }
        res.json({
            message: `${product.name} is succesfully deleted`,
            deletedProduct
        })
    })
}

//update controller
exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if(err) {
            return res.status(400).json({
                error: "Problem in uploading this image"
            });
        }

        //updation code
        let product = req.product
        product = _.extend(product, fields);

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
                    error: "Updation of product get failed!"
                });
            }
            res.json(product);
        });

    });
}

//product listing
exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if(err){
                return res.status(400).json({
                    error: "No Product found in database"
                });
            }
            res.json(products)
        })
}

//To populate categories at Admin Panel
exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if(err){
            return res.status(400).json({
                error: "No Category Found"
            })
        }
        res.json(category);
    });
};



//middleware to update stock and sold

exports.updateStock = (req, res, next) => {
    let myOperations = req.body.order.products.map(prod => {
        return {
            updateOne : {
                filter: { _id: prod._id},
                update: { $inc: { stock: -prod.count, sold: +prod,count} }
            }
        };
    });

    Product.bulkWrite(myOperations, {}, (err, products) => {
        if(err){
            return res.status(400).json({
                error: "Updation of Stock and Sold products is failed"
            })
        }
        next();
    })

}