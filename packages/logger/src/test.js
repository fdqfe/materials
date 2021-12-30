
  const res = []

function test(...args){

  res.push(args)

  // console.log('===>',res)
}

test(()=>{
  console.log(1)
},2,3)

const f1 = (...args) => {
  console.log(...args)
}


res.forEach(args => f1(...args))
