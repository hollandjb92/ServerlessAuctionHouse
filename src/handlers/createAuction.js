import {v4 as uuid} from "uuid";
import AWS from "aws-sdk";
import createError from "http-errors";
import middleware from "../lib/middleware";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const {title} = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    highestBid: {
      amount: 0,

    }
  };

  try{
    await dynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item:auction,
    }).promise();
  } catch(err){
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = middleware(createAuction);

