var mysql = require("mysql");
var inquirer = require("inquirer");

//setup for connection to the database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "bamazon_db"
});

//connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  
});
//list the products available
function display (){
	var query = connection.query("SELECT * FROM products", function(err, res){
    if (err) throw err;
    for (var i=0; i<res.length; i++){
      console.log("Item # " + res[i].id + " "+res[i].product_name + " in "+ res[i].department_name+" @ $"+res[i].price + ".00 ea.");
    }
    console.log("________________________________________");
    ask();
  })
}
display();
  

//ask the user for order
  function ask(){ 
  inquirer.prompt([
    { type: "input",
      name: "id",
      message: "Enter the item # for the items you would like to purchase",
      validate: validateInput,
      filter: Number
    },
    {
    type: "input",
    name:  "quantity",
    message: "How Many?",
    validate: validateInput,
    filter: Number
    }
    ]).then(function(input){
      var query = connection.query("SELECT * FROM products WHERE ?",
        [ {id: input.id}],
        function(err, data){
        if (err)throw err;
        if (data.length === 0){
          console.log("Please select a valid ID");
          
        }else{
          var productData = data[0];
          if (input.quantity <= productData.stock_quantity) {
            console.log("Processing Order");

            var updateQueryStr = "UPDATE products SET stock_quantity = " + (productData.stock_quantity - input.quantity) + " WHERE id = " + input.id;

            var query1 = connection.query(updateQueryStr, function(err, data){
              if (err) throw err;
              console.log("Your total is: $" + productData.price * input.quantity);
              console.log("Your order is on its way.");
              console.log("_______________________________________");
              //connection.end();
            })
           }else{
            console.log("Part of your order is out of Stock.  Please try again later or modify your order");
            console.log("_________________________________________");
            display();
           }
        }
     })
  })
}
//make sure the user enters a number
function validateInput(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && (sign === 1)) {
    return true;
  } else {
    return "Please enter whole numbers only.";
  }
}



     