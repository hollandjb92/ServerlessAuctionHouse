import AWS from "aws-sdk";
import createError from "http-errors";
import middleware from "../lib/middleware";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id){
    let auction;
    try{
        const result = await dynamoDB.get({
           TableName: process.env.AUCTIONS_TABLE_NAME,
           Key: {id}
          }).promise();

          auction = result.Item;
     }catch(err){
         console.error(err);
         throw new createError.InternalServerError(err);
     };

     if(!auction){
         throw new createError.NotFound(`Auction with ID "${id}" not found!`);
     }

     return auction;
}

async function getAuction(event, context) {
   const {id} = event.pathParameters;
   const auction = await getAuctionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
};

export const handler = middleware(getAuction);


