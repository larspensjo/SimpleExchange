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
  if (isNaN(volume) || isNaN(unitPrice)) {
    total_price_element.innerHTML = "";
    return;
   }
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
  var metaExchange = SimpleExchange.deployed();

  var registry = 0;
  var token = document.getElementById("token").value;
  var volume = parseFloat(document.getElementById("amount").value);
  var unitPrice = parseFloat(document.getElementById("unit_price").value);

  setStatus("Launching sell order of " + volume + " for total " + volume * unitPrice + " ether...");

  metaExchange.createOffer(volume, volume * unitPrice, token, registry, {from: account}).then(function(tx_id) {
    setStatus("Created order " + tx_id);
  }).catch(function(e) {
    console.log(e);
    setStatus("Error next order; see log.");
  });
};
      var abi = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
      var MyContract;
      var myContractInstance;
      var events;

function checkAllowanceAndCreateOrder() {
  setStatus("");
  var metaToken = Standard_Token.at(document.getElementById("token").value);
  var metaExchange = SimpleExchange.deployed();

  var volume = parseFloat(document.getElementById("amount").value);
  var unitPrice = parseFloat(document.getElementById("unit_price").value);
  var totalPrice = volume * unitPrice;

  if (totalPrice <= 0.0 || isNaN(totalPrice)) {
    setStatus("Set volume and price first ");
    return;
  }

  var blocknumber = web3.eth.blockNumber;

  metaToken.allowance.call(account, metaExchange.address, {from: account}).then(function(value) {
    if (parseFloat(value) >= totalPrice)
      createOrder();
    else {
      setStatus("Requesting approval for " + volume + " units");

      metaToken.approve(metaExchange.address, volume, {from: account}).then(function(tx_id) {
        setStatus("Approval result: " + tx_id);
      }).catch(function(e) {
        console.log("Error: " + e);
        setStatus(e);
        return;
      });

      MyContract = web3.eth.contract(abi);
      myContractInstance = MyContract.at(document.getElementById("token").value);
      events = myContractInstance.allEvents({fromBlock: blocknumber, toBlock: 'latest'});
      events.watch(function(error, result) {
          setStatus("Event: " + error + " result " + result);
      });
    }
  }).catch(function(e) {
    console.log("Error: " + e);
    setStatus(e);
    return;
  });
}

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
