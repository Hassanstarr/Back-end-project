    // With Promise
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export default asyncHandler

    // Another Way to code

//           Higher order function
// const asyncHandler = (fn) => {}
// const asyncHandler = (fn) => { () => {} }
// const asyncHandler = (fn) => async () => {}


    // With try catch
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/