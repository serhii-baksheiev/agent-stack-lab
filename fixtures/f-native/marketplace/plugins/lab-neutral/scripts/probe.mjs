const value=Number(process.argv[2]);
if(!Number.isInteger(value))throw new Error('integer required');
console.log(JSON.stringify({version:'1.0.0',input:value,squared:value*value}));
