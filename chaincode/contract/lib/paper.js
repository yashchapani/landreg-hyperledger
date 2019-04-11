
'use strict';

const State = require('./../ledger-api/state.js');

const cpState = {
    ALLOCATED: 1,
    UNALLOCATED: 2
};

class LandPaper extends State {

    constructor(obj) {
        super(LandPaper.getClass(), [obj.surveyID]);
        Object.assign(this, obj);
    }

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    setAllocated() {
        this.currentState = cpState.ALLOCATED;
    }

    setUnallocated() {
        this.currentState = cpState.UNALLOCATED;
    }

    isAllocated() {
        return this.currentState === cpState.ALLOCATED;
    }

    isUnallocated() {
        return this.currentState === cpState.UNALLOCATED;
    }

    setPrice(newPrice){
        this.currentPrice = newPrice;
    }

    static fromBuffer(buffer) {
        return LandPaper.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, LandPaper);
    }

    static createInstance(surveyID, owner, landDescription, currentPrice, area) {
        return new LandPaper({ surveyID, owner, landDescription, currentPrice, area });
    }

    static getClass() {
        return 'org.papernet.commercialpaper';
    }
}

module.exports = LandPaper;
