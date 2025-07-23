class ApiErro extends Error{
    constructor(
        statusCode,
        message = "Something Went wrong", //agar koee mssg nhi dega toh
        errors = [], //multiple errors
        stack = "" //error stack
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null // ye null kyu karte hai , isme hota kya hai
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiErro}