
const bcrypt = require('bcryptjs');





exports.getNullKeysForUpdate = (req, removableKeys) => {
  // get an object with keys to delete from the employee document (all keys that are null)
  const reqBodyKeys = Object.keys(req.body);
  let nullKeys = removableKeys.filter(key => !reqBodyKeys.includes(key));
  nullKeys = nullKeys.reduce((obj, key) => (obj[key]='',  obj), {});
  return nullKeys;
};


exports.getBulkArrayForUpdate = async (req, nullKeys) => { 
  let bulkArr = [];
  if(req.body.password) {
    const password = await bcrypt.hash(req.body.password, 12);
    req.body.password = password;
  }

  bulkArr.push({ updateOne: { // updating the fields
    filter: { _id: req.body._id },
    update: { $set: { ...req.body } }
  }})
  if(Object.entries(nullKeys).length) { // deleting empty fields from the db
    bulkArr.push({updateOne: {
      filter: { _id: req.body._id },
      update: { $unset: { ...nullKeys } } 
    }})
  }
  
  return bulkArr;
}



















