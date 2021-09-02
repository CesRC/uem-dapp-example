App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("PictureLikeSystem.json", function (pictureLikeSystem) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.PictureLikeSystem = TruffleContract(pictureLikeSystem);
      // Connect provider to interact with contract
      App.contracts.PictureLikeSystem.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.PictureLikeSystem.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.likedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function () {
    var pictureLikeSystemInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    console.log("Loading contract data")
    App.contracts.PictureLikeSystem.deployed().then(function (instance) {
      pictureLikeSystemInstance = instance;
      console.log(pictureLikeSystemInstance.picturesCount())
      return pictureLikeSystemInstance.picturesCount();
    }).then(function (picturesCount) {
      var pictureResults = $("#pictureResults");
      console.log(pictureResults)
      pictureResults.empty();

      var pictureSelect = $('#pictureSelect');
      pictureSelect.empty();

      for (var i = 1; i <= picturesCount; i++) {
        pictureLikeSystemInstance.pictures(i).then(function (picture) {
          console.log(picture)
          var id = picture[0];
          console.log("ID:" + id)
          var name = picture[1];
          console.log("NAME: " + name)
          var likeCount = picture[2];
          console.log("LIKE COUNT: " + likeCount)
          // Render picture Result
          var pictureTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + likeCount + "</td></tr>"
          pictureResults.append(pictureTemplate);
          // Render picture ballot option
          var pictureOption = "<option value='" + id + "' >" + name + "</ option>"
          pictureSelect.append(pictureOption);
        });
      }
      return pictureLikeSystemInstance.users(App.account);
    }).then(function (hasVoted) {
      // Do not allow a user to vote
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  castVote: function () {
    var pictureId = $('#pictureSelect').val();
    App.contracts.PictureLikeSystem.deployed().then(function (instance) {
      return instance.like(pictureId, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
