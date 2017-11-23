// Dependancies
var Map = require('collections/map');
// Local imports
var timers = require('./timers.js');
var User = require('./user.js');
var fs = require('fs');

// Variables
var ongoingSprint = false;
var storage;
var sprintParticipants;
try {
    storage = require('./storage.json');
    sprintParticipants = new Map(storage);

    sprintParticipants.forEach(currentItem => {
        sprintParticipants.set(currentItem.id, new User(currentItem.id, currentItem.username, currentItem.wordcount, currentItem.startCount, currentItem.goal, currentItem.dailyGoal, currentItem.dailyGoalAmount, currentItem.inSprint));
    });

    console.log('Loaded storage.');

} catch (e) {
    sprintParticipants = new Map();
    console.log('Couldn\'t parse JSON.');
}



var start;
var durr = 0;

/**
 * Method to start a Writing Sprint
 * 
 * @param {any} Duration - Duration of sprint in minutes
 */
exports.SprintCommand = function (duration = 10) {
    if (ongoingSprint) {
        return 'Already a sprint in progress. To participate: _join (wordcount)';
    } else {
        if (duration > 45) {
            return 'Sprints can be no longer than 45 minutes.';
        } else {
            // Begin timer
            timers.StartCoundown(1, duration);

            var d = new Date();
            d.setMinutes(d.getMinutes() + 1);
            start = d;

            ongoingSprint = true;
            durr = duration;
            console.log(`A sprint of ${duration} minutes has been started.`);
            return `Sprint will start in 1 minute. \nDuration: ${duration} minutes. \nTo participate type: _join (wordcount)`;
        }
    }
}

/**
 * Method to have a person join a sprint.
 * 
 * @param {any} Broken - Array of parameters 
 */
exports.JoinCommand = function (startCount = 0, id, username) {
    if (ongoingSprint) {

        // Because the ECMAScript thing is letting me down
        if (startCount === undefined) {
            startCount = 0;
        }

        if (sprintParticipants.has(id)) {
            sprintParticipants.get(id).setStartCount(startCount);
            sprintParticipants.get(id).setInSprint(true);

            // log
            console.log(`${username} has joined the sprint with ${startCount} words.`)

            return ` has joined the sprint. Starting count: ${startCount} words.`
        } else {

            // Construct User Object to hold various data
            var u = new User(id, username, 0, startCount);

            // Add users to array of participation members: value / key
            sprintParticipants.add(u, id);
            sprintParticipants.get(id).setInSprint(true);

            // log
            console.log(`New User: ${username} has joined the sprint with ${startCount} words.`)

            // send a reply
            return ` has joined the sprint. Starting count: ${startCount} words.`
        }

    } else {
        return 'No current writing sprint. \n Start one using _sprint *duration*';
    }
}

/**
 * Method to update your wordcount during a sprint
 * 
 * @param {any} broken - Array of parameters
 */
exports.WcCommand = function (words = 0, id, username) {
    if (ongoingSprint) {

        var record = sprintParticipants.get(id);

        if (!sprintParticipants.has(id)) {
            return 'You haven\'t joined the sprint, _join first.';
        } else {
            // Because the ECMAScript thing is letting me down
            if (words === undefined) {
                words = 0;
            }

            var startCount = record.startCount;
            var difference = (words - startCount);

            sprintParticipants.get(id).setWordCount(difference);
            console.log(`${username} has written ${difference} words.`);


            return `${username} has written ${difference} words.`;
        }

    } else {
        return 'No current writing sprint. \n Start one using: _sprint (duration)';
    }
}

/**
 * Updates the goal without the need for a sprint.
 */
