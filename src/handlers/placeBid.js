import AWS from "aws-sdk";
import createError from "http-errors";
import middleware from "../lib/middleware";
import { getAuctionById } from "./getAuction";


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const {id}  = event.pathParameters;
    const {amount} = event.body;
    
    const auction = await getAuctionById(id);

    if(amount <= auction.highestBid.amount){
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {id},
        UpdateExpression: "set highestBid.amount = :amount",
        ExpressionAttributeValues: {
            ":amount": amount,
        },
        ReturnValues: "ALL_NEW",
    };

    let updatedAuction;

    try{
        const result = await dynamoDB.update(params).promise();
        updatedAuction = result.Attributes;
    } catch(err){
        console.error(err);
        throw new createError.InternalServerError(err);
    };

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
};

export const handler = middleware(placeBid);