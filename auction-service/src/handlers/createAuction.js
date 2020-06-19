import {v4 as uuid} from "uuid";
import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import middleware from "../lib/middleware";
import createAuctionsSchema from "../lib/schemas/createAuctionSchema";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const {title} = event.body;
  const {email} = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 24);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
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

export const handler = middleware(createAuction)
.use(validator({inputSchema: createAuctionsSchema}));