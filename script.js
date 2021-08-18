
//------ Progress Bar (not MVC)----------

// function progressBar() {
//     let percentage = 0;
//     let change = 0.5;
//     let interval = 10;
//     let pbStatus = true;
//     let pbFilling = document.querySelector(".progress-bar-filling");
//     let btn = document.querySelector(".progress-bar-btn");

//     let processing = setInterval(update, interval);

//     function update() {
//         if(percentage === 0 && change < 0 || 
//             percentage === 100 && change > 0){
//                 change = -change;
//             }
//         percentage += change;
//         pbFilling.style.width = percentage + "%";
//     }

//     btn.addEventListener("click", function (e) {
//         btnAction();
//         btn.textContent = (btn.textContent === "STOP") ? "RESUME" : "STOP";
//     });

//     function btnAction() {
//         if (pbStatus) {
//             clearInterval(processing);
//         } else {
//             processing = setInterval(update, interval);
//         }
//         pbStatus = !pbStatus;
//     }
// }

// progressBar();


// --------------------- Progress Bar ------------------------
// -------------------- rewrote in MVC -----------------------
let new_pbModel = pbModel();
let pb_Container = document.querySelector(".progress-bar-container");
pbView(pb_Container, new_pbModel);

function pbModel() {
    let _percentage = 0;
    let _interval = 10;
    let _change = 0.5;
    let _pbStatus = true;
    let _subscriber;

    let processing = setInterval(_update, _interval);

    function _update() {
        if(_percentage === 0 && _change < 0 || 
            _percentage === 100 && _change > 0){
                _change = -_change;
            }
        _percentage += _change;

        _subscriber(_percentage);
    }

    function _action() {
        if (_pbStatus) {
            clearInterval(processing);
        }
        else {
            processing = setInterval(_update, _interval);
        }
        _pbStatus = !_pbStatus;
    }

    let _getPercentage = () => _percentage;
    
    return {
        subscribe: function(cb) {
            if(!_subscriber) {
                _subscriber = cb;
            }
        },
        action: _action,
        getPercentage: _getPercentage
    };
}

function pbView(container, model) {
    let progressBar = document.createElement("div");
    let pbFilling = document.createElement("div");
    let button = document.createElement("button");
    
    progressBar.setAttribute("class", "progress-bar");
    pbFilling.setAttribute("class", "progress-bar-filling");
    button.setAttribute("class", "progress-bar-btn");
    button.textContent = "STOP";

    container.appendChild(progressBar);
    container.appendChild(button);
    progressBar.appendChild(pbFilling);
    
    button.addEventListener("click", function(e) {
        model.action();
        button.textContent = (button.textContent === "STOP") ? "RESUME" : "STOP";
    });

    function render(percentage) {
        pbFilling.style.width = percentage + "%";
    }

    model.subscribe(render);
    render(model.getPercentage());
}



//----------------- Whack a Mole ----------------------------
//-----------------------------------------------------------
let new_gameModel = gameModel();
let game_Container = document.querySelector(".game-container");
gameView(game_Container, new_gameModel);

function gameModel() {
    let _data = {
        randomArr: [],
        score: 0,
        count: 0
    };
    let _subscriber;

    _data.randomArr = randomArray();

    let _getData = () => _data;

    function _initialData() {
        _data.randomArr = randomArray();
        _data.score = 0;
        _data.count = 0;

        _subscriber(_data);
    }

    function _action(change) {
        _data.randomArr = randomArray();
        _data.score += change;
        _data.count += 1;

        _subscriber(_data);
    }

    return {
        subscribe: function(cb) {
            if (!_subscriber) {
                _subscriber = cb;
            }
        },
        getData: _getData,
        initialData: _initialData,
        action: _action
    };
}

function gameView(container, model) {
    function render(data) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (data.count < 10) {
            let grid_container = document.createElement("div");
            let score_container = document.createElement("div");

            grid_container.setAttribute("class", "grid-container");
            score_container.setAttribute("class", "score-container");

            container.appendChild(grid_container);
            container.appendChild(score_container);
            
            for (let i = 1; i < 10; i++) {
                let cell = document.createElement("div");
                cell.setAttribute("class", "cell");
                cell.setAttribute("id", i);
                if (data.randomArr.includes(i)) {
                    cell.innerHTML = "M";
                }
                grid_container.appendChild(cell);
            }

            grid_container.addEventListener("click", function(e) {
                let change = 0;
                if (data.randomArr.includes(parseInt(e.target.id))) {
                    change = 1;
                }

                model.action(change);
            });
            
            let current_score = document.createElement("h1");
            current_score.textContent = "Current Score: " + data.score;
            score_container.appendChild(current_score);
            
        }
        else {
            let score_container = document.createElement("div");
            let final_score = document.createElement("h1");
            let restart_btn = document.createElement("h1");

            score_container.setAttribute("class", "score-container");
            restart_btn.setAttribute("class", "restart-btn");

            final_score.textContent = "Final Score: " + data.score;
            restart_btn.textContent = "Play Again";

            container.appendChild(score_container);
            score_container.appendChild(final_score);
            score_container.appendChild(restart_btn);

            restart_btn.addEventListener("click", function(e) {
                model.initialData();
            })
        }
    }

    model.subscribe(render);
    render(model.getData());
}

