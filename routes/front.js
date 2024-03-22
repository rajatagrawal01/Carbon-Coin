var express = require('express');
var router = express.Router();
const session = require('express-session');
const moment = require('moment');
const auth = require('../config/auth');
const fs = require('fs');
const nodemailer = require('nodemailer');
const web3 = require('web3');
const crypto = require('crypto');
const Tx = require('ethereumjs-tx');
const userServices = require("../services/userServices");
const whiteKarbun = require("website-carbon-calculator");
const userControllers = require('../controllers/userControllers');
const blockchainController = require('../controllers/blockchainController');
const blockchainServices = require("../services/blockchainServices");
const { calculateHours } = require('../helper/userHelper');
const { mail } = require('../helper/mailer');
const { BannerInfo, GetInTouch, PartnerInfo, MediaCoverage, KeyFeaturesInfo, milestone, problemInfo, blogInfo, whitepaperInfo, solutionInfo, tokenAllocation, termsAndConditionInfo, privacyPolicyInfo } = require('../models/home_content');
const routes = require('express').Router();
const { Registration, Userwallet,whitepaperregister, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ,ContactInfo } = require('../models/userModel');

const DecarbonCompanyModel = require("../models/DecarbonCompanyModel")
const DecarbonFirmModel = require("../models/DecarbonFirmModel");

const SisterFirm = require("../models/SisterFirm");
const SisterCompany = require("../models/SisterCompany");
const OrderModel = require("../models/OrderModel");
const mongoose = require('mongoose');
const alert = require('alert'); 

var isUser = auth.isUser;

//************ to get user data on header using session **********//
router.use(userControllers.sessionHeader);

router.get('/', userControllers.landingPage);

router.get('/sendMail',userControllers.sendMail);
router.post("/subscribe", async (req, res) => {
  let email = req.body.email;
 
  const subscriber= new whitepaperregister({
    email: email,

  });
  const user =  await whitepaperregister.findOne({
    email: req.body.email,
  })
  
  if (user){
    res.redirect("/user_assets/Karbun-Coin-Whitepaper.pdf",);
// window.open("/user_assets/Karbun-Coin-Whitepaper.pdf","_blank");
  }else{
  await subscriber.save();
  res.redirect("/user_assets/Karbun-Coin-Whitepaper.pdf",);
// window.open("/user_assets/Karbun-Coin-Whitepaper.pdf","_blank");
}
});

// router.get('/login', userControllers.loginPage);

router.get('/logout', userControllers.logout);

//***************** get recive-rowan **************//
router.get('/receive-ebt', isUser, function (req, res) {
  err_msg = req.flash('err_msg');
  success_msg = req.flash('success_msg');
  var walletid = req.query.walletid;
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/Login');
  } else {
    Userwallet.findOne({ '_id': walletid }, function (err, response) {
      if (err) { console.log('Something is worng to find login status.') }
      else {
        if (response != "" && response != undefined) {
          let wallet_details = response;
          let qr_txt = wallet_details.wallet_address;
          // var qr_png = qr.imageSync(qr_txt, { type: 'png' })
          let qr_code_file_name = new Date().getTime() + '.png';
          // fs.writeFileSync('./public/wallet_qr_image/' + qr_code_file_name, qr_png, (err) => {
            // if (err) { console.log(err); }
          // });
          res.render('receive', { err_msg, success_msg, wallet_details, qr_code_file_name, layout: false, session: req.session });
        }
      }
    });
  }
});


// router.get('/receive', userControllers.ReceivePage);

router.get('/send-EBT', userControllers.sendPage);

// router.get('/signup', userControllers.signupPage);

router.get('/forgot-pass', userControllers.forgotPage);


//***************** verify email **************// 
router.get('/verify-account', userControllers.verifyPage);

// router.post('/login', userControllers.LoginPost);

//***************** get dashboard **************//
router.get('/dashboard', isUser, userControllers.dashboardPage);

//***************** get referral-table*************//
router.get('/referral-table', userControllers.referral);

router.get('/terms-condition', function (req, res) {
  res.render('terms-condition');
});

router.get('/send-EBT', userControllers.sendPage);
//***************** get create wallet **************//
router.get('/Create-wallet', isUser, blockchainController.createWallet);

/***************** get verfify key **************/
router.post('/Verify-key', isUser, blockchainController.verifyWallet);


//***************** post create wallet **************//
router.post('/submit-create-wallet', isUser, blockchainController.submitWallet);


//***************** get Wallet-success **************//
router.get('/Create-wallet-success', userControllers.walletSuccess);

router.post('/refs-by-date', userControllers.getrefdate);


router.get('/Create-wallet-success', userControllers.walletSuccess);

router.post('/currency-value',userControllers.getCurrencyValue);

router.get('/change-password', isUser, function (req, res) {
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/login');
  } else {
    err_msg = req.flash('err_msg');
    success_msg = req.flash('success_msg');
    res.render('change-password', { err_msg, success_msg, layout: false, session: req.session, })
  }
});

