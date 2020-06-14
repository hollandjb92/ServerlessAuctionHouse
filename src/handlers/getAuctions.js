import AWS from "aws-sdk";
import middleware from "../lib/middleware";
import createError from "http-errors";
import validator from "@middy/validator";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let auctions;
    const {status} = event.queryStringParameters;

    const params = {
        TableName:process.env.AUCTIONS_TABLE_NAME,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeValues:{
            ":status": status,
        },
        ExpressionAttributeNames:{
            "#status": "status",
        }
    };

    try{
        const result = await dynamoDB.query(params).promise();

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

export const handler = middleware(getAuctions)
    .use(validator({inputSchema: getAuctionsSchema, useDefault: true}));

