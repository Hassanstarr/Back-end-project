import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinaary url
            require: true
        },
        thumbnail: {
            type: String, // cloudinaary url
            require: true
        },
        title: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        duration: {
            type: Number,
            require: true
        },
        duration: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        ower: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// This tool helps break down large amounts of data into smaller, easier-to-manage pieces.
// When dealing with a lot of information, like a long list of videos, this tool lets us 
// show only a few items at a time (like showing 10 videos per page), making it easier to 
// view and handle the data without overwhelming the system.

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)