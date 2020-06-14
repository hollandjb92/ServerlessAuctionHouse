import AWS from "aws-sdk";
import createError from "http-errors";
import middleware from "../lib/middleware";
import { getAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBidSchema from "../lib/schemas/placeBidSchema";


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const {id}  = event.pathParameters;
    const {amount} = event.body;
    const {email} = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    //Auction Status Validation
    if(auction.status !== "OPEN"){
        throw new createError.Forbidden("You cannot bid on closed auctions!");
    };
    //Double Bidding Validation
    if(auction.highestBid.bidder == email) {
        throw new createError.Forbidden("You are already the highest bidder!");
    };
    //Bidder Identity Validation
    if(email == auction.seller){
        throw new createError.Forbidden("You cannot bid on an item you submitted!");
    };

    //Bid Amount Validation
    if(amount <= auction.highestBid.amount){
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
    };

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {id},
        UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder = :bidder",
        ExpressionAttributeValues: {
            ":amount": amount,
            ":bidder": email,
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

export const handler = middleware(placeBid)
    .use(validator({inputSchema: placeBidSchema}));