routes.use(session({
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));

//***************** get profile **************//
router.get('/profile', isUser, function (req, res) {
  err_msg = req.flash('err_msg');
  success_msg = req.flash('success_msg');
  var test = req.session.is_user_logged_in;

  if (test != true) {
    res.redirect('/login');
  } else {
    var user_id = req.session.re_us_id;
    Registration.findOne({ '_id': user_id }, function (err, result) {
      if (err) {
        console.log("Something went wrong");
      }
      else {
        // res.send(result);
        res.render('profile', { err_msg, success_msg, result, layout: false, session: req.session, });
      }
    });
  }
});

//***************** post update profile **************//
router.post('/update-profile', isUser, async function (req, res) {
  let user_id = req.session.re_us_id;
  let name = req.body.name.trim();
  let email = req.body.email.trim();
  let mob = req.body.mob.trim();
  // let country = req.body.country.trim();

  let status = await userServices.updateARTUser(email, name);
  console.log(status);
  if (status == 1) {
    Registration.update({ _id: user_id }, { $set: { name: name, email: email, mobile_no: mob} }, { upsert: true }, function (err, result) {
      if (err) {
        console.log("Something went wrong");
        req.flash('err_msg', 'Something went wrong, please try again.');
        res.redirect('/profile');
      } else {
        req.flash('success_msg', 'Profile updated successfully.');
        res.redirect('/profile');
      }
    });
  }
  else {
    req.flash('err_msg', 'Something went wrong, please try again.');
    res.redirect('/profile');
  }
});

// // //***************** post changes password **************//
// router.post('/submit-change-pass', isUser, function (req, res) {
//   if (req.body.new_password == req.body.new_password2) {
//     var user_id = req.session.re_us_id;
//     var old_pass = req.body.password;
//     var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
//     var mystr1 = mykey1.update(old_pass, 'utf8', 'hex')
//     mystr1 += mykey1.final('hex');
//     Registration.find({ '_id': user_id, 'password': mystr1 }, async function (err, result) {
//       if (err) {
//         req.flash('err_msg', 'Something is worng');
//         res.redirect('/profile');
//       } else {
//         if (result.length > 0 && result.length == 1) {
//           var check_old_pass = result[0].password;
//           var mykey2 = crypto.createCipher('aes-128-cbc', 'mypass');
//           var new_pass = mykey2.update(req.body.new_password, 'utf8', 'hex')
//           new_pass += mykey2.final('hex');

//           if (mystr1 != new_pass) {
//             // console.log(result);
//             let status = await userServices.updateARTPass(email, req.body.new_password);
//             console.log(status);
//             if (status == 1) {
//               Registration.update({ _id: user_id }, { $set: { password: new_pass } }, { upsert: true }, function (err) {
//                 if (err) {
//                   req.flash('err_msg', 'Something went wrong.');
//                   res.redirect('/profile');
//                 } else {
//                   req.flash('success_msg', 'Password changed successfully.');
//                   res.redirect('/profile');
//                 }
//               });
//             }
//             else {
//               req.flash('err_msg', 'Something went wrong.');
//               res.redirect('/profile');
//             }
//           }
//           else {
//             req.flash('err_msg', 'New password can not be same as current password.');
//             res.redirect('/profile');
//           }
//         }
//         else {
//           req.flash('err_msg', 'Please enter correct current password.');
//           res.redirect('/profile');
//         }
//       }
//     });
//   }
//   else {
//     req.flash('err_msg', 'Password and Confirm password do not match.');
//     res.redirect('/profile');
//   }
// });


//***************** post changes password **************//
router.post('/submit-change-pass', isUser, function (req, res) {
  console.log("change password")
  var user_id = req.session.re_us_id;
  var old_pass = req.body.password;
  var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
  var mystr1 = mykey1.update(old_pass, 'utf8', 'hex')
  mystr1 += mykey1.final('hex');
  Registration.find({ '_id': user_id, 'password': mystr1 }, function (err, result) {
    if (err) {
      req.flash('err_msg', 'Something is worng');
      res.redirect('/change-password');
    } else {
      if (result.length > 0 && result.length == 1) {
        var check_old_pass = result[0].password;
        var mykey2 = crypto.createCipher('aes-128-cbc', 'mypass');
        var new_pass = mykey2.update(req.body.new_password, 'utf8', 'hex')
        new_pass += mykey2.final('hex');

        if (mystr1 != new_pass) {
          console.log(result);
          Registration.update({ _id: user_id }, { $set: { password: new_pass } }, { upsert: true }, function (err) {
            if (err) {
              req.flash('err_msg', 'Something went wrong.');
              res.redirect('/change-password');
            } else {
              req.flash('success_msg', 'Password changed successfully.');
              res.redirect('/profile');
            }
          });
        }
        else {
          req.flash('err_msg', 'New password can not be same as current password.');
          res.redirect('/change-password');
        }
      }
      else {
        req.flash('err_msg', 'Please enter correct current password.');
        res.redirect('/change-password');
      }
    }
  });
});


router.post('/forgot-pass', userControllers.submitForgot);

router.post("/whitepaper", async (req, res) => {
  
  let email = req.body.email;
 
  const subscriber= new whitepaperregister({
    email: email,

  });
  const user =  await whitepaperregister.findOne({
    email: req.body.email,
  })
  
  if (user){
    console.log("Already Exist User");
  // alert("Thank You!", "your transaction is successfully submitted.", "success");

  }else{
  await subscriber.save();
  console.log("New User is registered successfully");
  // alert("Thank You!", "your transaction is successfully submitted.", "success");
  }

  try{
    await fs.readFile('whitepaper.txt', function(err, data) {
      console.log(data)
      res.redirect("/"+data.toString())
    });
  }catch(err){
    console.log(err);
  }
});

router.post('/emission-pass', async(req,res)=> {
  try {
    let url = req.body.url;
    const websiteCarbonCalculator = new whiteKarbun.WebsiteCarbonCalculator({pagespeedApiKey: 'AIzaSyDkHzzRj6A7XFjrOrk2qufDRSVw3bOAln4'});
    const result = await websiteCarbonCalculator.calculateByURL(url);
    console.log("This is result", result);
    console.log("This is the url of the website u entered : ", result.url);
    console.log("This is the amount of bytes transferred", result.bytesTransferred);
    console.log("This is ", result.isGreenHost);
    console.log("This is something else", result.co2PerPageview);
    const byteTransferred = result.bytesTransferred;
    const GreenHost = result.isGreenHost;
    const co2perPage = result.co2PerPageview;


    err_msg = req.flash('err_msg');
    success_msg = req.flash('success_msg');
    res.render('emission-impact', { err_msg, success_msg, byteTransferred, GreenHost, co2perPage});
    res.redirect('/emission-impact');



  
    // {
    //   url: 'http://www.facebook.com',
    //   bytesTransferred: 123456,
    //   isGreenHost: true,
    //   co2PerPageview: 0.1234567,
    // }
  
  } catch(error) {
    console.log("error");
    // if(error instanceof whiteKarbun.WebsiteCarbonCalculatorError){
    //   console.warn(error.message);

    // }
    // Do something else...
  }
  
});

router.post("/subscribe", async (req, res) => {
  let email = req.body.email;
 
  const subscriber= new whitepaperregister({
    email: email,

  });
  const user =  await whitepaperregister.findOne({
    email: req.body.email,
  })
  
  if (user){
    console.log("Already Exist User");
  // alert("Thank You!", "your transaction is successfully submitted.", "success");

  }else{
  await subscriber.save();
  console.log("New User is registered successfully");
  // alert("Thank You!", "your transaction is successfully submitted.", "success");
  }
  res.redirect("/");

});



// router.post('/signup', userControllers.submitUser);

//***************** post login **************//
router.post('/verify-account', userControllers.verifyUser);

//***************** get Transaction-history **************//
router.get('/transaction-table', isUser, function (req, res) {
  err_msg = req.flash('err_msg');
  success_msg = req.flash('success_msg');
  var user_id = req.session.re_us_id;
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/login');
  } else {

    var user_id = req.session.re_us_id;
    Importwallet.findOne({ 'user_id': user_id, 'login_status': 'login' }, function (err, loginwallet) {
      if (err) {
        console.log("Something went wrong");
      }
      else {



        Tokendetails.find({ 'payment_status': 'pending' }, async function (err, response) {
          if (response != "" && response != null && response != undefined) {
            for (var i = 0; i < response.length; i++) {
              console.log(response.length);
              await blockchainServices.checkTxStatus(response);
            }
          }
          else {
            console.log('no record found.');
          }

        });


        //***************** get update transaction status **************//





        if (loginwallet != "" && loginwallet != null && loginwallet != undefined) {
          Userwallet.findOne({ '_id': loginwallet.wallet_id }, function (err, addresponse) {
            if (err) { console.log('Something is worng to Token details.') }
            else {
              var user_wallet = addresponse.wallet_address;

              Tokendetails.find({ $or: [{ 'receiver_wallet_address': addresponse.wallet_address }, { 'sender_wallet_address': addresponse.wallet_address }] }).sort([['auto', -1]]).exec(function (err, response) {

                if (err) { console.log('Something is worng to Token details.') }
                else {

                  var all_transaction = response;
                  res.render('transaction-table', { err_msg, success_msg, user_wallet, all_transaction, address: addresponse.wallet_address, layout: false, session: req.session, moment });

                }
              });
            }
          });

        } else {
          var user_wallet = "";
          var all_transaction = "";
          res.render('transaction-table', { err_msg, success_msg, user_wallet, all_transaction, layout: false, session: req.session, moment });
        }
      }
    });
  }
});

