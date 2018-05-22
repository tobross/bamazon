var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");
var colors = require("colors");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
// connects to the database.
connection.connect(function (error) {
    if (error) throw error;
    sup();
});
// shows the user a list of Supervisor options.
function sup() {
inquirer.prompt({
    type: "list",
    name: "menuSelect",
    message: "~~Supervisor Functions~~",
    choices: ["View Sales by Dept.", "Create New Dept.", "Exit Supervisor Mode"]
}).then(function(answers){
    if (answers.menuSelect === "View Sales by Dept.") {
        salesByDept();
    }
    else if (answers.menuSelect === "Create New Dept."){
        createDept();
    }
    else {
        console.log(colors.red("Connection Terminated"))
        connection.end();
    }
});
};
// populates and shows the user a table filled with data from the departments log, this data is affected by the sale of items through the customer client.
function salesByDept() {
        connection.query('SELECT * FROM departments', function(err, res) {
            if (err) throw err;
    
            var table = new Table({
                head: ["Department ID", "Department Name", "Overhead Costs", "Product Sales", "Total Profit"],
                style: {
                    head: ["cyan"],
                    compact: false,
                    colAligns: ["center"]
                }
            });
            
            for(var i = 0; i < res.length; i++) {
                var profit = parseFloat(res[i].product_sales - res[i].over_head_costs).toFixed(2);
    
                table.push(
                    [res[i].department_id, res[i].department_name, parseFloat(res[i].over_head_costs).toFixed(2), "$"+parseFloat(res[i].product_sales).toFixed(2), profit]
                );
            }
            
            console.log(table.toString());
            sup();
})
};
// gives the user the ability to add a new department, which can then be populated by new items in the Management client.
function createDept() {
    inquirer.prompt([
        {
            type: "input",
            message: "Which new department would you like to add?",
            name: "dptName"
        },
        {
            type: "number",
            message: "What is this department's overhead cost?",
            name: "dptOverhead"
        },
        {
            type: "number",
            message: "Are there any current sales for the department?",
            name: "dptSales"
        },
        ]).then(function (user) {
            connection.query("INSERT INTO departments SET ?", {
                department_name: user.dptName,
                over_head_costs: user.dptOverhead,
                product_sales: user.dptSales
            }, function(err, res) {
                if(err) throw err;
    
                console.log("\nNew department added!\n");
                sup();
            });
        });
};

