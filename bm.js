var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");
var colors = require("colors");
var command = process.argv[2];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (error) {
    if (error) throw error;
    manageInventory();
});


// switch (command) {
//     case "Order Stock":
//     orderStock();
//     break;

//     case "View Current Inventory":
//     viewInventory();
//     break;

//     case "Add New Item":
//     addItem();
//     break;

//     case "Low Stock":
//     reorder();
//     break;
// };

//prompts user with list of optional commands.
function manageInventory() {
    inquirer.prompt(
        [{
            type: "list",
            name: "mOperations",
            message: colors.red("\n"+"~~Manager Operations~~"+"\n"),
            choices: ["Order Stock", "View Current Inventory", "Add New Item", "Low Stock: Urgent Re-Order", colors.red("Exit Manager Operations")]
        }]).then(function (answers) {
        if (answers.mOperations === "Order Stock") {
            orderStock();
        } else if (answers.mOperations === "View Current Inventory") {
            showInventory();
        } else if (answers.mOperations === "Add New Item") {
            addItem();
        } else if (answers.mOperations === "Low Stock: Urgent Re-Order") {
            reorder();
        } else {
            connection.end();
        }
    });
};
// shows a complete list of all items in the warehouse and their stock counts. This version will reroute back to the main operations prompt.
function showInventory() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (error, result) {
        var table = new Table({
            head: ["ID", "Item Name", "Department", "Price", "Stock"],
            style: {
                head: ["green"],
                compact: false,
                colAligns: ["center"]
            }
        });
        for (var i = 0; i < result.length; i++) {
            table.push(
                [result[i].item_id, result[i].product_name, result[i].department_name, "$"+result[i].price, result[i].stock_quantity]
            );
        }
        console.log("\n"+table.toString() + "\n");
        console.log("");
        console.log("");
        manageInventory();
    })
};
// the same as the last, except that it will not reroute the user.
function showInventoryM() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (error, result) {
        var table = new Table({
            head: ["ID", "Item Name", "Department", "Price", "Stock"],
            style: {
                head: ["green"],
                compact: false,
                colAligns: ["center"]
            }
        });
        for (var i = 0; i < result.length; i++) {
            table.push(
                [result[i].item_id, result[i].product_name, result[i].department_name, "$"+result[i].price, result[i].stock_quantity]
            );
        }
        console.log("\n"+table.toString() + "\n");
        console.log("");
        console.log("");
    })
};
// allows the user to add inventory of any item currently in the warehouse log.
function orderStock() {
    showInventoryM()
    inquirer.prompt([{
        type: "input",
        name: "product",
        message: colors.green("Which item should be ordered?\n")
    }, {
        type: "input",
        name: "order",
        message: "Quantity?"
    }]).then(function (answers) {
        var targetQuantity = answers.order
        var targetItem = answers.product
        var sql = "UPDATE products SET stock_quantity = ? WHERE item_id = ?"

        connection.query(sql, [answers.order, answers.product], function (error, result) {
            if (error) throw error;
            console.log("Products ordered!");
        })
        manageInventory();
    });
};
// shows the user the items in the warehouse that are below the "safe" threshold, then prompts the user to order more.
function reorder() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (error, result) {
        var table = new Table({
            head: ["ID", "Item Name", "Department", "Price", "Stock"],
            style: {
                head: ["green"],
                compact: false,
                colAligns: ["center"]
            }
        });
        for (var i = 0; i < result.length; i++) {
            if (result[i].stock_quantity < 30) {
                table.push(
                    [result[i].item_id, result[i].product_name, result[i].department_name, "$"+result[i].price, result[i].stock_quantity]
                );
            }
        }
        console.log(colors.red("Please Re-Order Low-Stock Items!"));
        console.log("\n" + table.toString() + "\n");
        inquirer.prompt([{
            type: "input",
            name: "product",
            message: colors.green("Which item should be ordered?\n")
        }, {
            type: "input",
            name: "order",
            message: "Quantity?"
        }]).then(function (answers) {
            var targetQuantity = answers.order
            var targetItem = answers.product
            var sql = "UPDATE products SET stock_quantity = ? WHERE item_id = ?"
    
            connection.query(sql, [answers.order, answers.product], function (error, result) {
                if (error) throw error;
                console.log("Products ordered!");
                manageInventory();
            })
        });
    })
}
// gives the user the ability to add a new item to the warehouse log, thereby enabling the tracking, sale, and replenishment of said product.
function addItem() {
    inquirer.prompt([{
            type: "input",
            name: "newItem",
            message: colors.blue("New Item Name?"),
        },
        {
            type: "input",
            name: "dept",
            message: "What Department does this belong in?"
            // choices: ["Food", "Toys", "Furniture", "Clothing", "Tools"]
        },
        {
            type: "input",
            name: "pricing",
            message: "What is the value of this item?"
        },
        {
            type: "input",
            name: "addinv",
            message: "How many would you like to order?"
        }
    ]).then(function (answers) {
        var query = connection.query("INSERT INTO products SET ?", {
                product_name: answers.newItem,
                department_name: answers.dept,
                price: answers.pricing,
                stock_quantity: answers.addinv
            },
            function (errror, result) {
                console.log(colors.green("Updated Inventory!"));
                showInventory();
            });
    })
}
//depricated: previous iteration of a function used as a callback.

// function cont() {
//     inquirer.prompt([{
//         type: "list",
//         name: "continue",
//         message: "Return to the menu or exit the inventory manager?",
//         choices: ["MENU", colors.red("EXIT")]
//     }]).then(function(answers){
//         if (answers.continue === "MENU") {
//             manageInventory();
//         }
//         else if (answers.continue === "EXIT") {
//             console.log("Terminating Connection");
//             connection.end();
//         }
//     })
// }