exports.WcgCommand = function (words = 0, id, username) {

    if (!sprintParticipants.has(id) || sprintParticipants.get(id).getGoal() === 0) {
        return 'You haven\'t set a goal.';
    } else {
        // Because the ECMAScript thing is letting me down
        if (words === undefined) {
            words = 0;
        }

        sprintParticipants.get(id).substractGoal(words);
        var remaining = sprintParticipants.get(id).getGoal();

        fs.writeFile('storage.json', JSON.stringify(sprintParticipants), "utf8", () => {
            console.log('Saved to JSON file.');
        });

        if (remaining <= 0) {
            sprintParticipants.get(id).setGoal(0);
            return `\n:star: ${sprintParticipants.get(id).username} has achieved their goal of ${sprintParticipants.get(id).getDailyGoalAmount()} words! :star:`;
        } else {
            return `${username} has written ${words} words. \n:star: Only ${remaining} words to go until you hit your daily goal! :star:`;
        }
    }
}

/**
 * Resets the sprint.
 * 
 */
exports.CancelCommand = function () {

    // Removes timers
    timers.ClearTimers();

    start = null;
    durr = 0;

    if (ongoingSprint) {

        // Closes the sprint
        ongoingSprint = false;

        return 'Reset the sprint.';
    } else {
        return 'No current sprint.';
    }

}

/**
 * If there is an ongoing sprint, report remaining time.
 * 
 */
exports.TimeCommand = function () {
    if (ongoingSprint) {
        var current = new Date();
        var durationLeft = (durr * 60) - ((current - start) / 1000);

        var seconds = Math.floor(durationLeft % 60);
        var minutes = Math.floor(durationLeft / 60);


        return `${minutes} minutes and ${seconds} seconds left in current sprint.`;
    } else {
        return 'No current sprint.'
    }
}

/**
 * Sets a daily goal for the user.
 */
exports.DailyGoalCommand = function (words, id, username) {
    var u = new User(id, username, 0, 0);

    if (sprintParticipants.has(id)) {
        sprintParticipants.get(id).setGoal(words);
        sprintParticipants.get(id).setDailyGoalAmount(words);
        sprintParticipants.get(id).enableDaily();
    } else {
        sprintParticipants.add(u, id);
        sprintParticipants.get(id).setGoal(words);
        sprintParticipants.get(id).setDailyGoalAmount(words);
        sprintParticipants.get(id).enableDaily();
    }

    return `You\'ve set a daily goal of ${words} words. \nWords written during a sprint will count towards your goal. \nThese reset every 24 hours.\nYou can also use _wcg to log progress to your goal outside of sprints.`
}

/**
 * Quote
 */
exports.QuoteCommand = function () {
    return QuoteGenerator();
}

