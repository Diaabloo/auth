function auth(req, res, next){

    try{
        //if the user inside req or not
        if(req.user?.id){return next()}
    }catch(err){
        return res.status(401).json({ message: `${err}Unauthorized`});
    }
  }


  module.exports = auth