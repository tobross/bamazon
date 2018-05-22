var mysql = require("mysql");
var prompt = require("prompt");
var colors = require("colors/safe");
var Table = require("cli-table");
var welcomeDeco = colors.magenta("(¯`·._.·(¯`·._.·(¯`·._.· "+colors.green.underline("Welcome to ")+colors.yellow.underline("BAMAZON!")+" ·._.·´¯)·._.·´¯)·._.·´¯)");
var deco = colors.magenta("°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸");
var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "bamazon", 
});

var productPurchased = [];
// connection made
connection.connect();
console.log(deco);
console.log(welcomeDeco);
console.log(deco);

//display table of products available for sale.
connection.query("SELECT item_id, product_name, price FROM products", function(err, result){
	if(err) console.log(err);

	var table = new Table({
		head: ["item_id", "product_name", "price"],
		style: {
			head: ["green"],
			compact: false,
			colAligns: ["center"],
		}
	});

	for(var i = 0; i < result.length; i++){
		table.push(
			[result[i].item_id, result[i].product_name, "$"+result[i].price]
		);
	}
	console.log(table.toString());

	purchase();
});
//allows user to make a selection and purchase items.
var purchase = function(){

	var productInfo = {
		properties: {
			item_id:{description: colors.green("Please enter the ID # of the item you wish to purchase!")},
			stock_quantity:{description: colors.green("How many items would you like to purchase?")}
		},
	};

	prompt.start();

	prompt.get(productInfo, function(err, res){

		var custPurchase = {
			item_id: res.item_id,
			stock_quantity: res.stock_quantity
		};
		
		productPurchased.push(custPurchase);
		// console.log(custPurchase);
	
		connection.query("SELECT * FROM products WHERE item_id=?", productPurchased[0].item_id, function(err, res){
				if(err) console.log(err, "That item ID doesn't exist");
				
				if(res[0].stock_quantity < productPurchased[0].stock_quantity){
					console.log(colors.red("That product is out of stock!"));
					connection.end();


				} else if(res[0].stock_quantity >= productPurchased[0].stock_quantity){

					console.log(deco);
					console.log("");
					console.log(productPurchased[0].stock_quantity + " items purchased");
					console.log("");
					console.log(res[0].product_name + " at " + "$" + res[0].price + " each.");
					console.log("");
			
					var saleTotal = res[0].price * productPurchased[0].stock_quantity;


					connection.query("UPDATE departments SET product_sales = ? WHERE department_name = ?;", [saleTotal, res[0].department_name], function(err, resultOne){
						if(err) console.log(colors.red("error: " + err));
						return resultOne;
					})

					console.log("Total: " + "$" + saleTotal);
					console.log("");


					newQuantity = res[0].stock_quantity - productPurchased[0].stock_quantity;
			

					connection.query("UPDATE products SET stock_quantity = " + newQuantity +" WHERE item_id= " + productPurchased[0].item_id, function(err, res){

						console.log(deco);
						console.log(colors.cyan("Your order has been processed."));
						console.log(colors.cyan("Thank you for shopping "+ colors.yellow("BAMAZON!")));
						console.log(deco);

						connection.end();
					})

				};

		})
	})

};