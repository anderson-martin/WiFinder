var parentFunc = function () {
    console.log('parent');
    var childFunc1 = function () {
        console.log('ChildOne');
    };
    var childFunc2 = function () {
        console.log('ChildTwo');
    };
    return {
        return1: childFunc1()
        , return2: childFunc2()
    };
};


parentFunc.return1;
parentFunc.return1();
parentFunc.childFunc1;


if("potato" == 0){
    console.log('given argument is truthy');
} else {
        console.log('given argument is falsey');
}


var x = {
    toString: function () {return "foo";},
    valueOf: function () {return 2;}    
};




var a = {
    toString: function () {return "foo";},
    valueOf: function () {return 2;}    
};
var b = "X=";

pa = a.valueOf();
pb = b.valueOf();

console.log(pa);
console.log(pb);