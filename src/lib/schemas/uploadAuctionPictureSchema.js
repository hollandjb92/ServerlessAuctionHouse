const uploadAuctionPictureSchema = {
    properties:{
        body:{
            type: "string",
            minLength: 1,
            pattern: "\=$"
        },
    },

    required: [
    "body",
    ]
};

export default uploadAuctionPictureSchema;