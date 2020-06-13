import AWS from "aws-sdk";
import middleware from "../lib/middleware";
import createError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let auctions;

    try{
        const result = await dynamoDB.scan({
            TableName: process.env.AUCTIONS_TABLE_NAME
        }).promise();

        auctions = result.Items;
    }catch(err){
        console.error(err);
        throw new createError.InternalServerError(err);
    };

    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
};

export const handler = middleware(getAuctions);