function QuoteGenerator() {
    var QuotesArray = [
        '```We are all apprentices in a craft where no one ever becomes a master.``` - Ernest Hemingway',
        '```I do not over-intellectualise the production process. I try to keep it simple: Tell the damned story.``` - Tom Clancy, WD',
        '```I don’t believe in being serious about anything. I think life is too serious to be taken seriously.``` - Ray Bradbury, WD',
        '```lot is no more than footprints left in the snow after your characters have run by on their way to incredible destinations.``` - Ray Bradbury, WD',
        '```It’s none of their business that you had to learn to write. Let them think you were born that way.``` - Ernest Hemingway',
        '```When writing a novel a writer should create living people; people, not characters. A character is a caricature.``` - Ernest Hemingway',
        '```I try to create sympathy for my characters, then turn the monsters loose.``` - Stephen King',
        '```It is perfectly okay to write garbage—as long as you edit brilliantly.``` - C. J. Cherryh',
        '```It took me fifteen years to discover I had no talent for writing, but I couldn’t give it up because by that time I was too famous.``` - Robert Benchley',
        '```First, find out what your hero wants, then just follow him!``` - Ray Bradbury',
        '```I love deadlines. I like the whooshing sound they make as they fly by.``` - Douglas Adams',
        '```I went for years not finishing anything. Because, of course, when you finish something you can be judged.``` - Erica Jong',
        '```There’s no such thing as writer’s block. That was invented by people in California who couldn’t write.``` - Terry Pratchett',
        '```Commander Vimes didn’t like the phrase “The innocent have nothing to fear,” believing the innocent had everything to fear, mostly from the guilty but in the longer term even more from those who say things like “The innocent have nothing to fear".`` - Terry Pratchett, Snuff',
        '```The truth may be out there, but the lies are inside your head.``` - Terry Pratchett',
        '```I have no use for people who have learned the limits of the possible.``` - Terry Pratchett',
        '```A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools.``` - Douglas Adams',
        '```Prose is architecture, not interior decoration.``` - Ernest Hemingway',
        '```There’s something brittle in me that will break before it bends.``` - Mark Lawrence, Prince of Thorns',
        '```There is nothing to writing. All you do is sit down at a typewriter and bleed.``` - Ernest Hemingway',
        '```One day I will find the right words, and they will be simple.``` - Jack Kerouac, The Dharma Bums',
        '```And by the way, everything in life is writable about if you have the outgoing guts to do it, and the imagination to improvise. The worst enemy to creativity is self-doubt.``` - Sylvia Plath, The Unabridged Journals of Sylvia Plath',
        '```You must stay drunk on writing so reality cannot destroy you.``` - Ray Bradbury, Zen in the Art of Writing',
        '```Don\'t tell me the moon is shining; show me the glint of light on broken glass.``` - Anton Chekhov',
        '```Writing is a socially acceptable form of schizophrenia.``` - E.L. Doctorow',
        '```Start writing, no matter what. The water does not flow until the faucet is turned on.``` - Louis L\'Amour',
        '```Stories may well be lies, but they are good lies that say true things, and which can sometimes pay the rent.``` - Neil Gaiman',
        '```So it goes.``` - Kurt Vonnegut, Slaughterhouse-Five',
        '```The first draft of anything is shit.``` - Ernest Hemingway',
        '```Tomorrow may be hell, but today was a good writing day, and on the good writing days nothing else matters.``` - Neil Gaiman',
        '```This is how you do it: you sit down at the keyboard and you put one word after another until its done. It\'s that easy, and that hard.``` - Neil Gaiman',
        '```Imagination is like a muscle. I found out that the more I wrote, the bigger it got.``` - Philip José Farmer',
        '```If you want to write, if you want to create, you must be the most sublime fool that God ever turned out and sent rambling. \nYou must write every single day of your life. \nYou must read dreadful dumb books and glorious books, and let them wrestle in beautiful fights inside your head, vulgar one moment, brilliant the next. \nYou must lurk in libraries and climb the stacks like ladders to sniff books like perfumes and wear books like hats upon your crazy heads. \nI wish you a wrestling match with your Creative Muse that will last a lifetime. \nI wish craziness and foolishness and madness upon you. \nMay you live with hysteria, and out of it make fine stories — science fiction or otherwise. \nWhich finally means, may you be in love every day for the next 20,000 days. And out of that love, remake a world.``` - Ray Bradbury',
        '```Description begins in the writer’s imagination, but should finish in the reader’s.``` - Stephen King, On Writing: A Memoir of the Craft',
        '```Words do not express thoughts very well. They always become a little different immediately after they are expressed, a little distorted, a little foolish.``` - Hermann Hesse',
        '```Easy reading is damn hard writing.``` - Nathaniel Hawthorne',
        '```Any word you have to hunt for in a thesaurus is the wrong word. There are no exceptions to this rule.``` - Stephen King',
        '```My aim is to put down on paper what I see and what I feel in the best and simplest way.``` - Ernest Hemingway',
        '```A non-writing writer is a monster courting insanity.``` - Franz Kafka',
        '```Amateurs sit and wait for inspiration, the rest of us just get up and go to work.``` - Stephen King, On Writing: A Memoir of the Craft',
        '```Write with the door closed, rewrite with the door open.``` - Stephen King, On Writing: A Memoir of the Craft'
    ];

    return QuotesArray[Math.floor(Math.random() * QuotesArray.length)];
}


