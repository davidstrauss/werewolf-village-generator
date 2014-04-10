/**
 *
 * Various utility functions to help with parsing commands, hangling common tasks, etc.
 */

var _ = require("lodash");

module.exports = function (settings, cb) {
  var defaults, village, deck, villageDeck = [], villageStats = {balance: 0, extraDeaths: 0, nightActives: 0};

  defaults = {
    villageSize: 10,
    balance: 0,          // The balance of all the teams.  Most people consider 0 to be an ideal game.
    minExtraDeaths: 0,   // About how many extra deaths you want to happen in this game.
    maxExtraDeaths: 3,
    minNightActive: 1,
    maxNightActive: 2,   // Max ammount of characters that are allowed at night.  Increase or decrease based on how long you want your nights to be.
    giveUp: 100,         // How many tries the algorithm will do until it gives up trying to create a game that meets your balance, extraDeaths, and night active requirements
    requiredCharacters: {"Villager": 2, "Werewolf": 1, "Seer": 1}, // Specifies minium required of particular characters.
    blacklistedCharacters: [],
    deck: "testDeck"     // deck JSON file to use -- Ultimate_Werewolves, Werewolves, etc.
  };

  function canAdd(extraDeaths, nightActive) {
    if (((villageStats.extraDeaths + extraDeaths) <= settings.maxExtraDeaths) && ((villageStats.nightActives + nightActive) <= settings.maxNightActive)) {
      return true;
    }
  }

  function getCardsWeCanAdd() {
    var possibleCards = [];

    _.each(_.keys(deck), function (character) {
      var info = deck[character];

      if (canAdd(info.extraDeaths, info.nightActive)) {
        possibleCards.push(character);
      }
    });

    return possibleCards;
  }

  function addCharacter(character) {
    if (deck[character].availableCards === 0) {
      return new Error("There are no more " + character + " cards left to add to the deck!");
    }

    if (!canAdd(deck[character].extraDeaths, deck[character].nightActive)) {
      return new Error("It is not possible to add a " + character + " to the deck and still meet your extraDeaths and nightActives requirements!");
    }

    deck[character].availableCards -= 1;
    villageStats.balance += deck[character].value;
    villageStats.extraDeaths += deck[character].extraDeaths;
    villageStats.nightActives += deck[character].nightActive;

    villageDeck.push(character);
  }

  function generateVillage(cb) {
    var error = null, availableCards;

    // Required characters/cards need to be added first.
    _.each(_.keys(settings.requiredCharacters), function (character) {
      if (_.isUndefined(deck[character])) {
        error = new Error(character + "is not in the " + settings.deck + " deck!");
        return false;
      }

      error = addCharacter(character);
      if (error instanceof Error) { return false; }
    });

    if (error) { return cb(error); }

    // Pass 1 - Generate a random deck with our required characters that meets our maxExtraDeaths and maxNightActive requirements
    while (villageDeck.length !== settings.villageSize) {
      availableCards = getCardsWeCanAdd();

      if (availableCards.length === 0) {
        throw new Error("No possible deck!");
      }

      addCharacter(availableCards[Math.floor((Math.random() * availableCards.length))]);
    }

    // Pass 2 - Meet Min Extra Deaths Requirement

    // Pass 3 - Meet Min Night Active Requirement

    // Pass 4 - Meet Balance Requirement

    cb(null);
  }

  village = {
    getVillageDeck: function () {
      return villageDeck;
    }
  };

  // Initialization
  settings = _.defaults(settings, defaults);

  try {
    // Cloning so we can modify the available cards on the fly
    deck = _.cloneDeep(require(__dirname + "/../decks/" + settings.deck));
  } catch (ex) {
    return cb(ex);
  }

  generateVillage(function (error) {
    if (error) { return cb(error); }
    cb(null, village);
  });
};
