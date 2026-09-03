const {Product,Category,nextId}=require('../models/database');
const Model=key=>key==='products'?Product:Category;
const prefix=key=>key==='products'?'PRD':'CAT';
const clean=value=>{const item=value.toObject?value.toObject():value;delete item._id;delete item.__v;return item};
exports.list=key=>async(req,res)=>{
  // Customers should still see inactive products with an unavailable label.
  // The client prevents adding them to cart and the order endpoint enforces it.
  const visibilityQuery={};
  const paginated=key==='products'&&(req.query.page!==undefined||req.query.limit!==undefined);
  if(!paginated)return res.json({success:true,data:(await Model(key).find(visibilityQuery).lean()).map(clean)});
  const page=Math.max(1,Number.parseInt(req.query.page,10)||1),limit=Math.min(100,Math.max(1,Number.parseInt(req.query.limit,10)||70));
  const query={...visibilityQuery};
  if(req.query.categoryId)query.categoryId=req.query.categoryId;
  if(req.query.q)query.name={$regex:String(req.query.q).trim(),$options:'i'};
  const sort=req.query.sort==='low'?{price:1,_id:1}:req.query.sort==='high'?{price:-1,_id:1}:req.query.sort==='new'?{createdAt:-1,_id:-1}:{_id:-1};
  const [total,items]=await Promise.all([Product.countDocuments(query),Product.find(query).sort(sort).skip((page-1)*limit).limit(limit).lean()]);
  res.json({success:true,data:items.map(clean),pagination:{page,limit,total,totalPages:Math.ceil(total/limit),hasMore:page*limit<total}});
};
exports.byId=key=>async(req,res)=>{const item=await Model(key).findOne({id:req.params.id}).lean();if(!item)return res.status(404).json({success:false,message:'Not found'});res.json({success:true,data:clean(item)})};
exports.create=key=>async(req,res)=>{if(!req.body.name)return res.status(400).json({success:false,message:'name is required'});const item=await Model(key).create({id:await nextId(Model(key),prefix(key)),...req.body});res.status(201).json({success:true,data:clean(item)})};
exports.update=key=>async(req,res)=>{const item=await Model(key).findOneAndUpdate({id:req.params.id},req.body,{new:true,runValidators:true});if(!item)return res.status(404).json({success:false,message:'Not found'});res.json({success:true,data:clean(item)})};
exports.remove=key=>async(req,res)=>{const item=await Model(key).findOneAndDelete({id:req.params.id});if(!item)return res.status(404).json({success:false,message:'Not found'});res.status(204).send()};
