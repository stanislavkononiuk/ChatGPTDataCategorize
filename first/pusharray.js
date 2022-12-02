let sortedarray =[];

const sortedarray_add = (usage , site)=> {
    let status_add = 0;
    for(let i=0; i<sortedarray.length; i++){
        if (sortedarray[i].usage == usage){
            for(let j=0; j<sortedarray[i].site.length; j++){
                if (sortedarray[i].site[j] == site){
                    status_add = 1;
                    break;
                }
            }
            if(status_add){
                break;
            }
            else{
                sortedarray[i].site.push(site);
                status_add = 1;
                break;
            }
        }
    }

    if(!status_add){
        sortedarray.push({ usage: [usage], site: [site]});
    }
}

sortedarray_add('man1', '123');
sortedarray_add('man', '123');
sortedarray_add('man', '123345');

sortedarray_add('man', '123345');


console.log(sortedarray);
// console.log(myArr[0].usage[0]);