// Define Order class with properties for description, order number, and completion status
// =====================================================
class Order {
  constructor(description, orderNumber, completionStatus) {
    this.description = description;
    this.orderNumber = orderNumber;
    this.completionStatus = completionStatus;
  }
}

// Create a function to send a get request to the API for a meal using prompt() as the mainIngredient
// =====================================================
async function getMeal() {
  //DELETE STORE THE LAST ORDER NUMBER

  //DELETE check what is actually being stored in session storage on each modal

  try {
    // prompt the user for a main ingredient
    let mainIngredient = prompt(
      'please enter your (single) main ingredient of choice seperated by only spaces if its multiple words:'
    );

    // Lowercase the returned string
    mainIngredient = mainIngredient.toLowerCase();
    // Replace spaces with underscores
    mainIngredient = mainIngredient.replace(/ /g, '_');
    // Do the api call with the resulting string
    let apiResult = await fetch(
      'https://www.themealdb.com/api/json/v1/1/filter.php?i=' + mainIngredient
    );

    // Parse the network response from JSON
    let listOfMeals = await apiResult.json();
    //if the result from the api is null - the ingredient doesnt exist
    if (listOfMeals.meals === null) {
      alert(
        'The ingredient does not seem to exist on the server - please try again with a valid ingredient'
      );
      //RECURSION: use recursion to start the whole process again (call the main() function chain in this case - not this(getMeal()) function since that will lead to a dead end in the UI flow)
      main();
    } else {
      // Else continue adding the meal to orders
      // Choose a random array item number(i.e. choose a random meal). Done on a separate line for readability.
      let randomItemNumber = Math.floor(
        Math.random() * listOfMeals.meals.length
      );

      // Create the newly generated meal so we can use it later
      let meal = new Order(
        listOfMeals.meals[randomItemNumber].strMeal,
        1,
        false
      );
      // Return the newly created meal object for further processing
      return meal;
    }
  } catch (error) {
    //catch any error and log it
    console.error(error);
  }
}

// Create function to set an item as the order(meal is argument) and then initiate the order
// =====================================================
function setOrder(meal) {
  // Create an allOrders array to store all orders as an array of Meal objects.
  let allOrders = [];

  // Create a new Order instance with the selected item and add it to sessionStorage

  // If we already have orders in session storage: overwrite the existing one
  if (sessionStorage.getItem(`allOrders`)) {
    // retrieve the allOrders array (Use prefix "ss" and save the retrieved data as a new variable)
    let ssAllOrders = JSON.parse(sessionStorage.getItem(`allOrders`));
    // Add the meal to the retrieved array
    ssAllOrders.push(meal);
    // Create a unique order number: The number will be generated from the length of the ssAllOrders array +1
    let currentOrder = ssAllOrders.length;
    // and then add it to the orderNumber field within the object.
    ssAllOrders[ssAllOrders.length - 1].orderNumber = currentOrder;
    // overwrite the previous sessionstorage allOrders array with the latest array
    sessionStorage.setItem(`allOrders`, JSON.stringify(ssAllOrders));
    //set the last ordernumber as the latest order in session storage (overwrite any previous value)
    sessionStorage.setItem(`currentOrder`, JSON.stringify(currentOrder));
    //console.log currentOrderBumber
  } else {
    // Else add the meal to the first place in the array:
    allOrders.push(meal);
    // and save the array to sessionStorage for the first time:
    sessionStorage.setItem(`allOrders`, JSON.stringify(allOrders));
    //it is still the first order of this page load, so store the current order number as 1
    sessionStorage.setItem(`currentOrder`, 1);
  }
}

// Create a function to set a meal as complete or incomplete
function completeMeals() {
  //pull the sessionStorage array of all orders - prefix is ss
  let ssAllOrders = JSON.parse(sessionStorage.getItem('allOrders'));
  //filter the incomplete orders only and add them to a new array
  let incompleteOrders = ssAllOrders.filter((order) => !order.completionStatus);
  //to display the orders: create a string of each element and add each string to a new array (with .map())
  let displayIncompleteOrders = incompleteOrders.map(
    (order) => `Order no: ${order.orderNumber} - Name: ${order.description}`
  );
  //join the array into a single string with each array item on a new line
  displayIncompleteOrders = displayIncompleteOrders.join('\n');
  //ask user to choose an incomplete order to mark as complete
  let orderToComplete = Number(
    prompt(
      'please choose an order number to mark as complete, or alternatively enter zero to not mark anything complete. The currently incomplete orders are:\n' +
        displayIncompleteOrders
    )
  );
  // if the order number is outside the length of the array and is thus an invalid order number:
  if (orderToComplete > ssAllOrders.length && orderToComplete > 1) {
    alert('you did not enter a valid order number (or zero) please try again:');
    //RECURSION: call completeMeals() again since the user entered the wrong value
    completeMeals();
  }

  // If the user chooses to not complete an order: give the choice of either redisplaying incomplete orders OR starting the program again
  if (orderToComplete === 0) {
    alert(
      'You chose to not mark anything as complete.\n The program will now end'
    );
    // end the program, the user can just refresh if they want to go again
    return;
    // if the user chose to mark an order as complete:
  } else {
    // mark the order as active
    // check if the order is already marked as active(i.e. the order is false)
    if (!ssAllOrders[orderToComplete - 1].completionStatus) {
      // select the orderArrayItem and mark it as complete(true)
      ssAllOrders[orderToComplete - 1].completionStatus = true;
      // store the modified ssAllOrders array in sessionStorage
      sessionStorage.setItem(`allOrders`, JSON.stringify(ssAllOrders));
    } else {
      // the item has already been marked as complete, end the program and ask to refresh
      alert(
        'you have already marked this item as complete, please refresh and try again'
      );
    }
  }
}

// Write the main function chain
// =====================================================
//async function to wait for the API return;
async function main() {
  try {
    // Call getMeal() to ask the user for an ingredient and return a chosen dish from the API
    let meal = await getMeal();
    setOrder(meal);
    // Then display the current meals - next part of activity
    completeMeals();

    // I initially used recursion here on main(), but found I can't access dev tools on the page if I have an endless loop of Prompt dialogs, so I switched it off(thus its commented out).
    // main();
    // The user can simply press refresh if they want to restart.
  } catch (error) {
    console.error(error);
  }
}

// Initiate the main function chain
// =====================================================
main();
