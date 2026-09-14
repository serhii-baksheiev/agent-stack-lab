// Repository API responses may contain temporary credentials. Persist only proof fields.
export function safeRepoMetadata(value){return Object.fromEntries(['id','full_name','private','html_url','default_branch'].filter(k=>Object.hasOwn(value,k)).map(k=>[k,value[k]]));}