/**
 * Disables the goal.
 */
exports.DisableDailyGoalCommand = function (id) {
    if (sprintParticipants.has(id)) {
        sprintParticipants.get(id).disableDaily();
    } else {
        return `You haven\'t set a daily goal!`;
    }
    return `You\'ve disabled your goal.`
}

// NO PLACE FOR THE WICKED


/**
 * Sends a mention to all participants.
 * 
 */
exports.NotifyParticipants = function () {
    var players = "";

    sprintParticipants.forEach(currentItem => {
        if (currentItem.getInSprint()) {
            var x = "<@!" + currentItem.id + ">" + " ";
            players += x;
        }
    });
    return players;
}

exports.HelpCommand = function () {
    return '```_sprint (duration in minutes) - Starts a sprint of the input duration \n_join (wordcount) - Joins the current sprint with the optional wordcount \n_wc (wordcount) - Updates your wordcount from the current sprint, this is the total amount \n_dailygoal (wordcount) - Sets a daily goal for you to achieve, resets every 24h \n_wcg (wordcount) - Adds (wordcount) to goal \n_time - Shows you the amount of time left in the current sprint \n_cancel - Cancels the current sprint, resetting everything```';
}


exports.AnnounceWinners = function () {

    // Sort map by wordcount .sorted(compare?)
    var winners = new Map();

    sprintParticipants.forEach(currentItem => {
        if (currentItem.getInSprint()) {
            winners.add(currentItem.getWordCount(), currentItem.getId());
        }
    });

    winners = new Map([...winners.entries()].sort(function (x, y) {
        return y[1] - x[1];
    }));

    var len = winners.size;
    var iter = winners.entries();

    // Create String
    var results = "**Results:** \n";
    var firstPlace = '';
    var secondPlace = '';
    var thirdPlace = '';

    var i1 = iter.next().value;
    var i2 = iter.next().value;
    var i3 = iter.next().value;


    if (len > 0) {
        firstPlace = `:first_place: <@!${i1[0]}>, ${i1[1]} words \n`;
    }
    if (len > 1) {
        secondPlace = `:second_place: <@!${i2[0]}>, ${i2[1]} words \n`;
    }
    if (len > 2) {
        thirdPlace = `:third_place: <@!${i3[0]}>, ${i3[1]} words \n`;
    }

    results += firstPlace + secondPlace + thirdPlace;

    sprintParticipants.forEach(currentItem => {
        if (currentItem.getInSprint()) {

            if (currentItem.getDailyGoal() && currentItem.getGoal() > 0) {

                currentItem.substractGoal(currentItem.getWordCount());

                if (currentItem.getGoal() <= 0) {
                    currentItem.setGoal(0);
                    results += `\n:star: ${currentItem.username} has achieved their goal of ${currentItem.getDailyGoalAmount()} words! :star:`;
                } else {
                    results += `\n${currentItem.username} has ${currentItem.getGoal()} words remaining until their goal.`;
                }
            }

            currentItem.setInSprint(false);
            currentItem.setWordCount(0);
            currentItem.setStartCount(0);
        }
    });

    fs.writeFile('storage.json', JSON.stringify(sprintParticipants), "utf8", () => {
        console.log('Saved to JSON file.');
    });


    // Add Quote
    results += "\n --------------------------------------------- \n" + QuoteGenerator();


    this.CancelCommand();

    firstPlace = '';
    secondPlace = '';
    thirdPlace = '';


    return results;
}

// SET INTERVAL 24H FOR A DAILY GOAL
exports.DailyTimer = function () {

    setInterval(() => {

        sprintParticipants.forEach(currentItem => {
            var newgoal = currentItem.getDailyGoalAmount();
            currentItem.setGoal(newgoal)
        });

        console.log('Reset daily goals.');

    }, 84000000) // 24hours
};