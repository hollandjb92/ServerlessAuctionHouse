import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import validator from "@middy/validator";
import cors from "@middy/http-cors";
import { setAuctionPictureUrl } from "../lib/setAuctionPictureUrl";
import uploadAuctionPictureSchema from "../lib/schemas/uploadAuctionPictureSchema";

export async function uploadAuctionPicture(event){
    const {id} = event.pathParameters;
    const auction = await getAuctionById(id);
    const {email} = event.requestContext.authorizer;

    if (auction.seller !== email){
        throw new createError.Forbidden("You are not the seller of this auction");
    }

    const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    let updatedAuction;

   try {
       const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);
       updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);

    }catch(err){
        console.error(err);
        throw new createError.InternalServerError(err);
    };


    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    };
};

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({inputSchema: uploadAuctionPictureSchema}))
    .use(cors());


