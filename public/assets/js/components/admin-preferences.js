const key='queen-admin-preferences';
let memory={};
export function adminPreference(name,fallback){try{memory=JSON.parse(localStorage.getItem(key)||'{}');}catch{}return memory[name]??fallback;}
export function saveAdminPreference(name,value){memory[name]=value;try{localStorage.setItem(key,JSON.stringify(memory));}catch{}}