//***************** get Send-rowan **************//
// router.get('/send-ico', isUser, async function (req, res) {
//   let err_msg = req.flash('err_msg');
//   let success_msg = req.flash('success_msg');
//   let walletid = req.query.walletid;
//   let type = req.query.type;
//   let test = req.session.is_user_logged_in;

//   let rates = await userServices.getRates();
//   // let usdValue = rates.usdValue;
//   let etherValue = rates.etherValue;
//   let bnbValue = rates.bnbValue;
//   let value;

//   if (test != true) {
//     res.redirect('/login');
//   } else {
//     const walletdetails = await Userwallet.findOne({ '_id': walletid });

//     if (walletdetails) {
//       let coinbalance

//       if (type == 'eth') {
//         coinbalance = await balanceMainETH(walletdetails.wallet_address);
//         value = 1 / etherValue;
//       }
//       else if (type == 'bnb') {
//         coinbalance = await balanceMainBNB(walletdetails.wallet_address);
//         value = 1 / bnbValue;
//       }
//       else if (type == 'artw') {
//         coinbalance = await coinBalanceBNB(walletdetails.wallet_address);
//         value = 1 / usdValue;
//       }
//       value = Math.round(value * 100) / 100;
//       res.render('/send-ico', { err_msg, success_msg, walletdetails, layout: false, session: req.session, coinbalance, type, walletid, value, usdValue, etherValue, bnbValue });
//     }
//     else {
//       console.log("somethig went wrong with login status")
//     }


//   }
// });


// router.get('/buy-coin', isUser, async function (req, res) {
//   error = req.flash('err_msg');
//   success = req.flash('success_msg');
//   var test = req.session.is_user_logged_in;
//   if (test != true) {
//     res.redirect('/Login');
//   } else {
//     var user_id = req.session.re_us_id;
//   Tokensettings.findOne().then(btcresult => {  
//     // var btc = btcresult.btcValue;
//     var eth = btcresult.etherValue;
//     Importwallet.findOne({ 'user_id': user_id, 'login_status': 'login' }, function (err, loginwallet) {
//       if (err) {
//         console.log("Something went wrong");
//       }
//       else {
//         if (loginwallet != "" && loginwallet != undefined) {
//           Userwallet.findOne({ '_id': loginwallet.wallet_id }, function (err, result) {
//             if (err) { console.log("Something went wrong"); }
//             else {
//               wallet_details = result;
//               import_wallet_id = loginwallet._id;
//               let wallet_creation = result.created_at;
//               let indiaTime = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
//               indiaTime = new Date(indiaTime);
//               let today = indiaTime.toLocaleString();
//               let wallet_time_difference = calculateHours(new Date(wallet_creation), new Date(today));
//               // let rown_bal = coinBalanceBNB(wallet_details.wallet_address);
//               res.render('buy-coin', { error, success, wallet_details,  import_wallet_id,  layout: false, session: req.session, crypto,eth })
//             }
//           });
//         }
//         else {
//           req.flash('err_msg', 'Sorry!, please import or create a wallet first.');
//           res.redirect('/dashboard');
//         }
//       }
//     })
//   }
// });