function randomArray() {
    let arr = [];
    arr[0] = Math.floor(Math.random() * 9 + 1);

    do {
        arr[1] = Math.floor(Math.random() * 9 + 1);
    } while (arr[1] === arr[0]);

    do {
        arr[2] = Math.floor(Math.random() * 9 + 1);
    } while (arr[2] === arr[1] || arr[2] === arr[0]);

    return arr;
}



//------------------- Search Bar ---------------------
//----------------------------------------------------

function debounce(func, timeout = 600) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

//----------------- API ---------------------
const API_URL = "https://pokeapi.co/api/v2/pokemon/?limit=100";

apiSearch(API_URL);

function apiSearch(url) {
    let search_bar_box_api = document.getElementById("api");
    let input_api = search_bar_box_api.querySelector("input");
    let autocom_list_api = search_bar_box_api.querySelector(".autocom-list");

    let cache = [];

    fetch(url)
    .then (res => res.json())
    .then (json => {
            for (let item of json.results) {
                cache.push(item.name);
            }
    });

    let debouncedShowList = debounce(showAutoComList);

    input_api.addEventListener("input", function(e) {
        let input_text = e.target.value;
        debouncedShowList(input_text, cache);
    });

    autocom_list_api.addEventListener("click", function(e) {
        input_api.value = e.target.id;
        autocom_list_api.classList.remove("active");
    });

    document.addEventListener("click", function(e) {
        let click_target = e.target;
        if (click_target !== input_api || click_target !== autocom_list_api.children) {
            autocom_list_api.classList.remove("active");
        }
    });

    function showAutoComList(inputData, data) {
        let options = [];
        let temp = [];
        
        while (autocom_list_api.firstChild) {
            autocom_list_api.removeChild(autocom_list_api.firstChild);
        }

        if (!data) return;

        if(inputData) {
            options = data.filter(item => {
                return item.startsWith(inputData);
            });
            temp = options;

            options = options.map( item => {
                return editOption(inputData, item);
            })
            
            for (let i = 0; i < options.length; i++) {
                let option = document.createElement("li");
                option.setAttribute("id", temp[i]);
                option.innerHTML = options[i];
                autocom_list_api.appendChild(option);
            }
            autocom_list_api.classList.add("active");
        }
        else {
            autocom_list_api.classList.remove("active");
        }
    }

    function editOption(input, dataText) {
        let input_length = input.length;
        let option = `<strong>${dataText.slice(0, input_length)}</strong>${dataText.slice(input_length)}`;
        return option; 
    }
}


//------------------- LOCAL --------------------
const OPTIONS = [
    "AL", "AK", "AZ", "AR", "CA",
    "CO", "CT", "DE", "DC", "FL",
    "GA", "GU", "HI", "ID", "IL",
    "IN", "IA", "KS", "KY", "LA",
    "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV",
    "NH", "NJ", "NM", "NY", "NC",
    "ND", "OH", "OK", "OR", "PA",
    "PR", "RI", "SC", "SD", "TN",
    "TX", "UT", "VT", "VA", "VI",
    "WA", "WV", "WI", "WY"
];

localSearch(OPTIONS);

function localSearch(localData) {
    let search_bar_box_local = document.getElementById("local");
    let input_local = search_bar_box_local.querySelector("input");
    let autocom_list_local = search_bar_box_local.querySelector(".autocom-list");

    if(!localData) return;

    let debouncedShowList = debounce(showAutoComList);

    input_local.addEventListener("input", function(e) {
        let input_text = e.target.value;
        debouncedShowList(input_text, localData);
    });

    autocom_list_local.addEventListener("click", function(e) {
        input_local.value = e.target.innerHTML;
        autocom_list_local.classList.remove("active");
    });

    document.addEventListener("click", function(e) {
        let click_target = e.target;
        if (click_target !== input_local || click_target !== autocom_list_local.children) {
            autocom_list_local.classList.remove("active");
        }
    });

    function showAutoComList(inputData, data) {
        let options = [];
        let listData = "";

        if(inputData) {
            options = data.filter(item => {
                return item.includes(inputData);
            });

            options = options.map( item => {
                return item = "<li>" + item + "</li>";
            })
            
            if(options.length) {
                listData = options.join("");
            }
            autocom_list_local.innerHTML = listData;
            autocom_list_local.classList.add("active");
        }
        else {
            autocom_list_local.classList.remove("active");
        }
    }

}