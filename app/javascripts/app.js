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
      var isApproved = false;

      metaToken.approve(metaExchange.address, volume, {from: account}).then(function(tx_id) {
        // setStatus("Approval result: " + tx_id);
        if (isApproved) {
          setStatus("Can now create order");
        }
      }).catch(function(e) {
        console.log("Error: " + e);
        setStatus(e);
        return;
      });

      var events = metaToken.Approval({fromBlock: blocknumber, toBlock: 'latest'});
      events.watch(function(error, result) {
          if (error == null && result.args._owner == account && result.args._spender == metaExchange.address && result.args._value.c[0] >= volume) {
            setStatus("Approved for " + result.args._value.c[0] + " units ");
            isApproved = true;
          } else {
            setStatus("Event: " + error + " result " + result);
          }
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