// router.get('/buy-coin', isUser, function (req, res) {
//   // var error ="";
//   // var success = "";
//   error = req.flash('err_msg');
//   success = req.flash('success_msg');
//   var user_id = req.session.re_us_id;
//   Tokensettings.findOne().then(btcresult => {
//     var ico = btcresult.etherValue;
//     var tico=ico*0.0000000065;
//     Importwallet.findOne({ 'user_id': user_id, 'login_status': 'login' }, function (err, loginwallet) {
//       if (err) {
//         console.log("Something went wrong");
//       }
//       else {
//         if (loginwallet != "" && loginwallet != undefined) {
//           Userwallet.findOne({ '_id': loginwallet.wallet_id }, function (err, result) {
//             if (err) { console.log("Something went wrong"); }
//             else {
//               var wallet_address = result.wallet_address;
//               res.render('buy-coin', { error, success, wallet_address, user_id, ico,tico });
//             }
//           })
//         }
//       }
//     })
//   })
// });

router.get("/buy-coin", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("buy-coin", {
                    error,
                    success,
                    
                  });
  
});

router.get("/register-form", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("register-form", {
                    error,
                    success,
                    
                  });
  
});
router.get("/dashboardCompany", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("dashboardCompany", {
                    error,
                    success,
                    
                  });
  
});
router.get("/dashboardfirm", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("dashboardfirm", {
                    error,
                    success,
                    
                  });
  
});
router.get("/forgot-pass-firm", function (req, res) {
  // var error ="";
  // var success = "";
  var error = req.flash("err_msg");
  var success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("forgot-pass-firm", {
                    error:null,
                    success:null,
                  });
  
});
router.get("/forgot-pass-company", function (req, res) {
  // var error ="";
  // var success = "";
  var error = req.flash("err_msg");
  var success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("forgot-pass-company", {
                    error:null,
                    success:null,
                  });
  
});

router.get("/register-tree-form", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("register-tree-form", {
                    error:null,
                    success:null,
                  });
  
});

router.get("/otp-company", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("otp-company", {
                    error,
                    success,
 });
});
router.get("/otp-firm", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("otp-firm", {
                    error: null,success:null,
});
});
router.get("/faq", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;
  

  FAQ.find({ deleted: '0' }).then((questionDetails) => {
    res.render("faq", {
      err_msg:error,
      success_msg:success,
      questionDetails:questionDetails,
    }).catch(err=>{
      console.log(err);
    })

  })
                  // var wallet_address = result.wallet_address;
});



router.get("/terms", function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
   termsAndConditionInfo.find({}).then((TitleDetails) => {
    res.render("terms", {
      err_msg:error,
      success_msg:success,
      TitleDetails:TitleDetails,
    }).catch(err=>{
      console.log(err);
    })

  })
})
  


router.post('/ETH', isUser, async function (req, res) {
  // const form = formidable({ multiples: true });
  // form.parse(req, (err, fields, files) => {
  //     if (err) {
  //       console.log("------------err---------- ",err);
  //     }
  console.log("Hello from ETH");
  console.log("fields========== ", req.body);
  var user_id = req.session.re_us_id;
  var usd_count = req.body.usd;
  console.log("bbbbb", user_id);

  var ebt_count = (req.body.usd)*(1/0.0000000065);
  Tokensettings.findOne({}).then(ebt_rate => {
    var rate_per_ebt = ebt_rate.etherValue;
    // var rate_per_rwn = req.body.rate_per_rowan;
    var total_amnt = (usd_count) * (rate_per_ebt);
    var eth_wallet_address = req.body.eth_wallet_address;
    var transaction_Id = req.body.transaction_id;
    var user_wallet_address = req.body.user_wallet_address;
    var imageFile = req.body.transactionImage;
    // var image;
    // if (!imageFile) {
    //   image = ""
    // } else {
    //   image = req.files.image.name;
    //   console.log("vvvvvvvvv");
    // }
    var payment_type = "ETH";
    var created_at = new Date();
    // console.log("-----------Total amount ",payment_type, created_at, total_amnt,eth_wallet_address,transaction_Id,imageFile);
    const order = new OrderDetails({
      user_id: user_id,
      ebt_count: ebt_count,
      rate_per_ebt: rate_per_ebt,
      total_amnt: total_amnt,
      transaction_Id: transaction_Id,
      sender_wallet_address: user_wallet_address,
      eth_wallet_address: eth_wallet_address,
      image: imageFile,
      payment_type: payment_type,
      created_at: created_at
    })
    order.save()
    console.log("details",order).then(result => {
        var imgpath = 'public/tx_proof/'+ imageFile;
        let testFile = fs.readFileSync(req.files.imageFile.path);
        let testBuffer = new Buffer(testFile);
        fs.writeFile(imgpath, testBuffer, function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
        });
        req.flash("success_msg", "Thankyou!, Request has been sent successfully and you will get the ebt in your account after your payment verification.");
        res.redirect('/buy-coin');
      })
      .catch(err => {
        console.log("-----------err--------------- ", err);
        req.flash("err_msg", "Sorry!, we were unable to send your data, please try one more time.");
        res.redirect('/buy-coin');
      })
  }).catch(err1 => {

  })
  res.redirect('/dashboard');
  // })    
})

router.post("/saveDecarbinationfirm",async (req,res)=>{
  console.log(req.body)
  if(req.body.pwd == req.body.cnfpwd){
    const Firm = {
      firm_name:req.body.firmName,
      email:req.body.email,
      mobile:req.body.phone,
      password:req.body.pwd,
      companys_licenece:req.body.licence,
      country:req.body.countries,
      carbonEmission:req.body.carbon_emission,
    }
    let result = await DecarbonFirmModel.findOne({email:req.body.email});
    if(result == null){
      await DecarbonFirmModel.create(Firm).then(result=>{
        res.render("index",{success:"Successfully Registered",error:null});
      }).catch(err=>{
          console.log(err);
          res.status(400).render("register-form",{error:"Some Error Occured in DataBase!!"});
      })
    }else{
      res.status(400).render("register-form",{error:"Email is Already Registered"});
    }
  }else{
    res.status(200).render("register-form",{error:"Password and Confirm Password is Not Same"});
  }
})

