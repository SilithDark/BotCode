var helpers = require('./helpers.js');
var bot = require('./index.js')
var commands = require('./commands.js');

// Timeout objects
var untilTimer;
var sprintTimer;
var finishTimer;


/**
 * Will countdown until "until" is up, then start the Sprint - using a countdown.
 * 
 * @param until {int} until it begins
 * @param duration {int} duration of sprint
 */
exports.StartCoundown = function (until, duration) {

    // Counts down to start
    untilTimer = setTimeout(() => {
        bot.Talk(`Sprint has started! \nDuration: ${duration} minute(s).`);
        sprintTimer = setTimeout(finishCountdown, helpers.toMilliseconds(duration));
    }, helpers.toMilliseconds(until));
}

/**
 * Callback to finish the sprint and announce winners.
 * 
 */
function finishCountdown() {
    bot.Talk('Time is up. You have 2 minutes to update your wordcount using _wc.')
    bot.Talk(commands.NotifyParticipants());

    finishTimer = setTimeout(() => {

        bot.Talk(commands.AnnounceWinners());

    }, helpers.toMilliseconds(2));
}


/**
 * Clears all timers.
 */
exports.ClearTimers = function () {
    clearTimeout(untilTimer);
    clearTimeout(sprintTimer);
    clearTimeout(finishTimer);
}