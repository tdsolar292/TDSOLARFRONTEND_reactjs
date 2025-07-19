let GWS_SERVER = {
  proformaFormGoogleURL:
    "https://script.google.com/macros/s/AKfycbwMZQy7mYpEIzCJUoqztpS2kg3LO8XIbCl196-BDkZMJMNXqLenSSG19-LZgmpTpbdmlw/exec",
  proformaInvoicePDFURL:
    "https://docs.google.com/spreadsheets/d/1vaziuK5kQKJ-lSjHfbPH6ueYGXx15UlkEWka_pkE-Zk/export?format=pdf&exportFormat=pdf&gid=1080292671&size=A4&portrait=true&fitw=true&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&sheetnames=false&printtitle=false&pagenum=UNDEFINED&gridlines=false&fzr=false",
  creditTransactionsGoogleURL:
    "https://script.google.com/macros/s/AKfycbyYOzCUTREGQLt5Ru69vtipvNL7LZugcBbg6fQQ_unwV1G8E0qoUgE5QbfNbuuYYTsMew/exec",
  debitTransactionsGoogleURL:
    "https://script.google.com/macros/s/AKfycbyYOzCUTREGQLt5Ru69vtipvNL7LZugcBbg6fQQ_unwV1G8E0qoUgE5QbfNbuuYYTsMew/exec",
  paymentReceiptFormGoogleURL:
    "https://script.google.com/macros/s/AKfycbwA3HTKjs-IGajuqW-7OW7yMOZdyGqJlQDb1-5SxLQV54mYWxJNBp1O8A05LckHBYlhSQ/exec",
  paymentReceiptPDFURL:
    "https://docs.google.com/spreadsheets/d/18UHgISSaFB0HXBcA9v0c6A3kjIhrnIr5p3LS9Mu727w/export?format=pdf&exportFormat=pdf&gid=1015786183&size=A4&portrait=true&fitw=true&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&sheetnames=false&printtitle=false&pagenum=UNDEFINED&gridlines=false&fzr=false",
  getAllProformaInvoiceGoogleURL:"https://script.google.com/macros/s/AKfycbwMZQy7mYpEIzCJUoqztpS2kg3LO8XIbCl196-BDkZMJMNXqLenSSG19-LZgmpTpbdmlw/exec",
  GetUpdateProformaStatus:"https://script.google.com/macros/s/AKfycbwMZQy7mYpEIzCJUoqztpS2kg3LO8XIbCl196-BDkZMJMNXqLenSSG19-LZgmpTpbdmlw/exec",
  GetPaymentDetails: "https://script.google.com/macros/s/AKfycbwA3HTKjs-IGajuqW-7OW7yMOZdyGqJlQDb1-5SxLQV54mYWxJNBp1O8A05LckHBYlhSQ/exec",
  GetSetRowNumberInGoogleProformaInvoice:"https://script.google.com/macros/s/AKfycbwMZQy7mYpEIzCJUoqztpS2kg3LO8XIbCl196-BDkZMJMNXqLenSSG19-LZgmpTpbdmlw/exec",
  POSTGSTInvoiceGoogleURL:"https://script.google.com/macros/s/AKfycbzsQWhQT3OWeam9qqJEDqvWo3lS6-v0W81DC7sRtAEzclfOJtRDhb5ILUfR0q_0PxLZOA/exec"
};

