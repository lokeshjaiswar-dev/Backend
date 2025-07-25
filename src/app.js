import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN , //given CORS_ORIGIN = * which means anyone can access
    credentials : true
}))

//data kahi jagah se aane wla toh uski preparation kar rhe hai
// json data ke liye
app.use(express.json({
    limit : "16kb"
}))

// jab data url mai aaye
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

// data store karne ke liye (public folder ka naam hai)
app.use(express.static("public"))

// use of cookieParser => iss hum apne server se user ke browser ki cookies ko set kar sakte hai aur access kar sakte hai
app.use(cookieParser())

// routes import (ye wle import aise alag se he likhte hai)
import userRouter from "./routes/user.routes.js"

// routes declaration
// app.get() // jab express() se app bana rhe the toh ye syntax kar rha tha par ab nhi karega kyu ki router humne bas Router() se banaya hai
app.use("/api/v1/users",userRouter) // ab router ko laane ke liye middleware lana padega( use() )

export { app }