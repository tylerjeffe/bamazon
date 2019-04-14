var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
  
   
    port: 3306 ,
  
    // Your username
    user: "root",
  
    // Your password
    password: "password",
    database: "bamazon"
  });

   connection.connect(function(err) {
     if (err) throw err;
     console.log("connected");
     connection.query("SELECT * FROM products", function(err, res) {
         if (err) throw err;
         console.log(res);
         whatDoYouWant();
      });
   })
   function whatDoYouWant() {
     inquirer
       .prompt([{
         name: "enterID",
         type: "input",
         message: "Enter the item id of the product you would like to purchase",
       },
       {
         name: "quantity",   
         type: "input", 
         message: "How many would you like to purchase?"
       }
     ]).then(function(answer){      
         var query = "SELECT stock_quantity, price FROM products WHERE ? "
         connection.query(query, {item_id: answer.enterID}, async function(err, res){
               console.log(res)
               console.log('Quantity Left:  ', res[0].stock_quantity);
               console.log('Price:  ', res[0].price);          
              if (res[0].stock_quantity < answer.quantity) {
                  console.log("We're sorry, we currently do not have enough of that product in stock to process your order. Please try back again.");
                  connection.end();
              } else {
                  let remainingQuantity = parseInt(res[0].stock_quantity) - parseInt(answer.quantity)
             await orderSubmit(remainingQuantity, answer.productId).then(() => {
                 console.log('Your total is $' + res[0].price * parseInt(answer.quantity))
             })
         } 
     })
 })
   }
 
async function orderSubmit(quantity, id) {
     await connection.query(
         "UPDATE products SET ? WHERE ?",
         [{
                 stock_quantity: quantity
             },
             {
                 item_id: id
             }
         ]);
         console.log("Updated stock count: " + quantity)
    setTimeout(whatDoYouWant, 2000);
}