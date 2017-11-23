// import the discord.js module


class User {

    constructor(id, username, wordcount = 0, startCount = 0, goal = 0, dailyGoal = false, dailyGoalAmount = 0, inSprint = false) {

        this.id = id;
        this.username = username;
        this.wordcount = wordcount;
        this.startCount = startCount;
        this.goal = goal;
        this.dailyGoal = dailyGoal;
        this.dailyGoalAmount = dailyGoalAmount;
        this.inSprint = inSprint;
    }


    getId() {
        return this.id;
    }

    setInSprint(bool) {
        this.inSprint = bool;
    }

    getInSprint() {
        return this.inSprint;
    }

    setWordCount(words) {
        this.wordcount = words;
    }

    getWordCount() {
        return this.wordcount;
    }

    setGoal(words) {
        this.goal = parseInt(words);
    }

    substractGoal(words) {
        this.goal -= parseInt(words);
    }

    getGoal() {
        return this.goal;
    }

    enableDaily() {
        this.dailyGoal = true;
    }

    disableDaily() {
        this.dailyGoal = false;
    }

    setDailyGoalAmount(words) {
        this.dailyGoalAmount = words;
    }

    getDailyGoalAmount() {
        return this.dailyGoalAmount;
    }

    getDailyGoal() {
        return this.dailyGoal;
    }

    setStartCount(words) {
        this.startCount = words;
    }

    // SprintCount() {
    //     return this.sprintArray.length;
    // }

    // TotalWordCount() {
    //     var sum = 0;
    //     this.sprintArray.forEach(function(element) {
    //         sum += element.difference();
    //     }, this);
    //     return sum;
    // }

    // Me() {
    //     return `You've participated in ${this.SprintCount} sprints, writing a total of ${this.TotalWordCount} words.`
    // }

};

module.exports = User;