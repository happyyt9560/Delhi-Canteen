const bcrypt=require('bcryptjs');
const {Customer,nextCustomerId,accountExists}=require('../models/database');

exports.createCustomer=async(req,res)=>{
  const {name,email='',phone,password,address=''}=req.body;
  const normalizedEmail=String(email).trim().toLowerCase();
  if(!name||!phone||!password)return res.status(400).json({success:false,message:'name, phone and password are required'});
  if(String(password).length<6)return res.status(400).json({success:false,message:'Password must contain at least 6 characters'});
  if(await accountExists({phone,email:normalizedEmail}))return res.status(409).json({success:false,message:'An account with this email or phone already exists'});
  const user=await Customer.create({id:await nextCustomerId(),name,email:normalizedEmail||undefined,phone,address,password:await bcrypt.hash(password,10),source:'admin'});
  const data=user.toObject();delete data.password;delete data._id;delete data.__v;
  res.status(201).json({success:true,data});
};

const present=user=>{const data=user.toObject?user.toObject():user;delete data.password;delete data._id;delete data.__v;return data;};
exports.updateCustomer=async(req,res)=>{
  const customer=await Customer.findOne({id:req.params.id});
  if(!customer)return res.status(404).json({success:false,message:'Customer not found'});
  const {name,email='',phone,password,address}=req.body;
  if(!name||!phone)return res.status(400).json({success:false,message:'name and phone are required'});
  const duplicate=await Customer.findOne({id:{$ne:customer.id},$or:[{phone:String(phone).trim()},...(email?[{email:String(email).trim().toLowerCase()}]:[])]});
  if(duplicate)return res.status(409).json({success:false,message:'An account with this email or phone already exists'});
  customer.name=String(name).trim();customer.phone=String(phone).trim();customer.email=String(email).trim().toLowerCase()||undefined;
  if(address!==undefined)customer.address=String(address).trim();
  if(password){if(String(password).length<6)return res.status(400).json({success:false,message:'Password must contain at least 6 characters'});customer.password=await bcrypt.hash(password,10);}
  await customer.save();res.json({success:true,data:present(customer)});
};
exports.deleteCustomer=async(req,res)=>{
  const customer=await Customer.findOneAndDelete({id:req.params.id});
  if(!customer)return res.status(404).json({success:false,message:'Customer not found'});
  res.status(204).send();
};