router.post("/saveSisterfirm",async (req,res)=>{
  console.log(req.body)
  if(req.body.pwd == req.body.cnfpwd){
    const Firm = {
      parentId:mongoose.Types.ObjectId(req.session.user._id),
      firm_name:req.body.firmName,
      email:req.body.email,
      mobile:req.body.phone,
      password:req.body.pwd,
      companys_licenece:req.body.licence,
      country:req.body.countries,
      carbonEmission:req.body.carbon_emission,
    }
    let result = await DecarbonFirmModel.findOne({email:req.body.email});
    if(result == null){
      await DecarbonFirmModel.create(Firm).then(result=>{
        res.render("firmdashboard/firm-dashboard",{success:"Successfully Registered",error:null,user:req.session.user});
      }).catch(err=>{
          console.log(err);
          res.render("firmdashboard/firm-dashboard",{success:null,error:"Some Error Occured at Database",user:req.session.user});
        })
    }else{
      res.render("firmdashboard/firm-dashboard",{success:null,error:"Email Already Registered",user:req.session.user});    }
  }else{
    res.render("firmdashboard/firm-dashboard",{success:null,error:"Password and Confirm Password is Not Same",user:req.session.user});
  }
})

router.post("/saveDecarbonCompany",async (req,res)=>{
  console.log(req.body)
    const Company = {
    company_name: req.body.companyName,
    email:req.body.email,
    mobile:req.body.phone,
    quotation:req.body.quotation,
    totalArea:req.body.totalArea,
    ApproxCapacity:req.body.approxCap,
    password:req.body.pwd,
    companys_licence:req.body.licence,
    phone:req.body.phone,
    country:req.body.countries,
    }
    if(req.body.cnfpwd == req.body.pwd){
      let result = await DecarbonCompanyModel.findOne({email:req.body.email});
      if(result== null){
        await DecarbonCompanyModel.create(Company).then(result=>{
          res.render("index",{success:"Successfully Registered",error:null});
        }).catch(err=>{
          res.render("register-tree-form",{error:"Some Error Occured in DataBase!!",success:null});
        })
      }else{
        res.render("register-tree-form",{error:"Email is Already Registered",success:null});
      }
    }else{
      res.render("register-tree-form",{error:"Confirm Password and Password are Not Same"});
    }
})

router.post("/saveSisterCompany",async (req,res)=>{
  const Company = {
  parentId:mongoose.Types.ObjectId(req.session.user._id),
  company_name: req.body.companyName,
  email:req.body.email,
  mobile:req.body.phone,
  quotation:req.body.quotation,
  totalArea:req.body.totalArea,
  ApproxCapacity:req.body.approxCap,
  password:req.body.pwd,
  companys_licence:req.body.licence,
  phone:req.body.phone,
  }
  if(req.body.cnfpwd == req.body.pwd){
    let result = await DecarbonCompanyModel.findOne({email:req.body.email});
    if(result== null){
      await DecarbonCompanyModel.create(Company).then(result=>{
        res.render("companydashboard/company-dashboard",{success:"Company Registered",error:null,user:req.session.user});
      }).catch(err=>{
        res.render("companydashboard/company-dashboard",{success:null,error:"Some Error Occured in Database",user:req.session.user});      })
    }else{
      res.render("companydashboard/company-dashboard",{success:null,error:"Email is Already Registered",user:req.session.user});    }
  }else{
    res.render("companydashboard/company-dashboard",{success:null,error:"Password and Confirm are not Same",user:req.session.user});  }
})

var isLoggedIn = function(req,res,next){
  if((req.session.user==undefined || req.session.user==null)){
    res.redirect("/");
  }
  next();
}

var isCompanyLoggedIn = function(req,res,next){
  if((req.session.user==undefined || req.session.user==null)){
    res.redirect("/");
  }else{
    if(req.session.type=="FIRM"){
      next();
    }else{
      res.redirect("/");
    }
  
  }
}

var isFirmLoggedIn = function(req,res,next){
  if((req.session.user==undefined|| req.session.user==null)){
    res.redirect("/");
  }else{
    if(req.session.type=="COMPANY"){
      next();
    }else{
      res.redirect("/");
    }
  }
}
//emitter firm dashboard//
router.get("/firm-dashboard",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-dashboard",{error:null,success:null,user:req.session.user});
})

router.get("/firm-profile",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-profile",{error:null,success:null,user:req.session.user});
})

router.get("/firm-Add-sister-firm",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-Add-sister-firm",{error:null,success:null,user:req.session.user});
})
router.get("/firm-Sell-Carbon-credits",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-Sell-Carbon-credits",{error:null,success:null,user:req.session.user});
})

router.get("/firm-transaction-table",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-transaction-table",{error:null,success:null,user:req.session.user});
})

router.get("/firm-tree-planting-request",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-tree-planting-request",{error:null,success:null,user:req.session.user});
})

router.get("/firm-change-password",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/firm-change-password",{error:null,success:null,user:req.session.user});
})



//tree company dashboard//

router.get("/company-dashboard",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-dashboard",{success:null,error:null,user:req.session.user});
})

router.get("/company-Add-sister-company",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-Add-sister-company",{sucess:null,error:null,user:req.session.user});
})

router.get("/company-change-password",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-change-password",{success:null,error:null,user:req.session.user});
})

router.get("/company-emitter-company-request",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-emitter-company-request",{sucess:null,error:null,user:req.session.user});
})

router.get("/company-profile",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-profile",{sucess:null,error:null,user:req.session.user});
})

