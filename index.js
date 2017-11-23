/*
  A Writing Sprints bot.
  It should only join 1 channel.
*/

// import the discord.js module
const Discord = require('discord.js');
const validator = require('validator');

// Local imports
var commands = require('./commands.js');
const config = require('./config.js');

// Config
const token = config.token;
const channel = config.channel;

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// Like doc.ready but for bots
bot.on('ready', () => {
    commands.DailyTimer();
    console.log('WritingBot is ready to go.');
    //bot.channels.get(channel).sendMessage("Hello. This bot will go offline in 3 days. \nIn order to self-host: https://github.com/LampUploads/Jeremy-Writing-Bot");

});

// create an event listener for messages
bot.on('message', message => {

    if (CheckCommand(message.content)) {
        ProcessInput(message);
    }

});

function CheckCommand(message) {
    if (message.charAt(0) === "_") {
        return true;
    } else {
        return false;
    }
}

function ProcessInput(message) {
    var broken = message.content.split(' ');
    var command = broken[0].toLowerCase();
    var param1;
    if (broken[1] != null) {
        param1 = broken[1];
        if (validator.isInt(param1)) {
            if (param1 >= 0) {

                switch (command) {
                    case "_sprint":
                        message.reply(commands.SprintCommand(param1));
                        break;
                    case "_wc":
                        message.reply(commands.WcCommand(param1, message.author.id, message.author.username));
                        break;
                    case "_join":
                        message.reply(commands.JoinCommand(param1, message.author.id, message.author.username))
                        break;
                    case "_dailygoal":
                        message.reply(commands.DailyGoalCommand(param1, message.author.id, message.author.username))
                        break;
                    case "_wcg":
                        message.reply(commands.WcgCommand(param1, message.author.id, message.author.username))
                        break;

                    default:
                        break;
                }
            } else {
                message.reply("Don't be so negative. Positive numbers only.");
            }
        } else {
            message.reply("Please use a number as an parameter.");
        }
    } else {
        switch (command) {
            case "_join":
                message.reply(commands.JoinCommand(param1, message.author.id, message.author.username))
                break;
            case "_cancel":
                message.reply(commands.CancelCommand())
                break;
            case "_help":
                message.reply(commands.HelpCommand())
                break;
            case "_time":
                message.reply(commands.TimeCommand())
                break;
            case "_quote":
                message.reply(commands.QuoteCommand())
                break;
            case "_disablegoal":
                message.reply(commands.DisableDailyGoalCommand(message.author.id))
                break;

            default:
                break;
        }
    }
}

// Messager
exports.Talk = function (message) {
    bot.channels.get(channel).sendMessage(message);
}


// log our bot in
bot.login(token);