let TDSOLAR9_SERVER = {
  proformaFormGoogleURL:
    "https://script.google.com/macros/s/AKfycbwljztGK5pLw9CQTBKFuTouZaEbGfPEvG94blomOIs5Ci523qAUvnrSTK9P3K_jxJWlnA/exec",
  proformaInvoicePDFURL:
    "https://docs.google.com/spreadsheets/d/15pUjqcJI0VjEWqciGQTYi-XGS_QPgldV9AIqVttZ8xM/export?format=pdf&exportFormat=pdf&gid=384000333&size=A4&portrait=true&fitw=true&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&sheetnames=false&printtitle=false&pagenum=UNDEFINED&gridlines=false&fzr=false",
  creditTransactionsGoogleURL: "",
  debitTransactionsGoogleURL: "",
  paymentReceiptFormGoogleURL:
    "https://script.google.com/macros/s/AKfycbwA3HTKjs-IGajuqW-7OW7yMOZdyGqJlQDb1-5SxLQV54mYWxJNBp1O8A05LckHBYlhSQ/exec",
  paymentReceiptPDFURL:
    "https://docs.google.com/spreadsheets/d/18UHgISSaFB0HXBcA9v0c6A3kjIhrnIr5p3LS9Mu727w/export?format=pdf&exportFormat=pdf&gid=1015786183&size=A4&portrait=true&fitw=true&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&sheetnames=false&printtitle=false&pagenum=UNDEFINED&gridlines=false&fzr=false",
};

let Rafikul_Server = {
  paymentReceiptFormGoogleURL:
    "https://script.google.com/macros/s/AKfycbwA3HTKjs-IGajuqW-7OW7yMOZdyGqJlQDb1-5SxLQV54mYWxJNBp1O8A05LckHBYlhSQ/exec",
  commercialPerformaInvoice:
    "https://script.google.com/macros/s/AKfycbwC1iFgTAYnzl1ngWQozg_fnHmjqiIFk-wjr7ysjUX0SD3WGKTOOepUruU4Vli_980/exec",
};

let NODE_URLS = {
  POSTGSTInvoiceNodeLocalhostURL: "http://localhost:5000/api/v1/gstinvoice/create",
  POSTGSTInvoiceNodeServerURL:"https://saicrmapi.shop/api/v1/gstinvoice/create",
  POSTCOMERCIALPIServerURL:"https://saicrmapi.shop/api/v1/commercialPerforma/create",
  POSTCOMERCIALPILocalURL:"http://localhost:5000/api/v1/commercialPerforma/create",
};

//MERN_LOCALHOST BASE URL
 let MernLocalhostURL= "http://localhost:5000/api/v1";
 let MernVPSURL_SK= "https://saicrmapi.shop/api/v1";
 let MernVPSURL= "https://solarcrmapi.com/api/v1";

const config = {
  proformaFormGoogleURL: GWS_SERVER.proformaFormGoogleURL,
  proformaInvoicePDFURL: GWS_SERVER.proformaInvoicePDFURL, 
  clientRegistrationGoogleURL: "www.reg.com",
  creditTransactionsGoogleURL: GWS_SERVER.creditTransactionsGoogleURL,
  debitTransactionsGoogleURL: GWS_SERVER.debitTransactionsGoogleURL,
  paymentReceiptFormGoogleURL: GWS_SERVER.paymentReceiptFormGoogleURL,
  paymentReceiptPDFURL: GWS_SERVER.paymentReceiptPDFURL,
  // paymentReceiptFormGoogleURL:Rafikul_Server.paymentReceiptFormGoogleURL,
  commercialPerformaInvoice: Rafikul_Server.commercialPerformaInvoice,
  getAllProformaInvoiceGoogleURL: GWS_SERVER.getAllProformaInvoiceGoogleURL,
  GetUpdateProformaStatus: GWS_SERVER.GetUpdateProformaStatus,
  GetPaymentDetails: GWS_SERVER.GetPaymentDetails,
  GetSetRowNumberInGoogleProformaInvoice: GWS_SERVER.GetSetRowNumberInGoogleProformaInvoice,
  POSTGSTInvoiceGoogleURL: GWS_SERVER.POSTGSTInvoiceGoogleURL,

  //NODE SERVER URL
  POSTGSTInvoiceURL:NODE_URLS.POSTGSTInvoiceNodeServerURL,
  PostCommercialPIURL:NODE_URLS.POSTCOMERCIALPIServerURL,

  
  MernBaseURL:MernVPSURL
};

export default config;