router.get("/company-Sell-Carbon-credits",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-Sell-Carbon-credits",{sucess:null,error:null,user:req.session.user});
})
router.get("/company-Sell2-Carbon-credits",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-Sell2-Carbon-credits",{sucess:null,error:null,user:req.session.user});
})

router.get("/company-transaction-table",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-transaction-table",{sucess:null,error:null,user:req.session.user});
})


 router.post("/firmlogin",(req,res)=>{
  DecarbonFirmModel.findOne({email:req.body.email,password:req.body.password}).then(result=>{
    if(result==null){
        res.render("index",{error:"No User Found",success:null});
    }else{
      req.session.user = result;
      req.session.type="FIRM";
      req.session.save(()=>{
        res.redirect("/firm-dashboard");
      })
    }
  }).catch(err=>{
    res.render("index",{error:err.toString(),success:null});
  })
 });

 router.post("/decarbinationCompanyLogin",(req,res)=>{
  DecarbonCompanyModel.findOne({email:req.body.email,password:req.body.password}).then(result=>{
    if(result==null){
      res.render("index",{error:"No User Found",success:null});
    }else{
      req.session.user = result;
      req.session.type = "COMPANY";
      req.session.save(()=>{
        res.redirect("/company-dashboard",);
      })
    }
  }).catch(err=>{
    res.render("index",{error:err.toString(),success:null});
  })
 })

 router.post("/sendOtpFirm",(req,res)=>{
  var four_digit_otp = Math.floor(1000 + Math.random() * 9000);
  const password = four_digit_otp;
  DecarbonFirmModel.findOne({email:req.body.email}).then(async function(result){
    if(result!=null){
       let response = await DecarbonFirmModel.updateOne({_id:result._id},{$set:{otp:password}});
       if(response!=null){
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'prashantbarge@questglt.org',
            pass: 'gopalthegame',
          }
        });
        const mailOptions = {
          to: req.body.email,
          from: 'prashantbarge@questglt.org',
          subject: 'Forgot Password',
    
          text: 'Dear Customer,' + '\n\n' + 'New Password form ebt.\n\n' +
            'OTP: ' + password + '\n http://' + req.headers.host + '/' + '\n\n' +
    
            'We suggest you to please change your password after successfully logging in on the portal using the above password :\n\n' +
    
            'Here is the change password link: http://' + req.headers.host + '/Profile' + '\n\n' +
            'Thanks and Regards,' + '\n' + '$EBT Team' + '\n\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if(err){
            res.render("forgot-pass-firm", {
              error:err,
              success:null,
            });
          }else{
            res.redirect("/otp-firm?email="+result.email)
          }
        });
       }
    }else{
      res.render("forgot-pass-firm", {
        error:err,
        success:null,
      });
    }
  }).catch(err=>{
    res.render("forgot-pass-firm", {
      error:err,
      success:null,
    });
  })
 })

 router.post("/sendOtpCompany",(req,res)=>{
  var four_digit_otp = Math.floor(1000 + Math.random() * 9000);
  const password = four_digit_otp;
  DecarbonCompanyModel.findOne({email:req.body.email}).then(async function(result){
    if(result!=null){
       let response = await DecarbonCompanyModel.updateOne({_id:result._id},{$set:{otp:password}});
       if(response!=null){
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'prashantbarge@questglt.org',
            pass: 'gopalthegame',
          }
        });
        const mailOptions = {
          to: req.body.email,
          from: 'prashantbarge@questglt.org',
          subject: 'Forgot Password',
    
          text: 'Dear Customer,' + '\n\n' + 'New Password form ebt.\n\n' +
            'OTP: ' + password + '\n http://' + req.headers.host + '/' + '\n\n' +
    
            'We suggest you to please change your password after successfully logging in on the portal using the above password :\n\n' +
    
            'Here is the change password link: http://' + req.headers.host + '/Profile' + '\n\n' +
            'Thanks and Regards,' + '\n' + '$EBT Team' + '\n\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if(err){
            res.send(err);
          }else{
            res.redirect("/otp-company?email="+result.email)
          }
        });
       }
    }else{
      res.render("forgot-pass-company", {
        error:"User Not Found",
        success:null,
      });
    }
  }).catch(err=>{
    res.render("forgot-pass-company", {
      error:err,
      success:null,
    });
  })
 })


 router.post("/confirmOtpFirm",async (req,res)=>{

  if(req.body.password ==  req.body.confirm_password){
  try{
    let result = await DecarbonFirmModel.findOne({email:req.body.email});
    if(result!=null){
      if(result.otp == req.body.otp && result.otp!=null ){
          let response = await DecarbonFirmModel.updateOne({_id:result._id},{$set:{password:req.body.password,otp:null}});
          if(response != null){
            res.render("index",{error:null,success:"Password Updated"});
          }
      }else{
        res.render("forgot-pass-firm",{error:"Could Not Update Password ,Contact Administrator",success:null});
      }
    }
  }catch(err){
    res.render("index",{error:err.toString(),success:null});
  }
}else{
  res.render("forgot-pass-firm",{error:"Your Passwords doesn't Match!",success:null});
}
 })

 router.post("/confirmOtpCompany",async (req,res)=>{
   if(req.body.password ==  req.body.confirm_password){
  try{
    let result = await DecarbonCompanyModel.findOne({email:req.body.email});
    if(result!=null){
      if(result.otp == req.body.otp && result.otp!=null ){
          let response = await DecarbonCompanyModel.updateOne({_id:result._id},{$set:{password:req.body.password,otp:null}});
          if(response != null){
            res.render("index",{error:null,success:"Password Updated"});
          }
      }else{
        res.render("forgot-pass-company",{error:"Could Not Update Password ,Contact Administrator",success:null});
      }
    }
  }catch(err){
    res.render("forgot-pass-company",{error:err.toString(),success:null})
  }
}else{
  res.render("forgot-pass-company",{error:"Your Passwords Doesnot Match!",success:null})
}
  })

