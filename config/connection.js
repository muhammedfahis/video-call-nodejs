const mongoClient = require('mongodb').MongoClient;



const state ={
    db:null
}


module.exports.connect = function (done){
  // const   url = 'mongodb://localhost:27017';
  const   url = "mongodb+srv://mohammedfayis:2585832000v@cluster0.tyednta.mongodb.net/?retryWrites=true&w=majority";
  const   dbName= 'user'


  // mongoClient.connect(url, async (err,data)=>{
  //   if (err) return done(null,err)
  //   state.db = data.db(dbName)
  // });
  mongoClient.connect(url)
  .then((data) => {
    state.db = data.db(dbName);
    done(state.db,null);
  })
  .catch((err) => {
    done(null,err);
  })
  
}

module.exports.get = function(){
    return state.db
}