// import the discord.js module


class Quote {

    constructor(quote, author, book) {

        this.quote = quote;
        this.author = author;
        this.book = book;

    }

    FormatQuote() {
        var ticks = "```" + this.quote + "````";
        return `${ticks} - ${this.author}, ${this.book}`;
    }


};

module.exports = Quote;