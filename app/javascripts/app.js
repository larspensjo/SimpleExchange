var accounts;
var account;
var balance;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function updateTotalPrice() {
  var volume = parseFloat(document.getElementById("amount").value);
  var unitPrice = parseFloat(document.getElementById("unit_price").value);
  var total_price_element = document.getElementById("total_price");
  total_price_element.innerHTML = volume * unitPrice;
};

function getBalance() {
  setStatus("");
  var meta = Standard_Token.at(document.getElementById("token").value);

  meta.balanceOf.call(account, {from: account}).then(function(value) {
    var balance_element = document.getElementById("balance");
    balance_element.innerHTML = value.valueOf();
  }).catch(function(e) {
    console.log("Error: " + e);
    setStatus(e);
  });
};

function createOrder() {
  setStatus("");
  var metaExchange = SimpleExchange.deployed();
  
  var registry = 0;
  var token = document.getElementById("token").value;
  var volume = parseFloat(document.getElementById("amount").value);
  var unitPrice = parseFloat(document.getElementById("unit_price").value);
  setStatus("Launching sell order of " + volume + " for total " + volume * unitPrice + " ether...");

  metaExchange.createOffer(volume, volume * unitPrice, token, registry, {from: account}).then(function(value) {
    setStatus("Created order " + value);
  }).catch(function(e) {
    console.log(e);
    setStatus("Error next order; see log.");
  });
};

function sendCoin() {
  var meta = SimpleExchange.deployed();

  var amount = parseInt(document.getElementById("amount").value);
  var receiver = document.getElementById("receiver").value;

  setStatus("Initiating transaction... (please wait)");

  meta.sendCoin(receiver, amount, {from: account}).then(function() {
    setStatus("Transaction complete!");
    refreshBalance();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
};

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
  });
}