router.get("/logout",(req,res)=>{
  req.session.user = null;
  res.redirect("/");
})

router.get("/profile-user-firm",isCompanyLoggedIn,function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("profile_update_firm", {
                    user:req.session.user,
                    error:null,
                    success:null,
                  });
  
});


router.get("/profile-user-company",isFirmLoggedIn,function (req, res) {
  // var error ="";
  // var success = "";
  error = req.flash("err_msg");
  success = req.flash("success_msg");
  // var user_id = req.session.re_us_id;

                  // var wallet_address = result.wallet_address;
                  res.render("profile_update_company", {
                    user:req.session.user,
                    error:null,
                    success:null,
                  });
  
});

router.post("/changePassword_Company",(req,res)=>{
  if(req.session.user.password==req.body.old_pass){
    if(req.body.new_pass == req.body.cnf_pass){
      DecarbonCompanyModel.updateOne({email:req.session.user.email},{$set:{password:req.body.new_pass}},{$upsert:true,$new:true}).then(result=>{
        res.render("companydashboard/company-change-password",{success:"PassWord Changed",error:null,user:req.session.user});
      }).catch(err=>{
        res.render("companydashboard/company-change-password",{success:null,error:"Some Error Occured at Database",user:req.session.user});
      })
    }else{
      res.render("companydashboard/company-change-password",{success:null,error:"Confirm Password and New Password Doesnot Match",user:req.session.user});
    }
  }else{
    res.render("companydashboard/company-change-password",{success:null,error:"Your Old Password Doesn't Match",user:req.session.user});
  }
})

router.post("/changePassword_firm",(req,res)=>{
  if(req.session.user.password==req.body.old_pass){
    if(req.body.new_pass == req.body.cnf_pass){
      DecarbonFirmModel.updateOne({email:req.session.user.email},{$set:{password:req.body.new_pass}},{$upsert:true,$new:true}).then(result=>{
        res.render("firmdashboard/firm-change-password",{success:"PassWord Changed",error:null,user:req.session.user});
      })
    }else{
      res.render("firmdashboard/firm-change-password",{success:null,error:"Confirm Password and New Password Doesnot Match",user:req.session.user});
    }
  }else{
    //old pass not matched
    res.render("firmdashboard/firm-change-password",{success:null,error:"Your Old Password Doesn't Match",user:req.session.user});
  }
})

router.post("/updateFirm",(req,res)=>{
  const update =  {
    firm_name:req.body.name,
    companys_licenece:req.body.licenece,
    mobile:req.body.mob,
    carbonEmission:req.body.carbon_emission,
  }
  DecarbonFirmModel.updateOne({email:req.body.email},{$set:update},{$upsert:true,$new:true}).then(async (result)=>{
    let result1 = await DecarbonFirmModel.findOne({email:req.body.email});
    req.session.user = result1;
    res.redirect("/firm-profile")
  }).catch(err=>{
    res.render("firm-profile",{error:"Cannot Update , Some Error Occured!"})
  })
})


router.post("/updateCompany",(req,res)=>{
  const update =  {
    company_name:req.body.name,
    companys_licence:req.body.licence,
    quotation:req.body.quotation,
    totalArea:req.body.totalArea,
    ApproxCapacity:req.body.approxCapacity,
    mobile:req.body.mobile
  }
  DecarbonCompanyModel.updateOne({email:req.body.email},{$set:update},{$upsert:true,$new:true}).then(async (result)=>{
    let result1 = await DecarbonCompanyModel.findOne({email:req.body.email});
    req.session.user = result1;
    
    res.redirect("/company-profile");
  }).catch(err=>{
    res.render("companydashboard/company-profile",{sucess:null,error:"Cannot Update, Due to Some Issue",user:req.session.user});  })
})

router.get("/fetchallfirm",(req,res)=>{
  DecarbonFirmModel.find({},{password:0,otp:0}).then(result=>{
    res.send({error:false,res:result});
  }).catch(err=>{
    res.send({error:true,res:err.toString()});
  })
})

router.get("/fetchfirm",(req,res)=>{
  DecarbonFirmModel.find({ "firm_name" : { $regex: `^${req.query.name}`, $options: 'i' }},{password:0,otp:0}).then(result=>{
    res.send({error:false,res:result});
  }).catch(err=>{
    res.send({error:true,res:err.toString()});
  })
})

//  Emission Impact :

router.get('/emission-impact', function (req, res) {
  res.render('emission-impact');
});
router.get('/microsoft', function (req, res) {
  res.render('microsoft');
});
router.get('/google', function (req, res) {
  res.render('google');
});
router.get('/calculator', function (req, res) {
  res.render('calculator');
});

// SISTER FIRMS 

router.post("/sisterFirm",async (req,res)=>{
  try{
  const sisterFirm = {
    parentId:req.body.parentId,
    firm_name:req.body.firmName,
    email:req.body.email,
    mobile:req.body.phone,
    password:req.body.password,
    companys_licenece:req.body.licence,
    Country:req.body.country,
  }
  if(req.body.password == req.body.cnfpwd){
     let result  = await SisterFirm.create(sisterFirm);
     if(result!=null || result!=undefined){
       res.send({error:null,success:"Sister Firm Created ! Login"});
     }else{
      res.send({error:"Sister Firm Creation Failed! Try Again",success:null});
     }

  }else{
    res.send({error:"Password didn't Match",success:null});
  }
}catch(err){
  res.send({error:"Error! DataBase Issue",success:null});
}
})


// SISTER COMPANY;

