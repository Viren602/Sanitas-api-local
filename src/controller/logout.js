
const blacklist=[]
const logout=async(req,res)=>{
    const token = req.cookies["token"] ||  req.headers.authorization
    try {
        blacklist.push(token)
        console.log("user is logout")
        res.clearCookies("token").send({Message:"user is logout"})
    } catch (error) {
        res.send({"msg":error})
    }
}
export {blacklist,logout}