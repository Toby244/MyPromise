/*
const fs=require('fs');
const path=require('path');

let readFile=(filepath)=>{
    let p=new Promise((resolve,reject)=>{
        fs.readFile(filepath,'utf8',(err,content)=>{
            if (err) reject(err);
            else{
                resolve(content);
            }
        })
    });
    return p;
};

let filepath=path.join(__dirname,'../www','about.html');
let p=readFile(filepath);

p.then((data)=>{
    console.log(data);
},(err)=>{
    console.log(err);
})*/

const Promise=require('./Promise.js');
//const Promise=require('./Promise_class.js');

/*var p=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(1);
        console.log("status改变后...")
        //reject(2);
    },100)
    resolve(1);
});

//链式调用测试
p.then(value=>{
    console.log('onResolved1_'+value);
    return p;
},reason=>{
    console.log('onRejected1_'+reason);
}).then(value=>{
    console.log('onResolved2_'+value);
},reason=>{
    console.log('onRejected2_'+reason);
})*/

//循环调用
/*var p=new Promise((resolve,reject)=>{
    resolve();
});

let p1= p.then(()=>{
    return p1;
});

p1.then((data)=>{
    console.log(data);
},(err)=>{
    console.log(err);
})*/

//catch
/*var p=new Promise((resolve,reject)=>{
    throw 123;
});

p.catch((reason)=>{
    console.log(reason);
});*/

//resolve方法
/*p=Promise.resolve(new Promise((resolve,reject)=>{
    resolve("6666666666");
}));

p.then((data)=>{
    console.log("1");
    console.log(data);
},(err)=>{
    console.log(err);
})*/


//all,race
/*let p1=Promise.resolve("1111");
let p2=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(2222);
    },5000)
});

let p3=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(3333);
    },3000)
})

let p4=Promise.reject("AAAA");

let p=Promise.all([p1,p2,p3,p4]);
p.then((data)=>{
    console.log(data);
},(reason)=>{
    console.log(reason);
})*/

/*let p=Promise.race([p2,p3,p4]);
p.then((data)=>{
    console.log(data);
},(reason)=>{
    console.log(reason);
})*/