router.post("/sisterCompany",async (req,res)=>{
  try{
    const sisterCompany = {
    parentId:req.body.parentId,
    company_name: req.body.companyName,
    email:req.body.email,
    mobile:req.body.phone,
    quotation:req.body.quotation,
    totalArea:req.body.totalArea,
    ApproxCapacity:req.body.approxCap,
    password:req.body.pwd,
    companys_licence:req.body.licence,
    }
    if(req.body.pwd==req.body.cnfpwd){
      let result  = await SisterCompany.create(sisterCompany);
     if(result!=null || result!=undefined){
       res.send({error:null,success:"Sister Company Created ! Login"});
     }else{
      res.send({error:"Sister Company Creation Failed! Try Again",success:null});
     }

    }else{
      res.send({error:"Password didn't Match",success:null});
    }
  }catch(err){
    console.log(err);
  res.send({error:"Error! DataBase Issue",success:null});
  }
})

// admin - verified or not 
router.get("/fetchAllPlantation",async (req,res)=>{
  try{
    let result = await DecarbonCompanyModel.find({},{password:0,otp:0},{sort:{
      status: 1 //Sort by Date Added DESC
  }});
    res.send({result:result,error:false});
  }catch(err){
    res.send({result:"",error:true});
  }
})


router.get("/updatePlanataionStatus",async (req,res)=>{
  console.log(req.query);
  try{
    let result = await DecarbonCompanyModel.updateOne({_id:mongoose.Types.ObjectId(req.query.id)},{$set:{status:"VERIFIED"}});
    console.log(result);
    res.send({result:"Updated",error:false});

  }catch(err){
    console.log(err);
    res.send({result:"Some Error has Occured",error:true});
  }
})


router.get("/company-plantaion-firm",isFirmLoggedIn,(req,res)=>{
  res.render("companydashboard/company-plantation-firm",{user:req.session.user});
})

// emitter - only can verifeid company
router.get("/fetchVerifiedPlantation",async (req,res)=>{
  try{
    let result = await DecarbonCompanyModel.find({status:"VERIFIED"},{password:0,otp:0})
    res.send({result:result,error:false});
  }catch(err){
    res.send({result:"",error:true});
  }
})

router.post("/createOrder",isCompanyLoggedIn,(req,res)=>{
  console.log(req.body);
  console.log(req.session.user);
  const order={
   emitter:mongoose.Types.ObjectId(req.session.user._id),
   plantation:mongoose.Types.ObjectId(req.body.plantationId),
   status:"CREATED",
   emitter_name:req.session.user.firm_name,
   plantation_name:req.body.plantation_name,
   approxCapacity:req.body.ApproxCapacity,
   quotation:req.body.quotation,
   totalArea:req.body.totalArea
  }
  OrderModel.create(order).then(result=>{
    res.send({result:result,error:false});
  }).catch(err=>{
    console.log(err);
    res.send({result:"Some Error Occured at Database",error:true});
  })
  console.log(order);
})

router.get("/getMyAllOrders",(req,res)=>{
  let id = req.session.user._id;
  OrderModel.find({emitter:mongoose.Types.ObjectId(id)}).then(result=>{
    res.send({res:result,error:false});
  }).catch(err=>{
    res.send({res:"Some Error Ocuured at Database",error:true});
  })
})

router.get("/getMyOrders",(req,res)=>{
  let id = req.session.user._id;
  OrderModel.find({plantation:mongoose.Types.ObjectId(id),status:"CREATED"}).then(result=>{
    res.send({res:result,error:false});
  }).catch(err=>{
    res.send({res:"Some Error Ocuured at Database",error:true});
  })
})


router.get("/changeOrderStatus",(req,res)=>{
  OrderModel.updateOne({_id:mongoose.Types.ObjectId(req.query.id)},{$set:{status:req.query.status}}).then(result=>{
    res.send({result:result,error:false});
  }).catch(err=>{
    console.log(err);
    res.send({result:"Some Error Occured at Database",error:true});
  })
})


router.get("/plantation-firms-list",isCompanyLoggedIn,(req,res)=>{
  res.render("firmdashboard/plantation-firms-list",{user:req.session.user});
})

router.get("/deletePlanataion",(req,res)=>{
  DecarbonCompanyModel.deleteOne({_id:mongoose.Types.ObjectId(req.query.id)}).then(result=>{
    res.send({result:"Deleted Firm",error:false});
  }).catch(err=>{
    res.send({result:"Some Issue Occured at Databse",error:true});
  })
})

router.get("/deleteFirm",(req,res)=>{
  DecarbonFirmModel.deleteOne({_id:mongoose.Types.ObjectId(req.query.id)}).then(result=>{
    res.send({result:"Deleted Firm",error:false});
  }).catch(err=>{
    res.send({result:"Some Issue Occured at Databse",error:true});
  })
})

router.get("/updateFirmStatus",async (req,res)=>{
  console.log(req.query);
  try{
    let result = await DecarbonFirmModel.updateOne({_id:mongoose.Types.ObjectId(req.query.id)},{$set:{status:"VERIFIED"}});
    console.log(result);
    res.send({result:"Updated",error:false});

  }catch(err){
    console.log(err);
    res.send({result:"Some Error has Occured",error:true});
  }
})

router.get("/countfirm",(req,res)=>{
  DecarbonFirmModel.countDocuments({}).then(result=>{
    res.send({data:result,error:false})
  }).catch(err=>{
    res.send({data:null,error:true})
  })
})

router.get("/countfirmVerified",(req,res)=>{
  DecarbonFirmModel.countDocuments({status:"VERIFIED"}).then(result=>{
    res.send({data:result,error:false})
  }).catch(err=>{
    res.send({data:null,error:true})
  })
})

router.get("/countplantation",(req,res)=>{
  DecarbonCompanyModel.countDocuments({}).then(result=>{
    res.send({data:result,error:false})
  }).catch(err=>{
    res.send({data:null,error:true})
  })
})

router.get("/countplantationverified",(req,res)=>{
  DecarbonCompanyModel.countDocuments({status:"VERIFIED"}).then(result=>{
    res.send({data:result,error:false})
  }).catch(err=>{
    res.send({data:null,error:true})
  })
})


module.exports = router;
