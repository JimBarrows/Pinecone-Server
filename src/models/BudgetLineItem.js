'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types


const BudgetLineItem = new Schema({
																		name             : Types.String,
																		estimatedUnitCost: {type: Types.Number, default: 0},
																		estimatedQuantity: {type: Types.Number, default: 1},
																		actualUnitCost   : {type: Types.Number, default: 0},
																		actualQuantity   : {type: Types.Number, default: 1},
																	})

BudgetLineItem.methods.estimatedTotal = function () {
	return (this.estimatedUnitCost * this.estimatedQuantity)
}

BudgetLineItem.methods.actualTotal = function () {
	return (this.actualUnitCost * this.actualQuantity)
}

export default BudgetLineItem
