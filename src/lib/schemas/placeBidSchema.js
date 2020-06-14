const placeBidSchema = {
    properties:{
        body:{
            type: "object",
            properties:{
                amount:{
                    type: "number",
                }
            },
            required:["amount"]
        }
    },

    required: [
    "body",
    ]
};

export default placeBidSchema;