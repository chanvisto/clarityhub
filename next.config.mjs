const csp="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
export default {poweredByHeader:false,serverExternalPackages:['firebase-admin'],async headers(){return process.env.NODE_ENV!=='production'?[]:[{source:'/(.*)',headers:[
{key:'Content-Security-Policy',value:csp},{key:'Strict-Transport-Security',value:'max-age=63072000; includeSubDomains'},
{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}]}};
