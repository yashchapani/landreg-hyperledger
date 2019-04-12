
'use strict';

const { Contract, Context } = require('fabric-contract-api');

const LandPaper = require('./paper.js');
const LandPaperList = require('./paperlist.js');


class LandPaperContext extends Context {

    constructor() {
        super();
        this.landPaperList = new LandPaperList(this);
    }

}

class LandPaperContract extends Contract {

    constructor() {
        super('org.regnet.reg');
    }

    createContext() {
        return new LandPaperContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {

        console.log('Instantiate the contract');
    }

    /**
     * Issue commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} owner owner of the land
     * @param {Integer} surveyID unique id of the land
     * @param {String} landDescription  land description
     * @param {Integer} currentPrice land price
     * @param {Integer} area area of the land
    */
    async issue(ctx, surveyID, owner, landDescription, currentPrice, area) {
        let landPaper = LandPaper.createInstance(surveyID, owner, landDescription, currentPrice, area);
        landPaper.setUnallocated();
        await ctx.landPaperList.addPaper(landPaper);
        return landPaper.toBuffer();
    }

    /**
     * First time Buy Land paper
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} surveyID paper number for this issuer
     * @param {String} currentOwner current owner of paper
     * @param {String} newOwner new owner of paper
     * @param {Integer} price price paid for this land
     * @param {String} purchaseDateTime time land was purchased (i.e. traded)
    */
    async firstBuy(ctx, surveyID, currentOwner, newOwner, price, purchaseDateTime) {

        let landPaperKey = LandPaper.makeKey([surveyID]);
        let landPaper = await ctx.landPaperList.getPaper(landPaperKey);

        if (landPaper.isAllocated()) {
            throw new Error('Land Paper ' + surveyID + ' is already allocated');
        }

        if (landPaper.getOwner() !== currentOwner) {
            throw new Error('Land Paper ' + surveyID + ' is not owned by ' + currentOwner);
        }
      
        landPaper.setOwner(newOwner);
        landPaper.setAllocated();
        landPaper.setPrice(price);

        // Update the paper
        await ctx.landPaperList.updatePaper(landPaper);
        return landPaper.toBuffer();
    }

        /**
     * Buy Land paper
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} surveyID paper number for this issuer
     * @param {String} currentOwner current owner of paper
     * @param {String} newOwner new owner of paper
     * @param {Integer} price price paid for this land
     * @param {String} purchaseDateTime time land was purchased (i.e. traded)
    */
   async buy(ctx, surveyID, currentOwner, newOwner, price, purchaseDateTime) {

    let landPaperKey = LandPaper.makeKey([surveyID]);
    let landPaper = await ctx.landPaperList.getPaper(landPaperKey);

    if (landPaper.isUnallocated()) {
        throw new Error('Land Paper ' + surveyID + ' is unallocated');
    }

    if (landPaper.getOwner() !== currentOwner) {
        throw new Error('Land Paper ' + surveyID + ' is not owned by ' + currentOwner);
    }
  
    landPaper.setOwner(newOwner);
    landPaper.setPrice(price);

    await ctx.landPaperList.updatePaper(landPaper);
    return landPaper.toBuffer();
}

        /**
     * Query Land Paper
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} surveyID paper number for this issuer

    */
   async query(ctx, surveyID) {

    let landPaperKey = LandPaper.makeKey([surveyID]);
    let landPaper = await ctx.landPaperList.getPaper(landPaperKey);
    return landPaper.toBuffer();
}

}

module.exports = LandPaperContract;
