
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };

    Expense.prototype.calcPecentage = function(totalIncome) {

        if(totalIncome> 0 ) {
            this.precentage = Math.round( (this.value / totalIncome) * 100 );
        } else {
            this.precentage = -1 ;
        }
    };

    Expense.prototype.getPrecentage = function() {

        return this.precentage ;
    };

    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotals = function(type) {
        var sum = 0 ;

        data.allItems[type].forEach(function(cur) { 
            sum = sum + cur.value ;
        });
        
        data.totals[type] = sum ;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget : 0,
        precentage: -1
    }; 
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Create New Id
            if (data.allItems[type].length > 0 ) {
                ID = data.allItems[type][data.allItems[type].length - 1 ].id + 1;
            } else {
                ID = 0;
            }
            
            // Create NewItem based on 'exp or 'inc
            if (type === 'exp') {
                newItem = new Expense (ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income (ID, des, val);
            }

            // Push it into Our data structure!
            data.allItems[type].push(newItem);

            // Return the new item!
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if ( index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {

            // calculate total income and expenses 
            calculateTotals('inc');
            calculateTotals('exp');

            // calculate total budget!
            data.budget = data.totals.inc - data.totals.exp ;

            // calculate Precentage of incomes!
            if (data.totals.inc > 0 ) {
                data.precentage = Math.round( (data.totals.exp / data.totals.inc)  * 100 );
            } else {
                data.precentage = -1;
            }
            
        },

        calculatePrecentage: function() {
            
            data.allItems.exp.forEach(function(current){
                current.calcPecentage(data.totals.inc);
            });
        },

        getPrecetages: function() {
            
            var allprec = data.allItems.exp.map(function(current){
                return current.getPrecentage();
            });
            return allprec;
        },

        getBudget: function() {
            
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage
            };
        },

        testing: function() {
            console.log(data)
        }
    };
})();


var UIController = (function(){ 
    var DOMstrings = {
        inputType:  '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        container : '.container',
        expensesPrecLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        };

    var nodeListForEach = function(list, callback) {
                for( var i = 0; i < list.length; i++ ) {
                    callback(list[i],i)
                }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp !
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            }
        },
        addListItam: function(obj,type) {

            var html, newHtml, element;

            //Create Html String with placeHolder
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">?%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 

            // Replace plaheholder with actual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%' , obj.description);
            newHtml = newHtml .replace('%value%', formatNumber(obj.value , type) );

            // Insert the Html on Dom 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        clearFields : function() {

            var fields, fieldsArr ;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
            
        },

        displayBudget: function(obj){
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';


            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc') ;
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp') ;

            if (obj.precentage > 0 ) {
                document.querySelector(DOMstrings.precentageLabel).textContent = obj.precentage + '%';
            } else {
                document.querySelector(DOMstrings.precentageLabel).textContent = '--';

            }
        },
        
        // // SEE THIS AGAIN!! 
        displayPrecentages: function(precentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPrecLabel);
            
            

            nodeListForEach(fields, function(current, index) {
                
                if (precentages[index] > 0) {
                    current.textContent = precentages[index] + '%';
                } else {
                    current.textContent = '--'
                }
            });
        },

        // THESE TWO YOU HAVE TO SE THEM AGAIN 
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        // DON'T FORGET!
        
        getDOMstrings: function () {
            return DOMstrings;
        }
    }
})();

var controller = (function(budgetCtrl, UICtrl) {

    var setEventListener = function() {

        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem );
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 ) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);        

    };

    var updateBudget = function () {
        
        // 1) calculate Budget!
        budgetCtrl.calculateBudget();
        // 2) Return the budget!
        var budget = budgetCtrl.getBudget();
        // 3) displat the budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePrecentages = function() {

        // 1. calculate precentegs
        budgetCtrl.calculatePrecentage();

        // 2. Read precentegs From the budget controller
        var precentages = budgetCtrl.getPrecetages();

        // 3. updata the UI Witgh the new Precentegs!
        UICtrl.displayPrecentages(precentages);
    }

    var ctrlAddItem = function() {

        var input, newItem ;
        // 1) Get the Input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            // 2) add it to our data structuer 
            newItem = budgetCtrl.addItem(input.type , input.description, input.value);

            // 3) add it to the UI 
            UICtrl.addListItam(newItem, input.type);

            // 4) Clear input and get focus back!
            UICtrl.clearFields();

            // 5) Calc and Update Budget!
            updateBudget();   

            // 6. Calculate and Update Precentegs! 
            updatePrecentages();
        }
    };
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID ;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemID.split('-');
        type = splitID[0];  
        ID = parseInt(splitID[1]); 

        // 1) Delete Item From Data Structure!
        budgetCtrl.deleteItem(type, ID );
        
        // 2. Delete Item From Ui 
        UICtrl.deleteListItem(itemID);

        // 3. UPdate and show the new budget!
        updateBudget();   
        
        // 4. Calculate and Update Precentegs! 
        updatePrecentages();
        
        
    }

    return {
        init : function() {
            console.log('The Listener is Set!');
            UICtrl.displayMonth();
            UICtrl.displayBudget ({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                precentage: -1

            });
            setEventListener();
        }
    }

})(budgetController, UIController);

controller.init();























