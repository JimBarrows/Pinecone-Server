'use strict'
import mongoose             from "mongoose"
import Asset                from "./Asset"
import BlogPost             from "./BlogPost"
import BudgetLineItem       from "./BudgetLineItem"
import Destination          from "./Destination"
import FacebookAccountInfo  from "./FacebookAccountInfo"
import Keyword              from "./Keyword"
import Message              from "./Message"
import Objective            from "./Objective"
import Tag                  from "./Tag"
import TwitterAccountInfo   from "./TwitterAccountInfo"
import WordPressAccountInfo from "./WordpressAccountInfo"


const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types

const Campaign = new Schema({
															assets           : [Asset],
															blogPosts        : [BlogPost],
															budgetLineItems  : [BudgetLineItem],
															destinations     : [Destination],
															effectiveFrom    : Types.Date,
															effectiveThru    : Types.Date,
															facebookAccounts : [FacebookAccountInfo],
															keywords         : [Keyword],
															messages         : [Message],
															name             : Types.String,
															objectives       : [Objective],
															owner            : Types.ObjectId,
															tags             : [Tag],
															twitterAccounts  : [TwitterAccountInfo],
															wordPressAccounts: [WordPressAccountInfo]
														})

Campaign.methods.percentageMet = function () {
	return this.objectives.length > 1 ? this.objectives.reduce((p, c) => p + c.met ? 1 : 0, 0) / this.objectives.length : 0
}

Campaign.methods.totalCost = function () {
	if (this.budgetLineItems && this.budgetLineItems.length > 0) {
		return this.budgetLineItems.reduce((prev, cur) => prev + cur.total(), 0)
	} else {
		return 0
	}

}

export default mongoose.model('Campaign', Campaign)
